/**
 * MH Wilds domain constants shared across features.
 *
 * Anything describing the game itself — the six equipment positions, rarity
 * colours, the five elements — lives here so the Loadout Optimizer and the
 * Builds feature render the same facts the same way. Feature-specific config
 * (skill categories, draft limits) stays inside the feature.
 */

/** The six positions a hunter equips, in in-game order. */
export type EquipmentPosition =
  | "head"
  | "chest"
  | "arms"
  | "waist"
  | "legs"
  | "talisman";

/** Ordered positions. Index doubles as the slot index used by search results. */
export const EQUIPMENT_POSITIONS: EquipmentPosition[] = [
  "head",
  "chest",
  "arms",
  "waist",
  "legs",
  "talisman",
];

/** The five body pieces — every position except the talisman. */
export type ArmorPosition = Exclude<EquipmentPosition, "talisman">;

export const ARMOR_POSITIONS: ArmorPosition[] = [
  "head",
  "chest",
  "arms",
  "waist",
  "legs",
];

export const POSITION_LABELS: Record<EquipmentPosition, string> = {
  head: "Head",
  chest: "Chest",
  arms: "Arms",
  waist: "Waist",
  legs: "Legs",
  talisman: "Talisman",
};

/** Elemental defense totals summed over the five body pieces (talisman excluded). */
export type ElementalDefenses = {
  fire: number;
  water: number;
  thunder: number;
  ice: number;
  dragon: number;
};

export type ElementConfig = {
  key: keyof ElementalDefenses;
  /** Full name, for titles and tooltips. */
  label: string;
  /** Three-letter form used in dense stat rows. */
  abbr: string;
  color: string;
};

/** The five elements in in-game order, with the accent colour used everywhere. */
export const ELEMENTS: ElementConfig[] = [
  { key: "fire", label: "Fire", abbr: "FIR", color: "hsl(8,65%,55%)" },
  { key: "water", label: "Water", abbr: "WAT", color: "hsl(205,55%,55%)" },
  { key: "thunder", label: "Thunder", abbr: "THN", color: "hsl(50,75%,55%)" },
  { key: "ice", label: "Ice", abbr: "ICE", color: "hsl(190,45%,60%)" },
  { key: "dragon", label: "Dragon", abbr: "DRA", color: "hsl(280,40%,62%)" },
];

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
export const rarityColor = (rarity: number): string => {
  return RARITY_COLORS[rarity] ?? NO_RARITY_COLOR;
};

/** Signed defense value for display: `+12`, `0`, `-5`. */
export const formatResistance = (value: number): string => {
  return value > 0 ? `+${value}` : String(value);
};
