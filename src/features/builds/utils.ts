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
export const encodeTalismanValue = (
  selection: EditorTalismanSelection | null,
): string => {
  return selection ? `${selection.source}:${selection.talismanId}` : "";
};

export const decodeTalismanValue = (
  value: string,
): { source: TalismanSource; talismanId: string } | null => {
  if (!value) return null;
  const separator = value.indexOf(":");
  if (separator < 0) return null;
  return {
    source: value.slice(0, separator) as TalismanSource,
    talismanId: value.slice(separator + 1),
  };
};

/** Armour records store bare slot sizes; the UI works in `GearSlot`s. */
export const toGearSlots = (sizes: readonly number[]): GearSlot[] => {
  return sizes.map((size) => ({ size, type: "armor" }));
};

/** A weapon's slot sizes as weapon-typed slots, which only weapon decorations fit. */
export const toWeaponSlots = (sizes: readonly number[]): GearSlot[] => {
  return sizes.map((size) => ({ size, type: "weapon" }));
};

/** Slots as stored on a snapshot piece, which may be sizes or already-shaped slots. */
export const slotSizes = (
  slots: readonly (number | { size: number })[],
): number[] => {
  return slots.map((slot) => (typeof slot === "number" ? slot : slot.size));
};

/**
 * True once any armor piece, talisman, weapon, or weapon bonus is set. `weapon`
 * is excluded from the naive truthiness check below — it's always a present
 * object (its ids are independently nullable), unlike the other positions
 * where `null` means "empty".
 */
export const hasAnyPiece = (draft: BuildDraft): boolean => {
  const { weapon, ...positions } = draft.composition;
  return (
    Object.values(positions).some(Boolean) ||
    Boolean(weapon.weaponId || weapon.setBonusId || weapon.groupBonusId)
  );
};

/** Trims the draft into the request body the create/replace endpoints accept. */
export const toCreateBody = (draft: BuildDraft): CreateBuildBody => {
  return {
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    isShared: draft.isShared,
    composition: {
      ...draft.composition,
      weapon: {
        weaponId: draft.composition.weapon.weaponId,
        // Decorations only make sense on a chosen weapon; drop strays defensively.
        decorations: draft.composition.weapon.weaponId
          ? draft.composition.weapon.decorations
          : [],
        setBonusId: draft.composition.weapon.setBonusId,
        groupBonusId: draft.composition.weapon.groupBonusId,
        // Only an equipped weapon can carry a configuration (the API rejects it otherwise).
        customization: draft.composition.weapon.weaponId
          ? draft.composition.weapon.customization
          : null,
      },
    },
  };
};

/** Short, locale-aware date for build cards and revision lines. */
export const formatBuildDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString();
};
