/** Pure presentation helpers for the Loadout Optimizer. */

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
      return `${name.split(" ")[0]} ${symbol}`;
    }
  }
  return name.split(" ").slice(0, 2).join(" ");
}

/** "5 skills · 3 decos · 240 def" */
export function statsSummary(
  skillCount: number,
  decoCount: number,
  defense: number,
): string {
  return `${skillCount} skills · ${decoCount} decos · ${defense} def`;
}
