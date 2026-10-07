/**
 * Artian / Gogma Artian stat derivation for the editor (backend ADR-0014).
 *
 * Every number comes from the `ArtianRules` table served by the backend
 * (`GET /api/mh-wilds/artian-rules`); only the *procedure* lives here, and it
 * mirrors the backend's `deriveArtianStats` so the editor's live totals equal what
 * the API snapshots on save. Both sides are pinned by the same worked examples.
 */

import type {
  ArtianCustomization,
  ArtianElement,
  ArtianReinforcement,
  ArtianReinforcementLevel,
  ArtianReinforcementType,
  ArtianRules,
  EditorArtianPanel,
  Weapon,
  WeaponArtian,
  WeaponKind,
} from "./types";

export const ARTIAN_ELEMENTS: ArtianElement[] = [
  "fire",
  "water",
  "thunder",
  "ice",
  "dragon",
  "poison",
  "paralysis",
  "sleep",
  "blast",
];

export const ARTIAN_REINFORCEMENT_TYPES: ArtianReinforcementType[] = [
  "attack",
  "affinity",
  "element",
  "sharpness",
  "ammo",
];

const STATUS_ELEMENTS: ArtianElement[] = ["poison", "paralysis", "sleep", "blast"];

export const EMPTY_CUSTOMIZATION: ArtianCustomization = {
  element: null,
  attackParts: 0,
  affinityParts: 0,
  elementInfusion: false,
  reinforcements: [],
};

/** Fresh forge roll: every newly forged weapon starts with all three parts assigned. */
export const initialArtianCustomization = (): ArtianCustomization => ({
  ...EMPTY_CUSTOMIZATION,
  attackParts: 3,
  reinforcements: [],
});

/** Complete a legacy partial split by assigning its unclaimed parts to Attack. */
export const completeArtianBonusParts = (
  config: ArtianCustomization,
): ArtianCustomization => {
  const assigned = config.attackParts + config.affinityParts;
  if (assigned >= 3) return config;
  return { ...config, attackParts: config.attackParts + (3 - assigned) };
};

const isBowgun = (kind: WeaponKind): boolean =>
  kind === "light-bowgun" || kind === "heavy-bowgun";

/** Elements the weapon kind can take; bowguns take none (their element only changes ammo). */
export const elementChoices = (
  kind: WeaponKind,
  rules: ArtianRules,
): ArtianElement[] =>
  ARTIAN_ELEMENTS.filter((element) => rules.kinds[kind]?.elements[element]);

/** Levels each reinforcement type can roll; plain Artian weapons only ever hold level I. */
export const reinforcementLevels = (
  family: WeaponArtian["family"],
  type: ArtianReinforcementType,
  kind: WeaponKind,
  rules: ArtianRules,
): ArtianReinforcementLevel[] => {
  if (family === "artian") return ["I"];
  switch (type) {
    case "attack":
    case "affinity":
      return ["I", "II", "III", "EX"];
    case "element":
      return rules.kinds[kind]?.elementBoost ? ["I", "II", "EX"] : [];
    case "sharpness":
    case "ammo":
      return ["I", "EX"];
  }
};

/** Reinforcement types the weapon can roll given its kind, sharpness bar and chosen element. */
export const availableReinforcementTypes = (
  weapon: Pick<Weapon, "kind" | "sharpness">,
  config: ArtianCustomization,
  rules: ArtianRules,
): ArtianReinforcementType[] =>
  ARTIAN_REINFORCEMENT_TYPES.filter((type) => {
    switch (type) {
      case "element":
        return config.element !== null && Boolean(rules.kinds[weapon.kind]?.elementBoost);
      case "sharpness":
        return weapon.sharpness !== null;
      case "ammo":
        return isBowgun(weapon.kind);
      default:
        return true;
    }
  });

