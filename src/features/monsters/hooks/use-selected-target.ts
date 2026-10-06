import { useHuntTarget } from "./use-hunt-target";
import { useMonster } from "./use-monsters";
import type { MonsterDetail, MonsterPart } from "../types";

export type SelectedTarget = {
  /** The chosen monster resolved against the current catalog; null when none is chosen or it is gone. */
  monster: MonsterDetail | null;
  /** The chosen part of that monster; null when the whole monster is targeted or the part is gone. */
  part: MonsterPart | null;
  isLoading: boolean;
};

/**
 * The target for calculations (#07): the persisted selection resolved to live
 * catalog data. Stale ids degrade to "no target" rather than throwing.
 * Key derived values on `monster.dataVersion.hash`, which changes whenever a
 * patch changes the monster's numbers (backend ADR-0015).
 */
export const useSelectedTarget = (): SelectedTarget => {
  const { target } = useHuntTarget();
  const { monster, isLoading, error } = useMonster(target?.monsterId ?? null);

  const resolved = error ? null : (monster ?? null);
  const part =
    resolved?.parts.find((candidate) => candidate.id === target?.partId) ??
    null;

  return { monster: resolved, part, isLoading };
};
