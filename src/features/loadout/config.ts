/**
 * Category configuration — the single source of truth for everything that
 * varies per skill category. Adding or changing a category means editing only
 * this map (Open/Closed): components iterate over it rather than hard-coding
 * "armor / weapon / set / group" branches.
 *
 * Game-wide facts (positions, rarity colours, elements) live in
 * `@/lib/mh-wilds` because the Builds feature renders them too.
 */

import type { GroupedSkills, Skill, SkillCategory } from "./types";

export type CategoryConfig = {
  /** Stable key. */
  id: SkillCategory;
  /** Human label used for tabs and badges. */
  label: string;
  /** Which bucket of `GroupedSkills` this category reads from. */
  groupKey: keyof GroupedSkills;
  /** Accent colour for icons / level blocks — a theme token, so it re-maps per theme. */
  color: string;
};

export const CATEGORY_CONFIG: Record<SkillCategory, CategoryConfig> = {
  armor: {
    id: "armor",
    label: "Armor",
    groupKey: "armorSkills",
    color: "var(--category-armor)",
  },
  weapon: {
    id: "weapon",
    label: "Weapon",
    groupKey: "weaponSkills",
    color: "var(--category-weapon)",
  },
  set: {
    id: "set",
    label: "Set",
    groupKey: "setSkills",
    color: "var(--category-set)",
  },
  group: {
    id: "group",
    label: "Group",
    groupKey: "groupSkills",
    color: "var(--category-group)",
  },
};

/** Ordered list of categories (tab order). */
export const CATEGORY_ORDER: SkillCategory[] = ["armor", "weapon", "set", "group"];

/** Derive the category a skill belongs to from its flags. */
export const categoryOf = (skill: Skill): SkillCategory => {
  if (skill.isSetSkill) return "set";
  if (skill.isGroupSkill) return "group";
  return skill.type === "weapon" ? "weapon" : "armor";
};

/**
 * Armor skills are grouped by their in-game icon type, in this order. Any icon
 * not listed here (or a missing icon) falls into a trailing "Other" group.
 */
export const ARMOR_SKILL_GROUPS: { icon: string; label: string }[] = [
  { icon: "attack", label: "Attack" },
  { icon: "offense", label: "Offense" },
  { icon: "affinity", label: "Affinity" },
  { icon: "element", label: "Element" },
  { icon: "handicraft", label: "Handicraft" },
  { icon: "ranged", label: "Ranged" },
  { icon: "defense", label: "Defense" },
  { icon: "health", label: "Health" },
  { icon: "stamina", label: "Stamina" },
  { icon: "utility", label: "Utility" },
  { icon: "item", label: "Item" },
  { icon: "gathering", label: "Gathering" },
];
