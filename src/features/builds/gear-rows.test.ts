import { expect, test } from "bun:test";
import type { CustomTalisman } from "@/features/talismans/types";
import { EMPTY_DRAFT } from "./config";
import { buildGearRows } from "./gear-rows";
import type { Armor, Decoration, SkillCatalog } from "./types";

const armor: Armor = {
  id: "helm",
  name: "Hope Mask Alpha",
  type: "head",
  rank: "high",
  rarity: 8,
  defense: 40,
  resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
  slots: [3, 1],
  skills: [{ skillId: "attack", name: "Attack Boost", level: 2 }],
  bonuses: [
    { bonusId: "might", name: "Doshaguma's Might", kind: "set" },
  ],
};

const decoration: Decoration = {
  id: "attack-jewel",
  name: "Attack Jewel",
  type: "armor",
  slotSize: 1,
  skills: [{ skillId: "attack", name: "Attack Boost", level: 1 }],
};

const customTalisman: CustomTalisman = {
  id: "custom-talisman",
  userId: "hunter",
  name: "Lucky Charm",
  skills: [{ skillId: "attack", level: 3 }],
  slots: [{ type: "armor", size: 2 }],
  createdAt: "2026-08-24T00:00:00.000Z",
};

const skillCatalog: SkillCatalog = {
  skills: [
    {
      id: "attack",
      name: "Attack Boost",
      kind: "armor",
      maxLevel: 7,
      icon: null,
    },
  ],
  bonuses: [],
};

test("picker options expose skills, bonuses, and available slots", () => {
  const draft = {
    ...EMPTY_DRAFT,
    composition: {
      ...EMPTY_DRAFT.composition,
      head: { armorId: armor.id, decorations: [] },
    },
  };

  const rows = buildGearRows(
    draft,
    [armor],
    [decoration],
    [customTalisman],
    skillCatalog,
  );

  const head = rows.find((row) => row.position === "head");
  expect(head?.groups[0]?.options[0]).toMatchObject({
    skills: armor.skills,
    bonuses: armor.bonuses,
    slots: [3, 1],
  });
  expect(head?.slots[0]?.groups[0]?.options[0]?.skills).toEqual(
    decoration.skills,
  );

  const talisman = rows.find((row) => row.position === "talisman");
  expect(talisman?.groups[0]?.options[0]).toMatchObject({
    skills: [{ name: "Attack Boost", level: 3 }],
    slots: [2],
  });
});
