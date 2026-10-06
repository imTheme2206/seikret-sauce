import { afterEach, expect, test } from "bun:test";
import { EMPTY_DRAFT } from "./config";
import {
  clearWorkingBuild,
  loadWorkingBuild,
  loadWorkingTarget,
  parseWorkingBuild,
  parseWorkingTarget,
  saveWorkingBuild,
  saveWorkingTarget,
  WORKING_BUILD_KEY,
} from "./working-build";
import type { BuildDraft } from "./types";
import { toCreateBody } from "./utils";

test("a persisted weapon selection survives the JSON round trip", () => {
  const draft = {
    ...EMPTY_DRAFT,
    name: "Thunder lance",
    composition: {
      ...EMPTY_DRAFT.composition,
      head: {
        armorId: "helm",
        decorations: [{ slotIndex: 0, decorationId: "jewel" }],
      },
      weapon: {
        weaponId: "rey-2",
        decorations: [{ slotIndex: 0, decorationId: "tenderizer" }],
        setBonusId: "set",
        groupBonusId: null,
        customization: null,
      },
    },
  };
  expect(parseWorkingBuild(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
});

test("garbage degrades to the empty draft", () => {
  expect(parseWorkingBuild(null)).toEqual(EMPTY_DRAFT);
  expect(parseWorkingBuild("nope")).toEqual(EMPTY_DRAFT);
  expect(parseWorkingBuild([])).toEqual(EMPTY_DRAFT);
});

test("malformed fields are dropped one by one, not all at once", () => {
  const parsed = parseWorkingBuild({
    name: "Kept",
    isShared: "yes",
    composition: {
      head: { armorId: 12 },
      chest: { armorId: "chest", decorations: [{ slotIndex: "0" }, { slotIndex: 1, decorationId: "d" }] },
      talisman: { source: "bogus", talismanId: "t" },
      weapon: { weaponId: 5, setBonusId: "set" },
    },
  });
  expect(parsed.name).toBe("Kept");
  expect(parsed.isShared).toBe(false);
  expect(parsed.composition.head).toBeNull();
  expect(parsed.composition.chest).toEqual({
    armorId: "chest",
    decorations: [{ slotIndex: 1, decorationId: "d" }],
  });
  expect(parsed.composition.talisman).toBeNull();
  expect(parsed.composition.weapon).toEqual({
    weaponId: null,
    decorations: [],
    setBonusId: "set",
    groupBonusId: null,
    customization: null,
  });
});

test("the save body carries the weapon, its decorations and bonuses", () => {
  const body = toCreateBody({
    ...EMPTY_DRAFT,
    name: "x",
    composition: {
      ...EMPTY_DRAFT.composition,
      weapon: {
        weaponId: "rey-2",
        decorations: [{ slotIndex: 1, decorationId: "tenderizer" }],
        setBonusId: "set",
        groupBonusId: null,
        customization: null,
      },
    },
  });
  expect(body.composition.weapon).toEqual({
    weaponId: "rey-2",
    decorations: [{ slotIndex: 1, decorationId: "tenderizer" }],
    setBonusId: "set",
    groupBonusId: null,
    customization: null,
  });
});

test("stray weapon decorations are dropped when no weapon is chosen", () => {
  const body = toCreateBody({
    ...EMPTY_DRAFT,
    name: "x",
    composition: {
      ...EMPTY_DRAFT.composition,
      weapon: {
        weaponId: null,
        decorations: [{ slotIndex: 0, decorationId: "tenderizer" }],
        setBonusId: "set",
        groupBonusId: null,
        customization: null,
      },
    },
  });
  expect(body.composition.weapon?.decorations).toEqual([]);
});

test("an Artian configuration survives the stored draft and rides the save body", () => {
  const customization = {
    element: "water" as const,
    attackParts: 1,
    affinityParts: 2,
    elementInfusion: true,
    reinforcements: [
      { type: "attack" as const, level: "EX" as const },
      { type: "sharpness" as const, level: "I" as const },
    ],
  };
  const draft: BuildDraft = {
    ...EMPTY_DRAFT,
    name: "x",
    composition: {
      ...EMPTY_DRAFT.composition,
      weapon: {
        weaponId: "gogma-1",
        decorations: [],
        setBonusId: "set",
        groupBonusId: "group",
        customization,
      },
    },
  };
  expect(parseWorkingBuild(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
  expect(toCreateBody(draft).composition.weapon?.customization).toEqual(customization);
  // No weapon, no configuration: the API rejects one on a bonus-only weapon.
  const noWeapon = toCreateBody({
    ...draft,
    composition: {
      ...draft.composition,
      weapon: { ...draft.composition.weapon, weaponId: null },
    },
  });
  expect(noWeapon.composition.weapon?.customization).toBeNull();
});

test("a malformed stored customization is repaired field by field", () => {
  const parsed = parseWorkingBuild({
    composition: {
      weapon: {
        weaponId: "gogma-1",
        customization: {
          element: "plasma",
          attackParts: 9,
          affinityParts: "2",
          elementInfusion: "yes",
          reinforcements: [
            { type: "attack", level: "EX" },
            { type: "luck", level: "I" },
            { type: "attack", level: "MAX" },
          ],
        },
      },
    },
  });
  expect(parsed.composition.weapon.customization).toEqual({
    element: null,
    attackParts: 3,
    affinityParts: 0,
    elementInfusion: false,
    reinforcements: [{ type: "attack", level: "EX" }],
  });
  expect(parseWorkingBuild({ composition: { weapon: { weaponId: "w", customization: "x" } } }).composition.weapon.customization).toBeNull();
});

// ── Hunt target stored beside the draft ─────────────────────────────────────

const stubStorage = (initial?: string) => {
  const store = new Map<string, string>();
  if (initial !== undefined) store.set(WORKING_BUILD_KEY, initial);
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  };
  return store;
};

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

test("a draft stored before targets existed still loads, with no target", () => {
  const legacy = { ...EMPTY_DRAFT, name: "Old draft" };
  stubStorage(JSON.stringify(legacy));
  expect(loadWorkingBuild().name).toBe("Old draft");
  expect(loadWorkingTarget()).toBeNull();
});

test("the target survives draft saves and does not leak into the draft", () => {
  const store = stubStorage();
  saveWorkingTarget({ monsterId: "rathalos", partId: "head" });
  saveWorkingBuild({ ...EMPTY_DRAFT, name: "Thunder lance" });

  expect(loadWorkingTarget()).toEqual({ monsterId: "rathalos", partId: "head" });
  expect(loadWorkingBuild()).toEqual({ ...EMPTY_DRAFT, name: "Thunder lance" });
  expect(Object.keys(parseWorkingBuild(JSON.parse(store.get(WORKING_BUILD_KEY)!)))).not.toContain("target");
});

test("saving the draft keeps the target but drops the draft content", () => {
  stubStorage();
  saveWorkingBuild({ ...EMPTY_DRAFT, name: "Gone after save" });
  saveWorkingTarget({ monsterId: "rathalos", partId: null });
  clearWorkingBuild();
  expect(loadWorkingBuild()).toEqual(EMPTY_DRAFT);
  expect(loadWorkingTarget()).toEqual({ monsterId: "rathalos", partId: null });
});

test("clearing the target leaves the draft alone, and an empty entry is removed", () => {
  const store = stubStorage();
  saveWorkingTarget({ monsterId: "rathalos", partId: null });
  saveWorkingTarget(null);
  expect(store.has(WORKING_BUILD_KEY)).toBe(false);

  saveWorkingBuild({ ...EMPTY_DRAFT, name: "Kept" });
  saveWorkingTarget({ monsterId: "rathian", partId: null });
  saveWorkingTarget(null);
  expect(loadWorkingBuild().name).toBe("Kept");
  expect(loadWorkingTarget()).toBeNull();
});

test("a malformed stored target means no target", () => {
  expect(parseWorkingTarget({ target: { monsterId: 7 } })).toBeNull();
  expect(parseWorkingTarget({ target: "x" })).toBeNull();
  expect(parseWorkingTarget({ target: { monsterId: "m", partId: 3 } })).toEqual({
    monsterId: "m",
    partId: null,
  });
});
