import { describe, expect, test } from "bun:test";
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
      weaponSkills: { set: "Rey Dau's Voltage", group: "The Wind's Embrace" },
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

  test("keeps Set/Group selections and drops malformed weapon objects", () => {
    const parsed = parseOptimizerParams({
      rank: "godlike",
      weapon: { weaponId: "old-catalog-weapon" },
      weaponSkills: { set: "Rey Dau's Voltage", group: 42 },
    });

    expect(parsed.rank).toBe(DEFAULT_OPTIMIZER_PARAMS.rank);
    expect(parsed.weaponSkills).toEqual({ set: "Rey Dau's Voltage", group: null });
  });

  test("migrates legacy bonus names to starting pieces", () => {
    const parsed = parseOptimizerParams({
      selected: {
        Attack: { name: "Attack", level: 2, maxLevel: 5, category: "armor", icon: null },
      },
      rank: "low",
      weapon: { set: "Rey Dau's Voltage", group: "The Wind's Embrace" },
    });

    expect(parsed.weaponSkills).toEqual({
      set: "Rey Dau's Voltage",
      group: "The Wind's Embrace",
    });
    expect(parsed.rank).toBe("low");
    expect(parsed.selected.Attack?.level).toBe(2);
  });
});
