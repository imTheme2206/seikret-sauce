/**
 * Persists the optimizer's *search parameters* (selected skills, rank, equipped
 * weapon) to localStorage so a returning user does not have to re-pick
 * them every visit.
 *
 * Deliberately excludes transient UI state (search query, active tab, expanded
 * results) and search results themselves — those are cheap to recreate and
 * would go stale.
 *
 * Stored data is untrusted input: anything that does not match the expected
 * shape is dropped rather than thrown, so a corrupt or outdated entry degrades
 * to "empty selection" instead of breaking the page.
 */

import { EMPTY_WEAPON_SELECTION } from "@/features/builds/weapon-selection";
import { parseWeaponSelection } from "@/features/builds/working-build";
import type { EditorWeaponSelection } from "@/features/builds/types";
import { CATEGORY_CONFIG } from "./config";
import type {
  Rank,
  SelectedSkill,
  SelectedSkillMap,
  SkillCategory,
} from "./types";

/** Bump the suffix when the persisted shape changes incompatibly. */
export const OPTIMIZER_PARAMS_KEY = "mh-wilds-optimizer-params-v1";

const RANKS: Rank[] = ["low", "high", "master"];

export type OptimizerParams = {
  selected: SelectedSkillMap;
  rank: Rank;
  weapon: EditorWeaponSelection;
};

export const DEFAULT_OPTIMIZER_PARAMS: OptimizerParams = {
  selected: {},
  rank: "high",
  weapon: EMPTY_WEAPON_SELECTION,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const parseSelectedSkill = (name: string, raw: unknown): SelectedSkill | null => {
  if (!isRecord(raw)) return null;

  const category = raw.category;
  if (typeof category !== "string" || !(category in CATEGORY_CONFIG)) return null;

  const maxLevel = raw.maxLevel;
  if (typeof maxLevel !== "number" || !Number.isFinite(maxLevel) || maxLevel < 1) {
    return null;
  }

  const level = raw.level;
  if (typeof level !== "number" || !Number.isFinite(level)) return null;

  return {
    name: typeof raw.name === "string" ? raw.name : name,
    level: Math.max(1, Math.min(Math.trunc(maxLevel), Math.trunc(level))),
    maxLevel: Math.trunc(maxLevel),
    category: category as SkillCategory,
    icon: typeof raw.icon === "string" ? raw.icon : null,
  };
};

const parseSelected = (raw: unknown): SelectedSkillMap => {
  if (!isRecord(raw)) return {};

  const selected: SelectedSkillMap = {};
  for (const [name, value] of Object.entries(raw)) {
    const skill = parseSelectedSkill(name, value);
    if (skill) selected[name] = skill;
  }
  return selected;
};

/**
 * Entries written before the optimizer equipped real weapons stored bare bonus names
 * (`{ set, group }`). Those cannot be mapped to a weapon, so they parse to "no weapon";
 * the skills and rank stored beside them are kept. A bonus or configuration without a
 * weapon is meaningless (only a Gogma Artian carries bonuses) and is dropped too.
 */
const parseWeapon = (raw: unknown): EditorWeaponSelection => {
  const weapon = parseWeaponSelection(raw);
  return weapon.weaponId ? { ...weapon, decorations: [] } : EMPTY_WEAPON_SELECTION;
};

/** Coerce arbitrary stored JSON into a usable params object. */
export const parseOptimizerParams = (raw: unknown): OptimizerParams => {
  if (!isRecord(raw)) return DEFAULT_OPTIMIZER_PARAMS;

  const rank = RANKS.find((r) => r === raw.rank) ?? DEFAULT_OPTIMIZER_PARAMS.rank;

  return {
    selected: parseSelected(raw.selected),
    rank,
    weapon: parseWeapon(raw.weapon),
  };
};

/** Read the saved params, falling back to defaults when absent or unreadable. */
export const loadOptimizerParams = (): OptimizerParams => {
  if (typeof window === "undefined") return DEFAULT_OPTIMIZER_PARAMS;

  try {
    const stored = window.localStorage.getItem(OPTIMIZER_PARAMS_KEY);
    if (!stored) return DEFAULT_OPTIMIZER_PARAMS;
    return parseOptimizerParams(JSON.parse(stored));
  } catch {
    // Corrupt JSON, or storage blocked (private mode / disabled cookies).
    return DEFAULT_OPTIMIZER_PARAMS;
  }
};

/** Write the params, silently ignoring quota / access errors. */
export const saveOptimizerParams = (params: OptimizerParams): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(OPTIMIZER_PARAMS_KEY, JSON.stringify(params));
  } catch {
    // Storage unavailable or full — persistence is best-effort.
  }
};
