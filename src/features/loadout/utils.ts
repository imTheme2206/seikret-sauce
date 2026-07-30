/** Pure presentation helpers for the Loadout Optimizer. */

import { DRAFT_LIMITS } from "@/features/builds/config";
import type { SelectedSkill } from "./types";

const TIER_SYMBOLS: Record<string, string> = {
  Gamma: "γ",
  Beta: "β",
  Alpha: "α",
};

/**
 * Compress a long armour-piece name into a chip-friendly short form,
 * e.g. "Arkvulcan Vambraces Gamma" -> "Arkvulcan γ".
 */
export function shortArmorName(name: string): string {
  for (const [tier, symbol] of Object.entries(TIER_SYMBOLS)) {
    if (name.includes(tier)) {
      return `${name.replace(tier, "").trim()} ${symbol}`;
    }
  }
  return name;
}

/** "5 skills · 3 decos · 240 def" */
export function statsSummary(
  skillCount: number,
  decoCount: number,
  defense: number,
): string {
  return `${skillCount} skills · ${decoCount} decos · ${defense} def`;
}

/**
 * Auto-generated name for a saved optimizer result, e.g.
 * "Optimized: Attack Boost + Weakness Exploit + more". Falls back to a plain
 * ordinal when no skills were requested (a weapon-only search).
 */
export function resultName(
  selected: SelectedSkill[],
  resultNumber: number,
): string {
  const skills = selected.slice(0, 3).map(({ name }) => name).join(" + ");
  const suffix = selected.length > 3 ? " + more" : "";
  const name = skills
    ? `Optimized: ${skills}${suffix}`
    : `Optimizer Result ${resultNumber}`;
  return name.slice(0, DRAFT_LIMITS.name);
}
