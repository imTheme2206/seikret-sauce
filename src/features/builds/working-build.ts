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
import { ARTIAN_ELEMENTS, ARTIAN_REINFORCEMENT_TYPES } from "./artian";
import type {
  ArtianCustomization,
  ArtianElement,
  ArtianReinforcement,
  ArtianReinforcementLevel,
  ArtianReinforcementType,
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

const REINFORCEMENT_LEVELS: ArtianReinforcementLevel[] = ["I", "II", "III", "EX"];

const parseCount = (value: unknown): number =>
  typeof value === "number" && Number.isInteger(value)
    ? Math.min(3, Math.max(0, value))
    : 0;

const parseReinforcements = (raw: unknown): ArtianReinforcement[] =>
  Array.isArray(raw)
    ? raw.flatMap((item) =>
        isRecord(item) &&
        ARTIAN_REINFORCEMENT_TYPES.includes(item.type as ArtianReinforcementType) &&
        REINFORCEMENT_LEVELS.includes(item.level as ArtianReinforcementLevel)
          ? [
              {
                type: item.type as ArtianReinforcementType,
                level: item.level as ArtianReinforcementLevel,
              },
            ]
          : [],
      )
    : [];

/** Stored customization is untrusted; anything unrecognisable collapses to "no configuration". */
const parseCustomization = (raw: unknown): ArtianCustomization | null => {
  if (!isRecord(raw)) return null;
  return {
    element: ARTIAN_ELEMENTS.includes(raw.element as ArtianElement)
      ? (raw.element as ArtianElement)
      : null,
    attackParts: parseCount(raw.attackParts),
    affinityParts: parseCount(raw.affinityParts),
    elementInfusion: raw.elementInfusion === true,
    reinforcements: parseReinforcements(raw.reinforcements),
  };
};

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

/**
 * The hunter's chosen target (a monster, optionally one of its parts), stored
 * next to the draft under the same key but outside `BuildDraft`: the target is
 * a calculation choice, never part of the saved build (backend ADR-0015). Ids
 * are catalog ids; ones the catalog no longer holds are resolved away on read.
 */
export type HuntTarget = {
  monsterId: string;
  partId: string | null;
};

/** Read the target out of an arbitrary stored entry; anything malformed means "no target". */
export const parseWorkingTarget = (raw: unknown): HuntTarget | null => {
  if (!isRecord(raw) || !isRecord(raw.target)) return null;
  const monsterId = parseId(raw.target.monsterId);
  return monsterId
    ? { monsterId, partId: parseId(raw.target.partId) }
    : null;
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
      customization: parseCustomization(weapon.customization),
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

/** The raw stored entry, or an empty record when absent, unreadable or not an object. */
const readEntry = (): Record<string, unknown> => {
  try {
    const stored = window.localStorage.getItem(WORKING_BUILD_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeEntry = (entry: Record<string, unknown>): void => {
  try {
    if (Object.keys(entry).length === 0) {
      window.localStorage.removeItem(WORKING_BUILD_KEY);
    } else {
      window.localStorage.setItem(WORKING_BUILD_KEY, JSON.stringify(entry));
    }
  } catch {
    // Storage unavailable or full — persistence is best-effort.
  }
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

/** Write the draft, keeping the stored target; silently ignores quota / access errors. */
export const saveWorkingBuild = (draft: BuildDraft): void => {
  if (typeof window === "undefined") return;
  const target = parseWorkingTarget(readEntry());
  writeEntry(target ? { ...draft, target } : { ...draft });
};

/**
 * Discard the draft after a save. The target stays: it is a choice about the
 * hunt, not content of the build that was just saved.
 */
export const clearWorkingBuild = (): void => {
  if (typeof window === "undefined") return;
  const target = parseWorkingTarget(readEntry());
  writeEntry(target ? { target } : {});
};

export const loadWorkingTarget = (): HuntTarget | null =>
  typeof window === "undefined" ? null : parseWorkingTarget(readEntry());

/** Persist (or clear, with `null`) the target without touching the draft. */
export const saveWorkingTarget = (target: HuntTarget | null): void => {
  if (typeof window === "undefined") return;
  const { target: _previous, ...rest } = readEntry();
  writeEntry(target ? { ...rest, target } : rest);
};
