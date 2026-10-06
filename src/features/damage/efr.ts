/**
 * Effective damage ("EFR") of a weapon against one monster part, with the
 * build's skills weighted by how often each is active. Pure and framework-free.
 *
 * Formulas (every constant lives, with its sources, in `tables.ts` /
 * `skill-effects.ts`):
 *
 *  1. Attack          A  = trueRaw x (1 + sum attackPct) + sum attackFlat
 *     The catalog's `damage.raw` is already the true raw (display value divided by
 *     the weapon-class multiplier); Wilds can show true raw in-game (Fextralife
 *     "Attack Power"), and flat skill bonuses are read as true-raw points like
 *     MHDB's "Attack +8". Percent bonuses are summed before they multiply; no
 *     source states how two percent sources combine, so they are treated as
 *     additive (follow-up).
 *  2. Affinity        a  = clamp(weaponAffinity + sum affinity, -1, +1)
 *  3. Crit multiplier m  = 1 + a x (cm - 1) for a >= 0, with cm = 1.25 or the
 *     Critical Boost figure (1.28 ... 1.40); m = 1 + a x 0.25 for a < 0 (a
 *     blunder deals 0.75x). This is the expected value over crits, the same shape
 *     as the worked example 1 + 0.95 x 0.34 = 1.323 on wiggler.pet.
 *  4. Effective raw per 100 motion value on the part
 *                      raw = A x sharpnessRaw x hitzone[damageType] x m
 *     Game8's "((Attack / Bloat) x Sharpness x Motion Value x Hitzone x Quest and
 *     Rage Modifier) x Critical Modifiers"; the motion value is fixed at 100 (1.0),
 *     the quest and rage modifier at 1 (not modelled). `efr` is the same without the
 *     hitzone, the community's "effective raw".
 *  5. Element         E  = ((displayElement x (1 + sum elementPct)) + sum elementFlat) / 10
 *                      element = E x (1 + sum elementMultiplier delta) x sharpnessElement
 *                                x hitzone[element] x (1 + a x sum critElement delta, a > 0)
 *     Game8's "((Elem. Damage / 10) x [Elem. Sharpness Modifier] x [Elem. Hitzone
 *     Value] x [Quest and Rage Modifier]) x [Elem. Critical Modifiers]". Affinity
 *     only reaches elemental damage through Critical Element (Fextralife "Weapon
 *     Mechanics"); a blunder does not reduce it. The ((base x pct) + flat) order
 *     follows wiggler.pet's "(((Base Ele x Ele%) + Flat Ele) x Post Ele)". Not
 *     modelled: the per-move element modifier and the elemental attack cap
 *     (a single unconfirmed source).
 *  6. Weakness Exploit applies only to a weak point: the part's hitzone for the
 *     weapon's damage type is >= 0.45 (a community line, see tables.ts).
 *  7. Uptime. Every conditional skill has an uptime u in [0, 1]. Its bonuses are
 *     weighted by u *before* the formulas above run (a "linear expectation" of the
 *     inputs): at u = 0 the skill contributes nothing, exactly as if absent; at
 *     u = 1 it is always active. This is an approximation: the real expectation of
 *     a product (attack x crit) is not the product of expectations, so two skills
 *     that overlap in time are treated as independent. Each skill's `delta` is
 *     leave-one-out: the total with it minus the total without it.
 */

import {
  BASE_CRIT_MULTIPLIER,
  ELEMENT_DISPLAY_DIVISOR,
  NEGATIVE_CRIT_MULTIPLIER,
  RANGED_KINDS,
  SHARPNESS_MODIFIERS,
  WEAK_POINT_THRESHOLD,
  WEAPON_DAMAGE_TYPE,
} from "./tables";
import {
  NOT_MODELLED_SKILLS,
  entriesFor,
  isModelled,
  uptimeKey,
  type NotModelledSkill,
} from "./skill-effects";
import type {
  DamageType,
  ElementKey,
  PartMultipliers,
  SharpnessColor,
  SkillEffectEntry,
  WeaponKind,
} from "./types";

export type EfrWeapon = {
  kind: WeaponKind;
  /** True raw (the catalog's `damage.raw`). */
  trueRaw: number;
  /** Affinity in percent as the catalog stores it (15 = +15%). */
  affinity: number;
  /** The weapon's visible element, if it has one; status specials do not count. */
  element: { name: ElementKey; display: number } | null;
  /** Sharpness colour the weapon is held at; `null` for weapons without sharpness. */
  sharpness: SharpnessColor | null;
};

