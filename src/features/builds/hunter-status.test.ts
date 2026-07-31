import { expect, test } from "bun:test";
import { createSkillCatalog } from "@/features/skills/skill-catalog";
import { createHunterStatus } from "./hunter-status";
import type { BuildSnapshot } from "./types";

const snapshot: BuildSnapshot = {
  schemaVersion: 1,
  positions: {
    head: {
      armorId: "head-1",
      name: "Test Helm",
      type: "head",
      rank: "high",
      rarity: 8,
      defense: 10,
      resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
      slots: [],
      skills: [{ skillId: "attack", name: "Attack Boost", level: 1 }],
      bonuses: [],
      decorations: [],
    },
    chest: null,
    arms: null,
    waist: null,
    legs: null,
    talisman: null,
    weapon: null,
  },
  skillDefinitions: { "Attack Boost": 7 },
  bonusDefinitions: {},
};

test("joins calculated Build totals with Skill Catalog presentation metadata", () => {
  const catalog = createSkillCatalog({
    skills: [
      {
        id: "attack",
        name: "Attack Boost",
        kind: "armor",
        maxLevel: 7,
        icon: "attack",
      },
    ],
    bonuses: [],
  });

  expect(createHunterStatus(snapshot, catalog).skills).toEqual([
    {
      name: "Attack Boost",
      level: 1,
      icon: "attack",
      category: "armor",
    },
  ]);
});
