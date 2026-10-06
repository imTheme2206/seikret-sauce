/** Pure view helpers for the effective damage panel. */

import type { Bonuses } from "@/features/damage";
import type { HunterStatusSkill } from "./hunter-status";

/** Skill levels by name, as the damage model reads them. */
export const skillsByName = (
  skills: HunterStatusSkill[],
): Record<string, number> =>
  Object.fromEntries(skills.map((skill) => [skill.name, skill.level]));

const num = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/** The non-zero parts of a skill's uptime-weighted contribution, e.g. `+12 attack`. */
export const efrBonusLines = (applied: Bonuses): string[] => {
  const lines: string[] = [];
  if (applied.attackFlat) lines.push(`+${num(applied.attackFlat)} attack`);
  if (applied.attackPct) lines.push(`+${num(applied.attackPct * 100)}% attack`);
  if (applied.affinity) lines.push(`+${num(applied.affinity * 100)}% affinity`);
  if (applied.critDamage) {
    lines.push(`+${num(applied.critDamage * 100)}% crit damage`);
  }
  if (applied.elementFlat) lines.push(`+${num(applied.elementFlat)} element`);
  if (applied.elementPct) lines.push(`+${num(applied.elementPct * 100)}% element`);
  if (applied.elementMultiplier) {
    lines.push(`x${(1 + applied.elementMultiplier).toFixed(3)} element`);
  }
  if (applied.critElement) {
    lines.push(`x${(1 + applied.critElement).toFixed(3)} element on crit`);
  }
  return lines;
};
