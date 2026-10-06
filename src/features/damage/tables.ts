/**
 * Version-tagged game constants behind the effective-damage model. Every value
 * cites the pages it was read from; none comes from memory. Sources were fetched
 * on `RETRIEVED_AT` and are the pages as they stood then (Game8 pages carried an
 * "updated 2025-12-24" stamp; the rest are undated).
 *
 * Source keys used below:
 *  - GAME8_FORMULA   https://game8.co/games/Monster-Hunter-Wilds/archives/499631
 *  - GAME8_SHARPNESS https://game8.co/games/Monster-Hunter-Wilds/archives/500339
 *  - GAME8_TYPES     https://game8.co/games/Monster-Hunter-Wilds/archives/500455
 *  - FEX_SHARPNESS   https://monsterhunterwilds.wiki.fextralife.com/Sharpness
 *  - FEX_MECHANICS   https://monsterhunterwilds.wiki.fextralife.com/Weapon_Mechanics
 *  - FEX_TYPES       https://monsterhunterwilds.wiki.fextralife.com/Damage_Types
 *  - WIGGLER         https://wiggler.pet/other/guides/intermediate_damage_calculation
 */

import type { DamageType, SharpnessColor, WeaponKind } from "./types";

/** Table version. Same tag as the Artian rules table (backend ADR-0014). */
export const GAME_VERSION = "1.041";
export const RETRIEVED_AT = "2026-10-06";

export const WEAPON_KINDS: WeaponKind[] = [
  "great-sword",
  "long-sword",
  "sword-shield",
  "dual-blades",
  "hammer",
  "hunting-horn",
  "lance",
  "gunlance",
  "switch-axe",
  "charge-blade",
  "insect-glaive",
  "bow",
  "light-bowgun",
  "heavy-bowgun",
];

export const SHARPNESS_COLORS: SharpnessColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "white",
];

/**
 * Sharpness modifiers. Raw: Game8 (GAME8_FORMULA, GAME8_SHARPNESS), Fextralife
 * (FEX_SHARPNESS, FEX_MECHANICS) and WIGGLER agree on every colour; one guide
 * (gamerguides.com) prints white as 1.33, an outlier we do not follow. Element:
 * Game8 writes blue as 1.063, Fextralife as 1.0625 (the exact figure, used here);
 * WIGGLER lists 1.05 for blue in a table headed World/Rise/Wilds, which is the
 * older games' value.
 *
 * Purple is deliberately absent: no weapon in the catalog has purple sharpness,
 * Fextralife/Game8's sharpness pages do not list it, and the two sources that do
 * disagree on its element modifier (1.27 on GAME8_FORMULA, 1.25 on WIGGLER).
 */
export const SHARPNESS_MODIFIERS: Record<
  SharpnessColor,
  { raw: number; element: number }
> = {
  red: { raw: 0.5, element: 0.25 },
  orange: { raw: 0.75, element: 0.5 },
  yellow: { raw: 1, element: 0.75 },
  green: { raw: 1.05, element: 1 },
  blue: { raw: 1.2, element: 1.0625 },
  white: { raw: 1.32, element: 1.15 },
};

/**
 * Critical hit damage multiplier without Critical Boost: +25%. FEX_MECHANICS
 * ("applies a bonus of 25% to Physical (Raw) Damage"), WIGGLER ("default
 * multiplier of 1.25").
 */
export const BASE_CRIT_MULTIPLIER = 1.25;

/**
 * Negative affinity ("blunder") multiplier: -25%. FEX_MECHANICS ("applies a
 * penalty of 25% to Physical Damage"), WIGGLER ("Negative crits do 25% less").
 */
export const NEGATIVE_CRIT_MULTIPLIER = 0.75;

/**
 * Weakness Exploit's main bonus applies when the part's hitzone is at least this
 * (a 0-1 multiplier, i.e. 45). This is community knowledge rather than a Capcom
 * statement: smart-calculators.net FAQ ("A raw hitzone of 45 or above is what the
 * community has established as the line"); MH Wiki and Fextralife only say
 * "weak points". The issue (#07) and #05's weak-point highlight use the same line.
 */
export const WEAK_POINT_THRESHOLD = 0.45;

/**
 * Hitzone family each weapon type's normal attacks use. Cut/Sever, Blunt and
 * Shot per GAME8_TYPES and FEX_TYPES: Great Sword, Long Sword, Sword & Shield,
 * Dual Blades, Switch Axe, Charge Blade, Lance, Gunlance, Insect Glaive cut;
 * Hammer and Hunting Horn blunt; Bow, Light and Heavy Bowgun shot.
 *
 * Approximation: monster hitzones in the catalog (#05) are slash / blunt /
 * pierce; ranged weapons are mapped to `pierce` as the closest family. Ammo and
 * coating types shift the real hitzone family and ranged damage is not
 * motion-value based, so ranged results are flagged approximate in the UI.
 * Secondary moves (shield bashes, Arc Shot, ...) use other types and are ignored.
 */
export const WEAPON_DAMAGE_TYPE: Record<WeaponKind, DamageType> = {
  "great-sword": "slash",
  "long-sword": "slash",
  "sword-shield": "slash",
  "dual-blades": "slash",
  "switch-axe": "slash",
  "charge-blade": "slash",
  lance: "slash",
  gunlance: "slash",
  "insect-glaive": "slash",
  hammer: "blunt",
  "hunting-horn": "blunt",
  bow: "pierce",
  "light-bowgun": "pierce",
  "heavy-bowgun": "pierce",
};

export const RANGED_KINDS: WeaponKind[] = ["bow", "light-bowgun", "heavy-bowgun"];

/** The element hitzone keys a weapon element maps onto; anything else (status) has none. */
export const ELEMENT_NAMES = ["fire", "water", "thunder", "ice", "dragon"] as const;
export type ElementName = (typeof ELEMENT_NAMES)[number];

/**
 * Element values are shown ten times larger than the value damage is computed
 * from: "Elem. Damage / 10" in GAME8_FORMULA, and "(Elemental Attack / 10)" on
 * switchbladegaming.com. The catalog's `damage.display` is the displayed value
 * (e.g. 350) and `damage.raw` the divided one (35). Skill element bonuses
 * (MHDB "Fire attack +40") are taken to be in displayed units, the same scale
 * as a weapon's printed element value; no page states this outright, so it is
 * recorded as an assumption in the follow-ups.
 */
export const ELEMENT_DISPLAY_DIVISOR = 10;
