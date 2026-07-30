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
      skills: { "Attack Boost": 3, "Powerhouse I": 1 },
      defense: 98,
      resistances: { fire: 4, water: -2, thunder: -6, ice: 2, dragon: 0 },
      activeBonuses: [{
        name: "Doshaguma's Might",
        pieces: 2,
        effectName: "Powerhouse I",
      }],
    });
  });
});
