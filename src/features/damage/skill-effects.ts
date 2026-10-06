/**
 * The curated skill-effect table (#07): what each modelled skill adds to the
 * damage model, per level, with the source of every number.
 *
 * Sourcing rule: a number appears here only if it was read from a page fetched on
 * `RETRIEVED_AT`. MHDB (`MHDB_SKILLS`, https://wilds.mhdb.io/en/skills) states
 * the values of most skills explicitly in its rank descriptions; those entries
 * are cross-checked against a stored copy of the descriptions by
 * `skill-effects.test.ts` (through `mhdb-parse.ts`). Three skills are only vague
 * on MHDB ("a bigger stat boost") and take their values from Game8's skill
 * pages instead: Burst, Critical Element and Coalescence. Anything neither
 * source states is listed in `NOT_MODELLED_SKILLS`, never guessed.
 *
 * Game8 pages used (all stamped "updated 2025-12-24"):
 *  - Burst            https://game8.co/games/Monster-Hunter-Wilds/archives/501644
 *  - Critical Element https://game8.co/games/Monster-Hunter-Wilds/archives/501573
 *  - Coalescence      https://game8.co/games/Monster-Hunter-Wilds/archives/501948
 * Cross-reference for Critical Boost: WIGGLER
 * (https://wiggler.pet/other/guides/intermediate_damage_calculation) lists the
 * same 1.28 ... 1.40 progression as MHDB's "to 28% ... 40%".
 */

import { GAME_VERSION, RETRIEVED_AT } from "./tables";
import type {
  ElementKey,
  SkillEffect,
  SkillEffectEntry,
  WeaponKind,
} from "./types";

const MHDB_SKILLS = "https://wilds.mhdb.io/en/skills";
const GAME8_BURST =
  "https://game8.co/games/Monster-Hunter-Wilds/archives/501644";
const GAME8_CRIT_ELEMENT =
  "https://game8.co/games/Monster-Hunter-Wilds/archives/501573";
const GAME8_COALESCENCE =
  "https://game8.co/games/Monster-Hunter-Wilds/archives/501948";

const stamp = { gameVersion: GAME_VERSION, retrievedAt: RETRIEVED_AT };

type Row = Pick<
  SkillEffectEntry,
  | "condition"
  | "component"
  | "weapons"
  | "element"
  | "requiresWeakPoint"
  | "approximate"
>;

/** One entry per level, `effects[0]` being level 1. */
const levels = (
  skill: string,
  effects: SkillEffect[],
  source: string[],
  row: Row,
): SkillEffectEntry[] =>
  effects.map((effect, index) => ({
    skill,
    level: index + 1,
    effect,
    ...row,
    source,
    ...stamp,
  }));

const always: Row = { condition: null };
const when = (condition: string, extra: Partial<Row> = {}): Row => ({
  condition,
  ...extra,
});

const elementAttack = (skill: string, element: ElementKey) =>
  levels(
    skill,
    [
      { elementFlat: 40 },
      { elementPct: 0.1, elementFlat: 50 },
      { elementPct: 0.2, elementFlat: 60 },
    ],
    [MHDB_SKILLS],
    { ...always, element },
  );

/** Weapon groups Game8 splits Burst's values by. */
const BURST_GROUPS: { weapons: WeaponKind[]; raw: number[]; element: number[] }[] =
  [
    {
      weapons: ["great-sword", "hunting-horn"],
      raw: [10, 12, 14, 16, 18],
      element: [80, 100, 120, 160, 200],
    },
    {
      weapons: ["dual-blades"],
      raw: [8, 10, 12, 15, 18],
      element: [40, 60, 80, 100, 120],
    },
    {
      weapons: ["bow", "light-bowgun", "heavy-bowgun"],
      raw: [6, 7, 8, 9, 10],
      element: [40, 60, 80, 100, 120],
    },
    {
      weapons: [
        "long-sword",
        "sword-shield",
        "hammer",
        "lance",
        "gunlance",
        "switch-axe",
        "charge-blade",
        "insect-glaive",
      ],
      raw: [8, 10, 12, 15, 18],
      element: [60, 80, 100, 120, 140],
    },
  ];

