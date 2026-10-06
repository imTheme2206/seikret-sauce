/** Pure presentation helpers for the Loadout Optimizer. */

import { DRAFT_LIMITS } from "@/features/builds/config";
import { ARMOR_SKILL_GROUPS } from "./config";
import type { PoolSkill, SelectedSkill } from "./types";

const TIER_SYMBOLS: Record<string, string> = {
  Gamma: "γ",
  Beta: "β",
  Alpha: "α",
};

/**
 * Compress a long armour-piece name into a chip-friendly short form,
 * e.g. "Arkvulcan Vambraces Gamma" -> "Arkvulcan γ".
 */
export const shortArmorName = (name: string): string => {
  for (const [tier, symbol] of Object.entries(TIER_SYMBOLS)) {
    if (name.includes(tier)) {
      return `${name.replace(tier, "").trim()} ${symbol}`;
    }
  }
  return name;
};

/** "5 skills · 3 decos · 240 def" */
export const statsSummary = (
  skillCount: number,
  decoCount: number,
  defense: number,
): string => {
  return `${skillCount} skills · ${decoCount} decos · ${defense} def`;
};

/**
 * Auto-generated name for a saved optimizer result, e.g.
 * "Optimized: Attack Boost + Weakness Exploit + more". Falls back to a plain
 * ordinal when no skills were requested (a weapon-only search).
 */
export const resultName = (
  selected: SelectedSkill[],
  resultNumber: number,
): string => {
  const skills = selected.slice(0, 3).map(({ name }) => name).join(" + ");
  const suffix = selected.length > 3 ? " + more" : "";
  const name = skills
    ? `Optimized: ${skills}${suffix}`
    : `Optimizer Result ${resultNumber}`;
  return name.slice(0, DRAFT_LIMITS.name);
};

export type SkillIconGroup = {
  /** The icon type shared by every skill in the group; null for "Other". */
  icon: string | null;
  label: string;
  skills: PoolSkill[];
};

/**
 * Split armor skills into their in-game icon-type groups, in the configured
 * order. Order inside a group follows the input, so callers keep their sort.
 * Empty groups are dropped; unknown or missing icons land in a trailing "Other".
 */
export const groupSkillsByIcon = (skills: PoolSkill[]): SkillIconGroup[] => {
  const known = new Set(ARMOR_SKILL_GROUPS.map((group) => group.icon));
  const groups: SkillIconGroup[] = ARMOR_SKILL_GROUPS.map((group) => ({
    icon: group.icon,
    label: group.label,
    skills: skills.filter((skill) => skill.icon === group.icon),
  }));
  groups.push({
    icon: null,
    label: "Other",
    skills: skills.filter((skill) => !skill.icon || !known.has(skill.icon)),
  });
  return groups.filter((group) => group.skills.length > 0);
};
