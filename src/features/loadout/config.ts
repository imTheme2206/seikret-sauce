/**
 * Category configuration — the single source of truth for everything that
 * varies per skill category. Adding or changing a category means editing only
 * this map (Open/Closed): components iterate over it rather than hard-coding
 * "armor / weapon / set / group" branches.
 */

import type { GroupedSkills, Skill, SkillCategory } from "./types";

export interface CategoryConfig {
  /** Stable key. */
  id: SkillCategory;
  /** Human label used for tabs and badges. */
  label: string;
  /** Which bucket of `GroupedSkills` this category reads from. */
  groupKey: keyof GroupedSkills;
  /** Accent colour for icons / level blocks. */
  color: string;
  /** Translucent background used behind the category badge. */
  badgeBg: string;
}

export const CATEGORY_CONFIG: Record<SkillCategory, CategoryConfig> = {
  armor: {
    id: "armor",
    label: "Armor",
    groupKey: "armorSkills",
    color: "hsl(36,65%,52%)",
    badgeBg: "rgba(165,115,30,0.18)",
  },
  weapon: {
    id: "weapon",
    label: "Weapon",
    groupKey: "weaponSkills",
    color: "hsl(195,45%,45%)",
    badgeBg: "rgba(40,130,160,0.18)",
  },
  set: {
    id: "set",
    label: "Set",
    groupKey: "setSkills",
    color: "hsl(270,28%,55%)",
    badgeBg: "rgba(120,80,160,0.18)",
  },
  group: {
    id: "group",
    label: "Group",
    groupKey: "groupSkills",
    color: "hsl(150,32%,46%)",
    badgeBg: "rgba(40,130,80,0.18)",
  },
};

/** Ordered list of categories (tab order). */
export const CATEGORY_ORDER: SkillCategory[] = ["armor", "weapon", "set", "group"];

/**
 * In-game armour rarity colours for MH Wilds (rarity 1–8), keyed by rarity.
 * Source: Monster Hunter Wiki "Help:Item Colors" (MHWilds section).
 */
export const RARITY_COLORS: Record<number, string> = {
  1: "#969696",
  2: "#DEDEDE",
  3: "#A4C43B",
  4: "#47A33F",
  5: "#5CAEBB",
  6: "#575FD9",
  7: "#9272E3",
  8: "#C76D46",
};

/** Neutral accent for slots without a rarity (rarity 0 — the talisman slot). */
const NO_RARITY_COLOR = "#8a8079";

/** Accent colour for an armour piece, derived from its rarity. */
export function rarityColor(rarity: number): string {
  return RARITY_COLORS[rarity] ?? NO_RARITY_COLOR;
}

/** Derive the category a skill belongs to from its flags. */
export function categoryOf(skill: Skill): SkillCategory {
  if (skill.isSetSkill) return "set";
  if (skill.isGroupSkill) return "group";
  return skill.type === "weapon" ? "weapon" : "armor";
}