/** Weapon groups Game8 splits Critical Element and Coalescence by. */
const HEAVY_WEAPONS: WeaponKind[] = [
  "great-sword",
  "hammer",
  "hunting-horn",
  "gunlance",
  "switch-axe",
  "charge-blade",
];
const LIGHT_WEAPONS: WeaponKind[] = [
  "long-sword",
  "sword-shield",
  "dual-blades",
  "lance",
  "insect-glaive",
  "light-bowgun",
  "heavy-bowgun",
  "bow",
];

const BURST_CONDITION = "after 5 successive hits (the boost lasts 3-5 s)";

export const SKILL_EFFECTS: SkillEffectEntry[] = [
  // ---- MHDB: always on ----------------------------------------------------
  ...levels(
    "Attack Boost",
    [
      { attackFlat: 3 },
      { attackFlat: 5 },
      { attackFlat: 7 },
      { attackPct: 0.02, attackFlat: 8 },
      { attackPct: 0.04, attackFlat: 9 },
    ],
    [MHDB_SKILLS],
    always,
  ),
  ...levels(
    "Critical Eye",
    [0.04, 0.08, 0.12, 0.16, 0.2].map((affinity) => ({ affinity })),
    [MHDB_SKILLS],
    always,
  ),
  // MHDB: "Increases damage dealt by critical hits to 28%" ... "40%"; the
  // base is +25%, so the multiplier is 1 + that figure (WIGGLER lists 1.28 ... 1.40).
  ...levels(
    "Critical Boost",
    [1.28, 1.31, 1.34, 1.37, 1.4].map((critDamage) => ({ critDamage })),
    [MHDB_SKILLS, "https://wiggler.pet/other/guides/intermediate_damage_calculation"],
    always,
  ),
  ...elementAttack("Fire Attack", "fire"),
  ...elementAttack("Water Attack", "water"),
  ...elementAttack("Thunder Attack", "thunder"),
  ...elementAttack("Ice Attack", "ice"),
  ...elementAttack("Dragon Attack", "dragon"),

  // ---- MHDB: conditional ---------------------------------------------------
  ...levels(
    "Agitator",
    [
      { attackFlat: 4, affinity: 0.03 },
      { attackFlat: 8, affinity: 0.05 },
      { attackFlat: 12, affinity: 0.07 },
      { attackFlat: 16, affinity: 0.1 },
      { attackFlat: 20, affinity: 0.15 },
    ],
    [MHDB_SKILLS],
    when("while the monster is enraged"),
  ),
  ...levels(
    "Peak Performance",
    [3, 6, 10, 15, 20].map((attackFlat) => ({ attackFlat })),
    [MHDB_SKILLS],
    when("while health is full"),
  ),
  ...levels(
    "Resentment",
    [5, 10, 15, 20, 25].map((attackFlat) => ({ attackFlat })),
    [MHDB_SKILLS],
    when("while there is recoverable (red) health"),
  ),
  ...levels(
    "Counterstrike",
    [10, 15, 25].map((attackFlat) => ({ attackFlat })),
    [MHDB_SKILLS],
    when("after being knocked back"),
  ),
  ...levels(
    "Adrenaline Rush",
    [10, 15, 20, 25, 30].map((attackFlat) => ({ attackFlat })),
    [MHDB_SKILLS],
    when("after a perfectly timed evade"),
  ),
  ...levels(
    "Maximum Might",
    [0.1, 0.2, 0.3].map((affinity) => ({ affinity })),
    [MHDB_SKILLS],
    when("while stamina has been kept full"),
  ),
  ...levels(
    "Latent Power",
    [0.1, 0.2, 0.3, 0.4, 0.5].map((affinity) => ({ affinity })),
    [MHDB_SKILLS],
    when("while its trigger conditions are met"),
  ),
  ...levels(
    "Offensive Guard",
    [0.05, 0.1, 0.15].map((attackPct) => ({ attackPct })),
    [MHDB_SKILLS],
    when("after a perfectly timed guard"),
  ),
  // L1 only raises defense; L2-L5 add attack percentages (MHDB).
  ...levels(
    "Heroics",
    [{}, { attackPct: 0.05 }, { attackPct: 0.05 }, { attackPct: 0.1 }, { attackPct: 0.3 }],
    [MHDB_SKILLS],
    when("while health is 35% or lower"),
  ),
  ...levels(
    "Foray",
    [
      { attackFlat: 6 },
      { attackFlat: 8, affinity: 0.05 },
      { attackFlat: 10, affinity: 0.1 },
      { attackFlat: 12, affinity: 0.15 },
      { attackFlat: 15, affinity: 0.2 },
    ],
    [MHDB_SKILLS],
    when("while the large monster is poisoned or paralysed"),
  ),
  // MHDB: "Affinity +50%" ... "+100%", on draw attacks (skill description).
  ...levels(
    "Critical Draw",
    [0.5, 0.75, 1].map((affinity) => ({ affinity })),
    [MHDB_SKILLS],
    when("on draw attacks (set uptime to their share of your hits)"),
  ),
  // MHDB: "Draw attacks ... gain attack +3 / +5 / +7".
  ...levels(
    "Punishing Draw",
    [3, 5, 7].map((attackFlat) => ({ attackFlat })),
    [MHDB_SKILLS],
    when("on draw attacks (set uptime to their share of your hits)"),
  ),

  // Weakness Exploit: the weak-point part applies whenever the chosen part is a
  // weak point; the wound part is weighted by its own "wound uptime".
  ...levels(
    "Weakness Exploit",
    [0.05, 0.1, 0.15, 0.2, 0.3].map((weakPointAffinity) => ({ weakPointAffinity })),
    [MHDB_SKILLS],
    { condition: null, requiresWeakPoint: true },
  ),
  ...levels(
    "Weakness Exploit",
    [0.03, 0.05, 0.1, 0.15, 0.2].map((woundAffinity) => ({ woundAffinity })),
    [MHDB_SKILLS],
    when("while the part is wounded", {
      component: "wounds",
      requiresWeakPoint: true,
    }),
  ),

  // ---- Game8: values MHDB does not state -------------------------------------
  // Burst: Raw / Element values after 5 successive hits (Game8 tables; elemental
  // in displayed element units). The first-hit "small boost" is not modelled.
  ...BURST_GROUPS.flatMap((group) =>
    levels(
      "Burst",
      group.raw.map((attackFlat, index) => ({
        attackFlat,
        elementFlat: group.element[index],
      })),
      [GAME8_BURST],
      when(BURST_CONDITION, { weapons: group.weapons }),
    ),
  ),
  // Critical Element: Game8 gives Fast weapons 1.05 / 1.1 / 1.15 and Heavy
  // weapons "≈1.07 / ≈1.13 / 1.2"; the two approximate figures are flagged.
  ...levels(
    "Critical Element",
    [1.05, 1.1, 1.15].map((critElement) => ({ critElement })),
    [GAME8_CRIT_ELEMENT],
    { ...always, weapons: LIGHT_WEAPONS },
  ),
  ...levels(
    "Critical Element",
    [1.07, 1.13, 1.2].map((critElement) => ({ critElement })),
    [GAME8_CRIT_ELEMENT],
    { ...always, weapons: HEAVY_WEAPONS, approximate: true },
  ),
  // Coalescence: element multipliers per Game8; duration 30 s after recovering
  // from a blight or abnormal status.
  ...levels(
    "Coalescence",
    [1.05, 1.1, 1.15].map((elementMultiplier) => ({ elementMultiplier })),
    [GAME8_COALESCENCE],
    when("for 30 s after recovering from a blight or abnormal status", {
      weapons: LIGHT_WEAPONS,
    }),
  ),
  ...levels(
    "Coalescence",
    [1.1, 1.2, 1.3].map((elementMultiplier) => ({ elementMultiplier })),
    [GAME8_COALESCENCE],
    when("for 30 s after recovering from a blight or abnormal status", {
      weapons: HEAVY_WEAPONS,
    }),
  ),
];

