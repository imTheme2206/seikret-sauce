import { useSyncExternalStore } from "react";
import {
  loadWorkingTarget,
  saveWorkingTarget,
  type HuntTarget,
} from "@/features/builds/working-build";

/**
 * The hunter's chosen target, persisted with the Working Build
 * (`working-build.ts`). A tiny module-level store so every reader (the hitzone
 * page today, the EFR panel in #07) sees the same selection and updates
 * together; localStorage stays the source of truth across reloads.
 */

type Listener = () => void;

let current: HuntTarget | null | undefined;
const listeners = new Set<Listener>();

const read = (): HuntTarget | null => {
  if (current === undefined) current = loadWorkingTarget();
  return current;
};

const write = (next: HuntTarget | null): void => {
  current = next;
  saveWorkingTarget(next);
  for (const listener of listeners) listener();
};

const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Raw stored selection; ids may refer to catalog entries that no longer exist. */
export const useHuntTarget = () => {
  const target = useSyncExternalStore(subscribe, read, () => null);

  return {
    target,
    /** Picking a different monster drops the part: parts belong to one monster. */
    selectMonster: (monsterId: string | null) => {
      if (!monsterId) return write(null);
      if (read()?.monsterId === monsterId) return;
      write({ monsterId, partId: null });
    },
    /** Pick (or clear, with `null`) the part of the current monster being targeted. */
    selectPart: (partId: string | null) => {
      const existing = read();
      if (existing) write({ ...existing, partId });
    },
  };
};