export type EfrInput = {
  weapon: EfrWeapon;
  /** Hitzone multipliers of the target part, 0-1. */
  multipliers: PartMultipliers;
  /** Build skill levels by catalog name. */
  skills: Record<string, number>;
  /** Uptime 0-1 by `uptimeKey`. */
  uptimes?: Record<string, number>;
  /** Uptime of a conditional skill with no entry in `uptimes`; defaults to always active (1). */
  defaultUptime?: number;
};

/** Sums of the weighted skill bonuses (see formula 7). */
export type Bonuses = {
  attackFlat: number;
  attackPct: number;
  affinity: number;
  elementFlat: number;
  elementPct: number;
  /** Added to 1 to form the Coalescence multiplier. */
  elementMultiplier: number;
  /** Added to the base crit multiplier (Critical Boost). */
  critDamage: number;
  /** Added to 1 to form the Critical Element multiplier. */
  critElement: number;
};

export type SkillPart = {
  key: string;
  /** `null`: always on, no slider. */
  condition: string | null;
  uptime: number;
  applies: boolean;
  inactiveReason?: string;
};

export type SkillRow = {
  skill: string;
  level: number;
  parts: SkillPart[];
  /** What the skill adds after uptime weighting. */
  applied: Bonuses;
  /** Leave-one-out change in effective raw and element, per 100 MV. */
  rawDelta: number;
  elementDelta: number;
  /** A value used here is quoted approximately by its source. */
  approximate: boolean;
};

export type EfrResult = {
  damageType: DamageType;
  hitzone: number;
  elementHitzone: number | null;
  weakPoint: boolean;
  sharpnessColor: SharpnessColor | null;
  attack: number;
  affinity: number;
  critMultiplier: number;
  /** Effective raw: attack x sharpness x crit, no hitzone. */
  efr: number;
  /** Per-hit raw damage at 100 motion value on the part. */
  effectiveRaw: number;
  /** Per-hit element damage on the part; 0 without an element. */
  effectiveElement: number;
  /** effectiveRaw + effectiveElement. */
  total: number;
  skills: SkillRow[];
  notModelled: NotModelledSkill[];
  /** Ranged weapons: motion values and hitzone families only approximate. */
  approximate: boolean;
};