/** Skills with a table entry. */
export const MODELLED_SKILLS: string[] = [
  ...new Set(SKILL_EFFECTS.map((entry) => entry.skill)),
];

export type NotModelledSkill = { skill: string; reason: string };

const NO_VALUES =
  "MHDB gives no numbers and no fetched source confirms them";
const MOVE_SPECIFIC =
  "applies to specific moves or ammo only; the share of hits it covers is not modelled";
const SHARPNESS_UPKEEP =
  "keeps sharpness up rather than adding damage; the model holds one sharpness colour";

/**
 * Damage-relevant skills deliberately left out, with why. A skill in the build
 * that is listed here is shown as "not modelled" in the panel. Skills that touch
 * neither damage nor sharpness (defense, healing, ...) are not listed at all.
 */
export const NOT_MODELLED_SKILLS: NotModelledSkill[] = [
  { skill: "Handicraft", reason: "how its sharpness points spread across colours is undocumented in the sources; pick the sharpness colour by hand" },
  { skill: "Razor Sharp", reason: SHARPNESS_UPKEEP },
  { skill: "Master's Touch", reason: SHARPNESS_UPKEEP },
  { skill: "Protective Polish", reason: SHARPNESS_UPKEEP },
  { skill: "Speed Sharpening", reason: SHARPNESS_UPKEEP },
  { skill: "Bladescale Honing", reason: SHARPNESS_UPKEEP },
  { skill: "Grillmaster", reason: `${NO_VALUES}; also adds sharpness` },
  { skill: "Mind's Eye", reason: "needs the hardness threshold of 'hard' parts, which no fetched source states" },
  { skill: "Convert Element", reason: NO_VALUES },
  { skill: "Convert Thunder Resistance", reason: NO_VALUES },
  { skill: "Convert Water Resistance", reason: NO_VALUES },
  { skill: "Bludgeoner", reason: NO_VALUES },
  { skill: "Charge Master", reason: NO_VALUES },
  { skill: "Charge Up", reason: NO_VALUES },
  { skill: "Slicked Blade", reason: NO_VALUES },
  { skill: "Self-Improvement", reason: NO_VALUES },
  { skill: "Antivirus", reason: NO_VALUES },
  { skill: "Flayer", reason: NO_VALUES },
  { skill: "Ambush", reason: NO_VALUES },
  { skill: "Partbreaker", reason: NO_VALUES },
  { skill: "Airborne", reason: NO_VALUES },
  { skill: "Synergy", reason: NO_VALUES },
  { skill: "Power Stone", reason: NO_VALUES },
  { skill: "Darkside", reason: NO_VALUES },
  { skill: "Whiteflame Torrent", reason: NO_VALUES },
  { skill: "Crackling Cornpopper", reason: NO_VALUES },
  { skill: "Rapid Morph", reason: NO_VALUES },
  { skill: "Artillery", reason: MOVE_SPECIFIC },
  { skill: "Ballistics", reason: MOVE_SPECIFIC },
  { skill: "Normal Shots", reason: MOVE_SPECIFIC },
  { skill: "Spread/Power Shots", reason: MOVE_SPECIFIC },
  { skill: "Piercing Shots", reason: MOVE_SPECIFIC },
  { skill: "Tetrad Shot", reason: MOVE_SPECIFIC },
  { skill: "Opening Shot", reason: MOVE_SPECIFIC },
  { skill: "Critical Status", reason: "status buildup, not damage" },
  { skill: "Bombardier", reason: "item damage, not weapon damage" },
];

export const isModelled = (skill: string): boolean =>
  MODELLED_SKILLS.includes(skill);

/** Uptime slider key: the skill, or `skill/component` for a separately weighted part. */
export const uptimeKey = (entry: Pick<SkillEffectEntry, "skill" | "component">) =>
  entry.component ? `${entry.skill}/${entry.component}` : entry.skill;

/**
 * Entries that apply to a skill at `level` for this weapon: for each weapon
 * group / component the entry with the highest level not above `level`.
 * Elemental-attack entries are returned regardless of the weapon's element;
 * `efr.ts` decides whether they bite.
 */
export const entriesFor = (
  skill: string,
  level: number,
  kind: WeaponKind,
): SkillEffectEntry[] => {
  const best = new Map<string, SkillEffectEntry>();
  for (const entry of SKILL_EFFECTS) {
    if (entry.skill !== skill || entry.level > level) continue;
    if (entry.weapons && !entry.weapons.includes(kind)) continue;
    const key = entry.component ?? "";
    const current = best.get(key);
    if (!current || entry.level > current.level) best.set(key, entry);
  }
  return [...best.values()];
};