/** First rule the configuration breaks, as a sentence for the editor; `null` when valid. */
export const customizationIssue = (
  weapon: Pick<Weapon, "kind" | "sharpness">,
  artian: WeaponArtian,
  config: ArtianCustomization,
  rules: ArtianRules,
): string | null => {
  const kind = rules.kinds[weapon.kind];
  if (!kind) return "This weapon type has no Artian rules.";
  if (config.element !== null && !kind.elements[config.element]) {
    return "This weapon type cannot take that element.";
  }
  if (config.elementInfusion && (config.element === null || kind.elementInfusion === null)) {
    return "Element infusion needs an element.";
  }
  if (config.attackParts + config.affinityParts > rules.production.parts) {
    return `An Artian is forged from ${rules.production.parts} parts at most.`;
  }
  if (config.reinforcements.length > rules.reinforcement.maxCount) {
    return `At most ${rules.reinforcement.maxCount} reinforcements.`;
  }

  const available = availableReinforcementTypes(weapon, config, rules);
  const counts = new Map<ArtianReinforcementType, number>();
  const exCounts = new Map<ArtianReinforcementType, number>();
  for (const { type, level } of config.reinforcements) {
    if (!available.includes(type)) return `This weapon cannot roll a ${type} reinforcement.`;
    if (!reinforcementLevels(artian.family, type, weapon.kind, rules).includes(level)) {
      return `A ${type} reinforcement cannot be level ${level} here.`;
    }
    counts.set(type, (counts.get(type) ?? 0) + 1);
    if (level === "EX") exCounts.set(type, (exCounts.get(type) ?? 0) + 1);
  }
  for (const [type, count] of exCounts) {
    if (count > rules.reinforcement.maxExPerType) {
      return `No more than ${rules.reinforcement.maxExPerType} EX ${type} reinforcements.`;
    }
  }
  if (artian.family === "artian") {
    for (const [type, count] of counts) {
      const max = rules.reinforcement.artianMaxPerType[type];
      if (count > max) return `An Artian weapon holds at most ${max} ${type} reinforcements.`;
    }
  }
  return null;
};

export type DerivedArtianStats = {
  damage: Weapon["damage"];
  affinity: number;
  specials: Weapon["specials"];
  /** Extra sharpness points; the colour bar is left as the catalog row has it. */
  sharpnessBonus: number;
  ammoBonus: number;
};

/** Effective stats of a configured Artian / Gogma Artian; assumes `customizationIssue` is null. */
export const deriveArtianStats = (
  weapon: Pick<Weapon, "kind" | "rarity" | "damage" | "affinity">,
  artian: WeaponArtian,
  config: ArtianCustomization,
  rules: ArtianRules,
): DerivedArtianStats => {
  const kind = rules.kinds[weapon.kind];
  const rf = rules.reinforcement;

  let raw = weapon.damage.raw + config.attackParts * rules.production.attackPerPart;
  let affinity = weapon.affinity + config.affinityParts * rules.production.affinityPerPart;
  let elementBoost = 0;
  let sharpnessBonus = 0;
  let ammoBonus = 0;

  for (const { type, level } of config.reinforcements) {
    switch (type) {
      case "attack":
        raw += rf.attack[level];
        break;
      case "affinity":
        affinity += rf.affinity[level];
        break;
      case "element":
        if (kind?.elementBoost && level !== "III") elementBoost += kind.elementBoost[level];
        break;
      case "sharpness":
        if (level === "I" || level === "EX") {
          sharpnessBonus +=
            weapon.kind === "insect-glaive" && level === "I"
              ? rf.sharpnessInsectGlaiveI
              : rf.sharpness[level];
        }
        break;
      case "ammo":
        if (level === "I" || level === "EX") ammoBonus += rf.ammo[level];
        break;
    }
  }

  const specials: Weapon["specials"] = [];
  const base = config.element ? kind?.elements[config.element] : undefined;
  if (config.element && base && kind) {
    let value = weapon.rarity === 8 ? base.r8 : base.r67;
    if (config.elementInfusion && kind.elementInfusion !== null) value += kind.elementInfusion;
    if (artian.family === "gogma" && artian.focus && artian.focus !== "attack" && kind.gogmaFocusElementDelta) {
      value += kind.gogmaFocusElementDelta[artian.focus];
    }
    value += elementBoost;
    specials.push({
      kind: STATUS_ELEMENTS.includes(config.element) ? "status" : "element",
      name: config.element,
      damage: { raw: value / 10, display: value },
      hidden: false,
    });
  }

  // Display attack scales with the weapon's own multiplier (e.g. 4.8x Great Sword).
  const multiplier = weapon.damage.raw > 0 ? weapon.damage.display / weapon.damage.raw : 1;
  return {
    damage: { raw, display: Math.round(raw * multiplier) },
    affinity,
    specials,
    sharpnessBonus,
    ammoBonus,
  };
};