const EMPTY_BONUSES: Bonuses = {
  attackFlat: 0,
  attackPct: 0,
  affinity: 0,
  elementFlat: 0,
  elementPct: 0,
  elementMultiplier: 0,
  critDamage: 0,
  critElement: 0,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const clampUptime = (value: number | undefined): number =>
  value === undefined ? 1 : clamp(value, 0, 1);

type Applicability = { applies: boolean; inactiveReason?: string };

const applicability = (
  entry: SkillEffectEntry,
  weapon: EfrWeapon,
  weakPoint: boolean,
): Applicability => {
  if (entry.element && weapon.element?.name !== entry.element) {
    return {
      applies: false,
      inactiveReason: `Weapon has no ${entry.element} element`,
    };
  }
  if (entry.requiresWeakPoint && !weakPoint) {
    return { applies: false, inactiveReason: "Part is not a weak point" };
  }
  return { applies: true };
};

/** The entry's weighted contribution; zeroes when it does not apply. */
const weigh = (entry: SkillEffectEntry, uptime: number): Bonuses => {
  const e = entry.effect;
  return {
    attackFlat: (e.attackFlat ?? 0) * uptime,
    attackPct: (e.attackPct ?? 0) * uptime,
    affinity:
      ((e.affinity ?? 0) + (e.weakPointAffinity ?? 0) + (e.woundAffinity ?? 0)) *
      uptime,
    elementFlat: (e.elementFlat ?? 0) * uptime,
    elementPct: (e.elementPct ?? 0) * uptime,
    elementMultiplier: e.elementMultiplier ? (e.elementMultiplier - 1) * uptime : 0,
    critDamage: e.critDamage ? (e.critDamage - BASE_CRIT_MULTIPLIER) * uptime : 0,
    critElement: e.critElement ? (e.critElement - 1) * uptime : 0,
  };
};

const addBonuses = (a: Bonuses, b: Bonuses): Bonuses => ({
  attackFlat: a.attackFlat + b.attackFlat,
  attackPct: a.attackPct + b.attackPct,
  affinity: a.affinity + b.affinity,
  elementFlat: a.elementFlat + b.elementFlat,
  elementPct: a.elementPct + b.elementPct,
  elementMultiplier: a.elementMultiplier + b.elementMultiplier,
  critDamage: a.critDamage + b.critDamage,
  critElement: a.critElement + b.critElement,
});

type Resolved = {
  skill: string;
  level: number;
  parts: (SkillPart & { bonuses: Bonuses; approximate: boolean })[];
};

const resolveSkills = (input: EfrInput, weakPoint: boolean): Resolved[] => {
  const resolved: Resolved[] = [];
  for (const [skill, level] of Object.entries(input.skills)) {
    if (level <= 0 || !isModelled(skill)) continue;
    const entries = entriesFor(skill, level, input.weapon.kind);
    if (entries.length === 0) continue;
    resolved.push({
      skill,
      level,
      parts: entries.map((entry) => {
        const key = uptimeKey(entry);
        const uptime =
          entry.condition === null
            ? 1
            : clampUptime(input.uptimes?.[key] ?? input.defaultUptime);
        const { applies, inactiveReason } = applicability(
          entry,
          input.weapon,
          weakPoint,
        );
        return {
          key,
          condition: entry.condition,
          uptime,
          applies,
          inactiveReason,
          bonuses: applies ? weigh(entry, uptime) : EMPTY_BONUSES,
          approximate: Boolean(entry.approximate) && applies,
        };
      }),
    });
  }
  return resolved;
};

type Evaluation = {
  attack: number;
  affinity: number;
  critMultiplier: number;
  efr: number;
  effectiveRaw: number;
  effectiveElement: number;
};

const evaluate = (
  input: EfrInput,
  bonuses: Bonuses,
  hitzone: number,
  elementHitzone: number,
): Evaluation => {
  const { weapon } = input;
  const attack = weapon.trueRaw * (1 + bonuses.attackPct) + bonuses.attackFlat;
  const affinity = clamp(weapon.affinity / 100 + bonuses.affinity, -1, 1);
  const critBase = BASE_CRIT_MULTIPLIER + bonuses.critDamage;
  const critMultiplier =
    affinity >= 0
      ? 1 + affinity * (critBase - 1)
      : 1 + affinity * (1 - NEGATIVE_CRIT_MULTIPLIER);
  const sharpness = weapon.sharpness
    ? SHARPNESS_MODIFIERS[weapon.sharpness]
    : { raw: 1, element: 1 };

  const efr = attack * sharpness.raw * critMultiplier;
  const effectiveRaw = efr * hitzone;

  let effectiveElement = 0;
  if (weapon.element) {
    const elementValue =
      (weapon.element.display * (1 + bonuses.elementPct) + bonuses.elementFlat) /
      ELEMENT_DISPLAY_DIVISOR;
    const critElement = affinity > 0 ? 1 + affinity * bonuses.critElement : 1;
    effectiveElement =
      elementValue *
      (1 + bonuses.elementMultiplier) *
      sharpness.element *
      elementHitzone *
      critElement;
  }
  return { attack, affinity, critMultiplier, efr, effectiveRaw, effectiveElement };
};

export const computeEfr = (input: EfrInput): EfrResult => {
  const { weapon, multipliers } = input;
  const damageType = WEAPON_DAMAGE_TYPE[weapon.kind];
  const hitzone = multipliers[damageType];
  const weakPoint = hitzone >= WEAK_POINT_THRESHOLD;
  const elementHitzone = weapon.element ? multipliers[weapon.element.name] : null;

  const resolved = resolveSkills(input, weakPoint);
  const sum = (skip?: string): Bonuses =>
    resolved
      .filter((row) => row.skill !== skip)
      .flatMap((row) => row.parts)
      .reduce((total, part) => addBonuses(total, part.bonuses), EMPTY_BONUSES);

  const run = (bonuses: Bonuses) =>
    evaluate(input, bonuses, hitzone, elementHitzone ?? 0);
  const full = run(sum());

  const skills: SkillRow[] = resolved.map((row) => {
    const without = run(sum(row.skill));
    return {
      skill: row.skill,
      level: row.level,
      parts: row.parts.map(({ bonuses: _bonuses, approximate: _a, ...part }) => part),
      applied: row.parts.reduce((total, part) => addBonuses(total, part.bonuses), EMPTY_BONUSES),
      rawDelta: full.effectiveRaw - without.effectiveRaw,
      elementDelta: full.effectiveElement - without.effectiveElement,
      approximate: row.parts.some((part) => part.approximate),
    };
  });

  return {
    damageType,
    hitzone,
    elementHitzone,
    weakPoint,
    sharpnessColor: weapon.sharpness,
    attack: full.attack,
    affinity: full.affinity,
    critMultiplier: full.critMultiplier,
    efr: full.efr,
    effectiveRaw: full.effectiveRaw,
    effectiveElement: full.effectiveElement,
    total: full.effectiveRaw + full.effectiveElement,
    skills,
    notModelled: NOT_MODELLED_SKILLS.filter(
      ({ skill }) => (input.skills[skill] ?? 0) > 0,
    ),
    approximate: RANGED_KINDS.includes(weapon.kind),
  };
};
