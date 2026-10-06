import { expect, test } from "bun:test";
import { EMPTY_DRAFT } from "./config";
import { parseWorkingBuild } from "./working-build";
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
      },
    },
  });
  expect(body.composition.weapon).toEqual({
    weaponId: "rey-2",
    decorations: [{ slotIndex: 1, decorationId: "tenderizer" }],
    setBonusId: "set",
    groupBonusId: null,
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
      },
    },
  });
  expect(body.composition.weapon?.decorations).toEqual([]);
});
