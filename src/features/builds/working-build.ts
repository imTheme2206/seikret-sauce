/**
 * Persists the Working Build (the unsaved Set Builder draft) to localStorage so
 * picks such as the weapon survive a reload. Only the *new* build draft is kept;
 * an existing Saved Build is always hydrated from the server instead.
 *
 * Stored data is untrusted: anything that does not match the expected shape is
 * dropped rather than thrown, so a corrupt or outdated entry degrades to an
 * empty draft. Ids that no longer exist in the catalog are ignored by the row
 * builders, so they need no validation here.
 */

import { ARMOR_POSITIONS, EMPTY_DRAFT } from "./config";
import type {
  BuildDraft,
  DecorationAssignment,
  EditorArmorSelection,
  EditorTalismanSelection,
} from "./types";

/** Bump the suffix when the persisted shape changes incompatibly. */
export const WORKING_BUILD_KEY = "mh-wilds-working-build-v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseId = (value: unknown): string | null =>
  typeof value === "string" && value ? value : null;

const parseAssignments = (raw: unknown): DecorationAssignment[] =>
  Array.isArray(raw)
    ? raw.flatMap((item) =>
        isRecord(item) &&
        typeof item.slotIndex === "number" &&
        Number.isInteger(item.slotIndex) &&
        typeof item.decorationId === "string"
          ? [{ slotIndex: item.slotIndex, decorationId: item.decorationId }]
          : [],
      )
    : [];

const parseArmor = (raw: unknown): EditorArmorSelection | null => {
  if (!isRecord(raw)) return null;
  const armorId = parseId(raw.armorId);
  return armorId
    ? { armorId, decorations: parseAssignments(raw.decorations) }
    : null;
};

const parseTalisman = (raw: unknown): EditorTalismanSelection | null => {
  if (!isRecord(raw)) return null;
  const talismanId = parseId(raw.talismanId);
  if (!talismanId || (raw.source !== "custom" && raw.source !== "scraped")) {
    return null;
  }
  return {
    source: raw.source,
    talismanId,
    decorations: parseAssignments(raw.decorations),
  };
};

/** Coerce arbitrary stored JSON into a usable draft. */
export const parseWorkingBuild = (raw: unknown): BuildDraft => {
  if (!isRecord(raw)) return EMPTY_DRAFT;
  const composition = isRecord(raw.composition) ? raw.composition : {};
  const weapon = isRecord(composition.weapon) ? composition.weapon : {};

  const parsed: BuildDraft["composition"] = {
    ...EMPTY_DRAFT.composition,
    talisman: parseTalisman(composition.talisman),
    weapon: {
      weaponId: parseId(weapon.weaponId),
      decorations: parseAssignments(weapon.decorations),
      setBonusId: parseId(weapon.setBonusId),
      groupBonusId: parseId(weapon.groupBonusId),
    },
  };
  for (const position of ARMOR_POSITIONS) {
    parsed[position] = parseArmor(composition[position]);
  }

  return {
    name: typeof raw.name === "string" ? raw.name : "",
    description: typeof raw.description === "string" ? raw.description : "",
    isShared: raw.isShared === true,
    composition: parsed,
  };
};

/** Read the stored draft, falling back to an empty one when absent or unreadable. */
export const loadWorkingBuild = (): BuildDraft => {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const stored = window.localStorage.getItem(WORKING_BUILD_KEY);
    return stored ? parseWorkingBuild(JSON.parse(stored)) : EMPTY_DRAFT;
  } catch {
    // Corrupt JSON, or storage blocked (private mode / disabled cookies).
    return EMPTY_DRAFT;
  }
};

/** Write the draft, silently ignoring quota / access errors. */
export const saveWorkingBuild = (draft: BuildDraft): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WORKING_BUILD_KEY, JSON.stringify(draft));
  } catch {
    // Storage unavailable or full — persistence is best-effort.
  }
};

export const clearWorkingBuild = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(WORKING_BUILD_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
};
