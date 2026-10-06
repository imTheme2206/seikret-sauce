import { describe, expect, test } from "bun:test";
import { EMPTY_WEAPON_SELECTION } from "@/features/builds/weapon-selection";
import type { OptimizerParams } from "./persistence";
import { DEFAULT_OPTIMIZER_PARAMS, parseOptimizerParams } from "./persistence";

describe("parseOptimizerParams", () => {
  test("round-trips valid params", () => {
    const params: OptimizerParams = {
      selected: {
        Attack: {
          name: "Attack",
          level: 3,
          maxLevel: 5,
          category: "armor",
          icon: "atk",
        },
      },
      rank: "low",
      weapon: {
        weaponId: "gogma-gs",
        decorations: [],
        setBonusId: "bn-set",
        groupBonusId: "bn-group",
        customization: {
          element: "water",
          attackParts: 1,
          affinityParts: 2,
          elementInfusion: false,
          reinforcements: [{ type: "attack", level: "EX" }],
        },
      },
    };

    expect(parseOptimizerParams(JSON.parse(JSON.stringify(params)))).toEqual(params);
  });

  test("falls back to defaults for non-object input", () => {
    expect(parseOptimizerParams(null)).toEqual(DEFAULT_OPTIMIZER_PARAMS);
    expect(parseOptimizerParams("nope")).toEqual(DEFAULT_OPTIMIZER_PARAMS);
  });

  test("drops malformed skills and keeps the rest", () => {
    const parsed = parseOptimizerParams({
      selected: {
        Good: { name: "Good", level: 1, maxLevel: 3, category: "set", icon: null },
        BadCategory: { level: 1, maxLevel: 3, category: "sword", icon: null },
        NoLevel: { maxLevel: 3, category: "armor", icon: null },
      },
    });

    expect(Object.keys(parsed.selected)).toEqual(["Good"]);
  });

  test("clamps a stored level into the skill's range", () => {
    const parsed = parseOptimizerParams({
      selected: {
        Attack: { name: "Attack", level: 99, maxLevel: 5, category: "armor", icon: null },
        Guard: { name: "Guard", level: 0, maxLevel: 5, category: "armor", icon: null },
      },
    });

    expect(parsed.selected.Attack?.level).toBe(5);
    expect(parsed.selected.Guard?.level).toBe(1);
  });

  test("rejects an unknown rank and a malformed weapon", () => {
    const parsed = parseOptimizerParams({ rank: "godlike", weapon: { weaponId: 7 } });

    expect(parsed.rank).toBe(DEFAULT_OPTIMIZER_PARAMS.rank);
    expect(parsed.weapon).toEqual(EMPTY_WEAPON_SELECTION);
  });

  test("migrates the legacy bonus-name weapon to no weapon, keeping skills and rank", () => {
    const parsed = parseOptimizerParams({
      selected: {
        Attack: { name: "Attack", level: 2, maxLevel: 5, category: "armor", icon: null },
      },
      rank: "low",
      weapon: { set: "Rey Dau", group: "Alpha" },
    });

    expect(parsed.weapon).toEqual(EMPTY_WEAPON_SELECTION);
    expect(parsed.rank).toBe("low");
    expect(parsed.selected.Attack?.level).toBe(2);
  });

  test("drops bonuses and customization that have no weapon, and weapon jewels", () => {
    expect(
      parseOptimizerParams({
        weapon: {
          weaponId: null,
          setBonusId: "bn-set",
          customization: { element: "fire", attackParts: 1 },
        },
      }).weapon,
    ).toEqual(EMPTY_WEAPON_SELECTION);

    const parsed = parseOptimizerParams({
      weapon: {
        weaponId: "gs-1",
        decorations: [{ slotIndex: 0, decorationId: "deco" }],
      },
    });
    expect(parsed.weapon.weaponId).toBe("gs-1");
    expect(parsed.weapon.decorations).toEqual([]);
  });

  test("sanitises a corrupt stored customization", () => {
    const parsed = parseOptimizerParams({
      weapon: {
        weaponId: "artian-gs",
        customization: {
          element: "plasma",
          attackParts: 99,
          affinityParts: "x",
          elementInfusion: "yes",
          reinforcements: [{ type: "attack", level: "EX" }, { type: "luck", level: "I" }],
        },
      },
    });

    expect(parsed.weapon.customization).toEqual({
      element: null,
      attackParts: 3,
      affinityParts: 0,
      elementInfusion: false,
      reinforcements: [{ type: "attack", level: "EX" }],
    });
  });
});
