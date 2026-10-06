export type WeaponKind =
  | "great-sword"
  | "long-sword"
  | "sword-shield"
  | "dual-blades"
  | "hammer"
  | "hunting-horn"
  | "lance"
  | "gunlance"
  | "switch-axe"
  | "charge-blade"
  | "insect-glaive"
  | "bow"
  | "light-bowgun"
  | "heavy-bowgun";

export type SharpnessColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "white";

/** Hitzone families the monster catalog stores (0-1 multipliers). */
export type DamageType = "slash" | "blunt" | "pierce";

export type ElementKey = "fire" | "water" | "thunder" | "ice" | "dragon";

/** Hitzone multipliers of one monster part, 0-1 (0.65 = 65). */
export type PartMultipliers = Record<DamageType | ElementKey, number>;

/**
 * What a skill level adds to the damage model. Percentages are fractions
 * (0.15 = +15%). Absent fields add nothing.
 */
export type SkillEffect = {
  /** Flat attack, added to true raw. */
  attackFlat?: number;
  /** Attack percentage; summed across skills, then multiplies the weapon's true raw. */
  attackPct?: number;
  /** Affinity, as a fraction. */
  affinity?: number;
  /** Affinity gained only while hitting a weak point (hitzone >= 0.45). */
  weakPointAffinity?: number;
  /** Extra affinity gained only on a wound (Weakness Exploit). */
  woundAffinity?: number;
  /** Flat element attack in displayed element units (a weapon's `damage.display`). */
  elementFlat?: number;
  /** Element attack percentage, fraction. */
  elementPct?: number;
  /** Multiplier on the final elemental damage (Coalescence). */
  elementMultiplier?: number;
  /** Critical hit raw multiplier replacing the base 1.25 (Critical Boost). */
  critDamage?: number;
  /** Multiplier on elemental damage when a critical hit lands (Critical Element). */
  critElement?: number;
};

export type SkillEffectEntry = {
  skill: string;
  level: number;
  effect: SkillEffect;
  /**
   * Human-readable activation condition; `null` means always on (no uptime
   * slider). A conditional entry is weighted by its uptime.
   */
  condition: string | null;
  /**
   * Distinguishes two independently weighted parts of one skill (Weakness
   * Exploit's wound bonus). Uptime is keyed on `skill` or `skill/component`.
   */
  component?: string;
  /** Entry only applies to these weapon types; absent means every type. */
  weapons?: WeaponKind[];
  /** Entry only applies to a weapon with this element (the five element-attack skills). */
  element?: ElementKey;
  /** The whole entry needs a weak-point hit (hitzone >= 0.45). */
  requiresWeakPoint?: boolean;
  /** The source quotes the value with a tilde ("≈1.07x"). */
  approximate?: boolean;
  /** Where the numbers were read: MHDB URL, or the external pages. */
  source: string[];
  gameVersion: string;
  retrievedAt: string;
};
