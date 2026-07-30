/** Pure helpers for the Builds feature — no React, no fetching. */

import type {
  BuildDraft,
  CreateBuildBody,
  EditorTalismanSelection,
  GearSlot,
  TalismanSource,
} from "./types";

/**
 * A talisman option must carry both its source and its id, but a `Select` can
 * only hold one string — so the two are packed as `source:id`. Ids may contain
 * colons, hence the split-on-first-colon decode.
 */
export function encodeTalismanValue(
  selection: EditorTalismanSelection | null,
): string {
  return selection ? `${selection.source}:${selection.talismanId}` : "";
}

export function decodeTalismanValue(
  value: string,
): { source: TalismanSource; talismanId: string } | null {
  if (!value) return null;
  const separator = value.indexOf(":");
  if (separator < 0) return null;
  return {
    source: value.slice(0, separator) as TalismanSource,
    talismanId: value.slice(separator + 1),
  };
}

/** Armour records store bare slot sizes; the UI works in `GearSlot`s. */
export function toGearSlots(sizes: readonly number[]): GearSlot[] {
  return sizes.map((size) => ({ size, type: "armor" }));
}

/** Slots as stored on a snapshot piece, which may be sizes or already-shaped slots. */
export function slotSizes(
  slots: readonly (number | { size: number })[],
): number[] {
  return slots.map((slot) => (typeof slot === "number" ? slot : slot.size));
}

export function hasAnyPiece(draft: BuildDraft): boolean {
  return Object.values(draft.composition).some(Boolean);
}

/** Trims the draft into the request body the create/replace endpoints accept. */
export function toCreateBody(draft: BuildDraft): CreateBuildBody {
  return {
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    isShared: draft.isShared,
    composition: draft.composition,
  };
}

/** Short, locale-aware date for build cards and revision lines. */
export function formatBuildDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}
