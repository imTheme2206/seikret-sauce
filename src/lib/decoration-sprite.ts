import { DECORATION_COLORS } from "./decoration-colors";

/**
 * Geometry of `public/images/decoration-slots-sprite.png` (from mhwildshub.com).
 *
 * - 33 × 30 frames.
 * - Columns: one 5-frame group per slot level (1–4). Inside a group, frame 0 is
 *   the empty socket and frame `n` is a level-`n` jewel seated in that socket.
 * - Rows: 28 jewel colours. Row order is the sprite's own, not the game's
 *   colour id, so names are mapped to rows below by sampling each row's jewel.
 */
export const SPRITE = {
  frameWidth: 33,
  frameHeight: 30,
  groupWidth: 165,
  width: 660,
  height: 840,
} as const;

/** The MH Wilds jewel colour names (mhdb `DecorationIcon.color`). */
export type DecorationColor =
  | "white"
  | "gray"
  | "rose"
  | "pink"
  | "red"
  | "vermilion"
  | "orange"
  | "brown"
  | "ivory"
  | "yellow"
  | "lemon"
  | "sage-green"
  | "moss-green"
  | "green"
  | "emerald"
  | "sky"
  | "blue"
  | "ultramarine"
  | "blue-purple"
  | "purple"
  | "dark-purple";

/** Sprite row for each jewel colour, matched by the sampled jewel hue. */
const COLOR_ROWS: Record<DecorationColor, number> = {
  white: 0,
  red: 1,
  green: 2,
  blue: 3,
  yellow: 4,
  purple: 5,
  sky: 6,
  orange: 7,
  pink: 8,
  lemon: 9,
  gray: 10,
  brown: 11,
  "ultramarine": 15,
  "dark-purple": 16,
  rose: 18,
  "blue-purple": 19,
  emerald: 21,
  "sage-green": 23,
  ivory: 24,
  vermilion: 25,
  "moss-green": 26,
};

/** Jewel colour for a decoration name; white for anything the table doesn't know. */
export const decorationColor = (name: string | null | undefined): DecorationColor =>
  (name && DECORATION_COLORS[name]) || "white";

/** Top-left pixel of the frame for a slot, optionally holding a jewel. */
export const spriteFrame = (
  slotLevel: number,
  jewel?: { level: number; color: DecorationColor },
) => {
  const slot = Math.min(Math.max(slotLevel, 1), 4);
  const jewelLevel = jewel ? Math.min(Math.max(jewel.level, 1), slot) : 0;
  return {
    x: SPRITE.groupWidth * (slot - 1) + SPRITE.frameWidth * jewelLevel,
    y: jewel ? SPRITE.frameHeight * COLOR_ROWS[jewel.color] : 0,
  };
};
