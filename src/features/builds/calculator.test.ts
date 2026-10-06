import { describe, expect, test } from "bun:test";
import { calculateBuild } from "./calculator";
import type { BuildSnapshot } from "./types";

const emptyPositions: BuildSnapshot["positions"] = {
  head: null,
  chest: null,
  arms: null,
  waist: null,
  legs: null,
  talisman: null,
  weapon: null,
};

describe("calculateBuild", () => {
  test("sums equipment, decorations, defenses and caps granted skills", () => {
    const snapshot: BuildSnapshot = {
      schemaVersion: 1,
      positions: {
        ...emptyPositions,
        head: {
          armorId: "head-1",
          name: "Doshaguma Helm",
          type: "head",
          rank: "high",
          rarity: 6,
          defense: 48,
          resistances: { fire: 2, water: -1, thunder: -3, ice: 1, dragon: 0 },
          slots: [2],
          skills: [{ skillId: "atk", name: "Attack Boost", level: 2 }],
          bonuses: [{ bonusId: "might", name: "Doshaguma's Might", kind: "set" }],
          decorations: [{
            slotIndex: 0,
            decorationId: "atk-jewel",
            name: "Attack Jewel",
            slotSize: 1,
            skills: [{ skillId: "atk", name: "Attack Boost", level: 1 }],
          }],
        },
        chest: {
          armorId: "chest-1",
          name: "Doshaguma Mail",
          type: "chest",
          rank: "high",
          rarity: 6,
          defense: 50,
          resistances: { fire: 2, water: -1, thunder: -3, ice: 1, dragon: 0 },
          slots: [],
          skills: [],
          bonuses: [{ bonusId: "might", name: "Doshaguma's Might", kind: "set" }],
          decorations: [],
        },
      },
      skillDefinitions: { "Attack Boost": 3, "Powerhouse I": 1 },
      bonusDefinitions: {
        "Doshaguma's Might": {
          kind: "set",
          thresholds: [
            { piecesRequired: 2, effectName: "Powerhouse I", level: 1 },
            { piecesRequired: 4, effectName: "Powerhouse II", level: 1 },
          ],
        },
      },
    };

    expect(calculateBuild(snapshot)).toMatchObject({
      skills: { "Attack Boost": 3 },
      defense: 98,
      resistances: { fire: 4, water: -2, thunder: -6, ice: 2, dragon: 0 },
      activeBonuses: [{
        name: "Doshaguma's Might",
        pieces: 2,
        effectName: "Powerhouse I",
      }],
    });
  });

  test("a weapon-contributed bonus counts toward activation like a piece would", () => {
    const snapshot: BuildSnapshot = {
      schemaVersion: 1,
      positions: {
        ...emptyPositions,
        head: {
          armorId: "head-1",
          name: "Doshaguma Helm",
          type: "head",
          rank: "high",
          rarity: 6,
          defense: 48,
          resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
          slots: [],
          skills: [],
          bonuses: [{ bonusId: "might", name: "Doshaguma's Might", kind: "set" }],
          decorations: [],
        },
        // Only one armor piece carries the bonus — activation needs the
        // weapon's contribution to reach the threshold of 2.
        weapon: {
          setBonus: { bonusId: "might", name: "Doshaguma's Might", kind: "set" },
          groupBonus: null,
        },
      },
      skillDefinitions: {},
      bonusDefinitions: {
        "Doshaguma's Might": {
          kind: "set",
          thresholds: [
            { piecesRequired: 2, effectName: "Powerhouse I", level: 1 },
          ],
        },
      },
    };

    const totals = calculateBuild(snapshot);
    expect(totals.bonusCounts["Doshaguma's Might"]).toBe(2);
    expect(totals.activeBonuses).toEqual([{
      name: "Doshaguma's Might",
      kind: "set",
      pieces: 2,
      piecesRequired: 2,
      effectName: "Powerhouse I",
      level: 1,
    }]);
  });
});

describe("calculateBuild weapon contribution", () => {
  const weaponSnapshot = (weapon: BuildSnapshot["positions"]["weapon"]): BuildSnapshot => ({
    schemaVersion: 1,
    positions: {
      ...emptyPositions,
      head: {
        armorId: "head-1",
        name: "Helm",
        type: "head",
        rank: "high",
        rarity: 6,
        defense: 10,
        resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
        slots: [],
        skills: [{ skillId: "atk", name: "Attack Boost", level: 2 }],
        bonuses: [],
        decorations: [],
      },
      weapon,
    },
    skillDefinitions: { "Attack Boost": 5, "Critical Eye": 3 },
    bonusDefinitions: {},
  });

  test("weapon skills and weapon decoration skills add to raw skill levels", () => {
    const totals = calculateBuild(
      weaponSnapshot({
        weaponId: "gs-1",
        name: "Buster Sword",
        kind: "great-sword",
        rarity: 5,
        damage: { raw: 100, display: 300 },
        affinity: 0,
        specials: [],
        sharpness: null,
        slots: [3, 1],
        skills: [{ skillId: "atk", name: "Attack Boost", level: 1 }],
        decorations: [
          {
            slotIndex: 0,
            decorationId: "crit-jewel",
            name: "Critical Jewel",
            slotSize: 1,
            skills: [{ skillId: "crit", name: "Critical Eye", level: 2 }],
          },
          {
            slotIndex: 1,
            decorationId: "atk-jewel",
            name: "Attack Jewel",
            slotSize: 1,
            skills: [{ skillId: "atk", name: "Attack Boost", level: 1 }],
          },
        ],
        setBonus: null,
        groupBonus: null,
      }),
    );
    // armor 2 + weapon 1 + weapon jewel 1
    expect(totals.rawSkills["Attack Boost"]).toBe(4);
    expect(totals.rawSkills["Critical Eye"]).toBe(2);
    expect(totals.skills["Attack Boost"]).toBe(4);
  });

  test("raw skill levels past the maximum are capped in effective skills", () => {
    const totals = calculateBuild(
      weaponSnapshot({
        weaponId: "gs-1",
        skills: [{ skillId: "atk", name: "Attack Boost", level: 5 }],
        decorations: [],
        setBonus: null,
        groupBonus: null,
      }),
    );
    expect(totals.rawSkills["Attack Boost"]).toBe(7);
    expect(totals.skills["Attack Boost"]).toBe(5);
  });

  test("a legacy bonus-only weapon snapshot contributes no skills and does not throw", () => {
    const totals = calculateBuild(
      weaponSnapshot({ setBonus: null, groupBonus: null }),
    );
    expect(totals.rawSkills).toEqual({ "Attack Boost": 2 });
  });
});
