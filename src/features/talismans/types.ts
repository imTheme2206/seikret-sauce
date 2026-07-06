/**
 * Wire shape for the enlightened-fellows-discord-bot `/api/talismans` routes.
 * Mirrors `src/domains/talismans/schema.ts` in that repo — no rename layer, same
 * reasoning as `LoadoutResult` in the loadout feature (docs/adr/0001-*).
 */

export interface TalismanSkillInput {
  skillId: string;
  level: number;
}

/** Only index 0 of a talisman's slots may be `"weapon"` — the rest are always `"armor"`. */
export interface TalismanSlot {
  type: "weapon" | "armor";
  size: number;
}

export interface CustomTalisman {
  id: string;
  userId: string;
  name: string;
  skills: TalismanSkillInput[];
  slots: TalismanSlot[];
  createdAt: string;
}

export interface CreateTalismanInput {
  name: string;
  skills: TalismanSkillInput[];
  slots: TalismanSlot[];
}

/** Mirrors the backend's `src/domains/talismans/schema.ts` limits. */
export const MAX_SKILLS_PER_TALISMAN = 3;
export const MAX_SLOTS_PER_TALISMAN = 3;
export const MAX_TALISMANS_PER_USER = 50;
