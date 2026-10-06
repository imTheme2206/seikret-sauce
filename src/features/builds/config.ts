/**
 * Static configuration for the Builds feature.
 *
 * The position lists come from `@/lib/mh-wilds` and are typed here as the
 * API-derived `PositionKey`/`ArmorPosition`, so if the backend snapshot ever
 * gains or renames a position these assignments stop compiling.
 */

import {
  ARMOR_POSITIONS as MH_ARMOR_POSITIONS,
  EQUIPMENT_POSITIONS,
} from "@/lib/mh-wilds";
import type { ArmorPosition, BuildDraft, PositionKey } from "./types";

/** All six positions, in equip order. */
export const POSITION_KEYS: PositionKey[] = EQUIPMENT_POSITIONS;

/** The five body pieces — talisman handled separately, it has its own sources. */
export const ARMOR_POSITIONS: ArmorPosition[] = MH_ARMOR_POSITIONS;

/** Server-side field limits, mirrored so the inputs can enforce them. */
export const DRAFT_LIMITS = {
  name: 80,
  description: 500,
} as const;

/** Placeholder value for shadcn `Select`, which cannot hold an empty string. */
export const EMPTY_OPTION = "__empty__";

export const EMPTY_DRAFT: BuildDraft = {
  name: "",
  description: "",
  isShared: false,
  composition: {
    head: null,
    chest: null,
    arms: null,
    waist: null,
    legs: null,
    talisman: null,
    weapon: { setBonusId: null, groupBonusId: null },
  },
};