/**
 * Drops whatever a changed weapon or element makes impossible (an element
 * reinforcement without an element, a level the family cannot roll, ...) so the
 * panel never holds a configuration the API would reject for a stale reason.
 * Limits that depend on the hunter's own picks (EX counts, totals) are left alone
 * and surfaced through `customizationIssue` instead.
 */
export const normalizeCustomization = (
  weapon: Pick<Weapon, "kind" | "sharpness">,
  artian: WeaponArtian,
  config: ArtianCustomization,
  rules: ArtianRules,
): ArtianCustomization => {
  const kind = rules.kinds[weapon.kind];
  const element =
    config.element && kind?.elements[config.element] ? config.element : null;
  const next = { ...config, element };
  const available = availableReinforcementTypes(weapon, next, rules);
  const reinforcements = config.reinforcements
    .filter(
      (item) =>
        available.includes(item.type) &&
        reinforcementLevels(artian.family, item.type, weapon.kind, rules).includes(item.level),
    )
    .slice(0, rules.reinforcement.maxCount);
  return {
    ...next,
    elementInfusion:
      config.elementInfusion && element !== null && kind?.elementInfusion != null,
    reinforcements,
  };
};

/** Replace the `index`-th reinforcement, append one when `index` is past the end, or remove it with `null`. */
export const withReinforcement = (
  config: ArtianCustomization,
  index: number,
  reinforcement: ArtianReinforcement | null,
): ArtianCustomization => {
  const list = [...config.reinforcements];
  if (reinforcement === null) list.splice(index, 1);
  else if (index >= list.length) list.push(reinforcement);
  else list[index] = reinforcement;
  return { ...config, reinforcements: list };
};

/** The weapon as the build sees it: the catalog row with derived stats applied. */
export const effectiveWeapon = (
  weapon: Weapon,
  config: ArtianCustomization | null,
  rules: ArtianRules | undefined,
): Weapon => {
  if (!weapon.artian || !rules) return weapon;
  const derived = deriveArtianStats(weapon, weapon.artian, config ?? EMPTY_CUSTOMIZATION, rules);
  return {
    ...weapon,
    damage: derived.damage,
    affinity: derived.affinity,
    specials: derived.specials,
  };
};

/** The editor panel state for an Artian-family weapon, or `null` for any other weapon. */
export const buildArtianPanel = (
  weapon: Weapon,
  config: ArtianCustomization | null,
  rules: ArtianRules | undefined,
): EditorArtianPanel | null => {
  if (!weapon.artian || !rules) return null;
  const current = config ?? EMPTY_CUSTOMIZATION;
  const { family, tier, focus } = weapon.artian;
  const derived = deriveArtianStats(weapon, weapon.artian, current, rules);
  const levels = Object.fromEntries(
    ARTIAN_REINFORCEMENT_TYPES.map((type) => [
      type,
      reinforcementLevels(family, type, weapon.kind, rules),
    ]),
  ) as EditorArtianPanel["levels"];
  return {
    family,
    tier,
    focus,
    config: current,
    elements: elementChoices(weapon.kind, rules),
    reinforcementTypes: availableReinforcementTypes(weapon, current, rules),
    levels,
    maxReinforcements: rules.reinforcement.maxCount,
    canInfuse:
      current.element !== null && rules.kinds[weapon.kind]?.elementInfusion != null,
    sharpnessBonus: derived.sharpnessBonus,
    ammoBonus: derived.ammoBonus,
    issue: customizationIssue(weapon, weapon.artian, current, rules),
  };
};
