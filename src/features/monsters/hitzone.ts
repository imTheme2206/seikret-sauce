/**
 * Pure helpers behind the hitzone table: damage-type metadata, weak-point
 * detection, part ordering and display names. No React, so they are unit-tested directly.
 */

import type { DamageType, MonsterPart, MonsterWeakness } from "./types";

export type DamageTypeConfig = {
  type: DamageType;
  label: string;
  /** Physical types come from the weapon's cut/impact/shot; the rest are element or stun. */
  group: "physical" | "element" | "stun";
};

/** The nine hitzone columns in in-game order. */
export const DAMAGE_TYPES: DamageTypeConfig[] = [
  { type: "slash", label: "Slash", group: "physical" },
  { type: "blunt", label: "Blunt", group: "physical" },
  { type: "pierce", label: "Pierce", group: "physical" },
  { type: "fire", label: "Fire", group: "element" },
  { type: "water", label: "Water", group: "element" },
  { type: "thunder", label: "Thunder", group: "element" },
  { type: "ice", label: "Ice", group: "element" },
  { type: "dragon", label: "Dragon", group: "element" },
  { type: "stun", label: "Stun", group: "stun" },
];

/** A hitzone multiplier at or above this is a weak point for that damage type. */
export const WEAK_POINT_THRESHOLD = 0.45;

export const isWeakPoint = (part: MonsterPart, type: DamageType): boolean =>
  part.multipliers[type] >= WEAK_POINT_THRESHOLD;

/** Highest multiplier first. The sort is stable, so ties keep upstream order. */
export const sortPartsBy = (
  parts: MonsterPart[],
  type: DamageType,
): MonsterPart[] =>
  [...parts].sort((a, b) => b.multipliers[type] - a.multipliers[type]);

const titleCase = (kebab: string): string =>
  kebab
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/**
 * Display names by part id. Upstream repeats a part name (Gogmazios has six
 * `hide`), so duplicates are numbered in upstream order: "Hide 1" ... "Hide 6".
 */
export const partLabels = (parts: MonsterPart[]): Map<string, string> => {
  const totals = new Map<string, number>();
  for (const part of parts) totals.set(part.name, (totals.get(part.name) ?? 0) + 1);

  const seen = new Map<string, number>();
  return new Map(
    parts.map((part) => {
      const index = (seen.get(part.name) ?? 0) + 1;
      seen.set(part.name, index);
      const base = titleCase(part.name);
      return [part.id, (totals.get(part.name) ?? 0) > 1 ? `${base} ${index}` : base];
    }),
  );
};

/** Elements the monster takes extra damage from, strongest first. */
export const elementWeaknesses = (
  weaknesses: MonsterWeakness[],
): MonsterWeakness[] =>
  weaknesses
    .filter((weakness) => weakness.kind === "element")
    .sort((a, b) => b.level - a.level);

export const formatMultiplier = (value: number): string =>
  Number(value.toFixed(2)).toString();
