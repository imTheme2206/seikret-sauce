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
  /** Accent colour for icons / level blocks. */
  color: string;
  /** Translucent background used behind the category badge. */
  badgeBg: string;
};

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

/** Derive the category a skill belongs to from its flags. */
export const categoryOf = (skill: Skill): SkillCategory => {
  if (skill.isSetSkill) return "set";
  if (skill.isGroupSkill) return "group";
  return skill.type === "weapon" ? "weapon" : "armor";
};
