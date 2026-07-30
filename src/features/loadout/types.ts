/**
 * Domain types for the Loadout Optimizer feature.
 *
 * Most types here are presentation-facing domain abstractions. `LoadoutResult`
 * is the deliberate exception: it mirrors the `/api/mh-wilds/search` response
 * shape exactly, with no mapping layer, because the result is consumed by a
 * single UI. See `docs/adr/0001-result-type-mirrors-api-dto.md` before
 * "restoring" a transport/domain split here.
 */

import type { ElementalDefenses } from "@/lib/mh-wilds";

export type SkillCategory = "armor" | "weapon" | "set" | "group";

/** A single skill as returned by the skills endpoint. */
export interface Skill {
  id: string;
  name: string;
  cleanName: string;
  type: string;
  maxLevel: number;
  isSetSkill: boolean;
  isGroupSkill: boolean;
  requiredPieces: number | null;
  effectName: string | null;
  icon: string | null;
}

/** Skills bucketed by the category they belong to. */
export interface GroupedSkills {
  armorSkills: Skill[];
  weaponSkills: Skill[];
  setSkills: Skill[];
  groupSkills: Skill[];
}

/** A skill the user has chosen, together with the desired level. */
export interface SelectedSkill {
  name: string;
  level: number;
  maxLevel: number;
  category: SkillCategory;
  icon: string | null;
}

/** Map of skill name -> selection. */
export type SelectedSkillMap = Record<string, SelectedSkill>;

/**
 * The Set and/or Group Skill an equipped weapon contributes a Pre-owned Piece
 * toward. The two are tracked independently — a weapon may carry a Set Skill, a
 * Group Skill, both, or neither (see CONTEXT.md). Each contributes one piece,
 * feeding `initialSetCounts`/`initialGroupCounts`. `null` means none of that kind.
 */
export interface WeaponSkills {
  set: string | null;
  group: string | null;
}

/** A weapon carrying no skills — the default Pre-owned Piece Count. */
export const EMPTY_WEAPON_SKILLS: WeaponSkills = { set: null, group: null };

/** Search difficulty rank. `master` is reachable in the type but not yet offered in the UI. */
export type Rank = "low" | "high" | "master";

/**
 * Elemental defense totals summed over the five body pieces (talisman excluded).
 * Re-exported from the shared domain module, which the Builds feature also uses.
 */
export type { ElementalDefenses } from "@/lib/mh-wilds";

/**
 * One optimized armour loadout returned by `POST /api/mh-wilds/search`.
 *
 * This mirrors the API response shape exactly (no rename, no mapper) — see
 * `docs/adr/0001-result-type-mirrors-api-dto.md`. `armorNames` and `rarities`
 * are index-aligned (6 entries; index 5 is always the talisman, rarity 0).
 */
export interface LoadoutResult {
  armorNames: string[];
  rarities: number[];
  skills: Record<string, number>;
  setSkills: Record<string, number>;
  groupSkills: Record<string, number>;
  decoNames: string[];
  freeSlots: number[];
  slots: number[];
  /** Base defense over 5 body pieces only — not augment/floor-accurate. */
  defense: number;
  elementalDefenses: ElementalDefenses;
}

/** Lifecycle of a single search request. */
export type SearchStatus = "idle" | "searching" | "success" | "empty" | "error";

/** How a search failed — drives which message the results panel shows. */
export type SearchErrorKind = "rate-limit" | "validation" | "network" | "timeout";

export interface SearchError {
  kind: SearchErrorKind;
  message: string;
}

/** A skill from the pool, annotated with the category it was matched under. */
export interface PoolSkill extends Skill {
  category: SkillCategory;
}
