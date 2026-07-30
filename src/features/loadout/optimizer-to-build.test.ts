import { describe, expect, test } from "bun:test";
import type { Armor, Decoration } from "@/features/builds/types";
import { optimizerResultToBuild } from "./optimizer-to-build";
import type { LoadoutResult, SelectedSkill } from "./types";

const resistances = { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 };

const armors: Armor[] = [
  {
    id: "head-id",
    name: "Alpha Helm",
    type: "head",
    rank: "high",
    rarity: 8,
    defense: 50,
    resistances,
    slots: [4],
    skills: [],
    bonuses: [],
  },
  {
    id: "chest-id",
    name: "Alpha Mail",
    type: "chest",
    rank: "high",
    rarity: 8,
    defense: 50,
    resistances,
    slots: [1],
    skills: [],
    bonuses: [],
  },
  {
    id: "arms-id",
    name: "Alpha Vambraces",
    type: "arms",
    rank: "high",
    rarity: 8,
    defense: 50,
    resistances,
    slots: [],
    skills: [],
    bonuses: [],
  },
  {
    id: "waist-id",
    name: "Alpha Coil",
    type: "waist",
    rank: "high",
    rarity: 8,
    defense: 50,
    resistances,
    slots: [],
    skills: [],
    bonuses: [],
  },
  {
    id: "legs-id",
    name: "Alpha Greaves",
    type: "legs",
    rank: "high",
    rarity: 8,
    defense: 50,
    resistances,
    slots: [],
    skills: [],
    bonuses: [],
  },
  {
    id: "talisman-id",
    name: "Power Charm",
    type: "talisman",
    rank: "high",
    rarity: 0,
    defense: 0,
    resistances,
    slots: [],
    skills: [],
    bonuses: [],
  },
];

const decorations: Decoration[] = [
  {
    id: "small-deco",
    name: "Small Jewel",
    type: "armor",
    slotSize: 1,
    skills: [],
  },
  {
    id: "large-deco",
    name: "Large Jewel",
    type: "armor",
    slotSize: 4,
    skills: [],
  },
];

const result: LoadoutResult = {
  armorNames: armors.map(({ name }) => name),
  rarities: [8, 8, 8, 8, 8, 0],
  skills: {},
  setSkills: {},
  groupSkills: {},
  // Deliberately small-first: conversion must still reserve the size-4 slot.
  decoNames: ["Small Jewel", "Large Jewel"],
  freeSlots: [],
  slots: [],
  defense: 250,
  elementalDefenses: resistances,
};

const selected: SelectedSkill[] = [
  {
    name: "Attack Boost",
    level: 5,
    maxLevel: 5,
    category: "armor",
    icon: null,
  },
];

describe("optimizerResultToBuild", () => {
  test("resolves catalog ids and assigns decorations to fitting equipment slots", () => {
    const body = optimizerResultToBuild(
      result,
      1,
      selected,
      armors,
      decorations,
    );

    expect(body.name).toBe("Optimized: Attack Boost");
    expect(body.isShared).toBe(false);
    expect(body.composition.head).toEqual({
      armorId: "head-id",
      decorations: [{ slotIndex: 0, decorationId: "large-deco" }],
    });
    expect(body.composition.chest).toEqual({
      armorId: "chest-id",
      decorations: [{ slotIndex: 0, decorationId: "small-deco" }],
    });
    expect(body.composition.talisman).toEqual({
      source: "scraped",
      talismanId: "talisman-id",
      decorations: [],
    });
  });

  test("rejects a result that no longer matches the current catalog", () => {
    expect(() =>
      optimizerResultToBuild(
        { ...result, armorNames: ["Missing Helm", ...result.armorNames.slice(1)] },
        1,
        selected,
        armors,
        decorations,
      ),
    ).toThrow("Missing Helm");
  });
});
