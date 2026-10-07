import { describe, expect, test } from "bun:test";
import rulesJson from "./__fixtures__/artian-rules.json";
import { calculateBuild } from "./calculator";
import { draftFromBuild, snapshotFromDraft } from "./draft";
import { EMPTY_DRAFT } from "./config";
import { buildGearRows } from "./gear-rows";
import { toCreateBody } from "./utils";
import type { Armor, ArtianRules, BuildDraft, Decoration, SavedBuild, Weapon } from "./types";

const weapon: Weapon = {
  id: "gs-1",
  name: "Buster Sword",
  kind: "great-sword",
  rarity: 5,
  damage: { raw: 100, display: 300 },
  affinity: 5,
  specials: [],
  sharpness: null,
  handicraft: null,
  slots: [3, 1],
  skills: [{ skillId: "atk", name: "Attack Boost", level: 1 }],
  elderseal: null,
  defenseBonus: 0,
  series: null,
  artian: null,
  kindSpecific: {},
};

const jewel: Decoration = {
  id: "crit-jewel",
  name: "Critical Jewel",
  type: "weapon",
  slotSize: 1,
  skills: [{ skillId: "crit", name: "Critical Eye", level: 1 }],
};

const helm: Armor = {
  id: "current-helm",
  name: "Hope Mask Alpha",
  type: "head",
  rank: "high",
  rarity: 8,
  defense: 40,
  resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
  slots: [1],
  skills: [{ skillId: "current-skill", name: "Attack Boost", level: 2 }],
  bonuses: [],
};

const armorJewel: Decoration = {
  id: "current-jewel",
  name: "Attack Jewel",
  type: "armor",
  slotSize: 1,
  skills: [{ skillId: "current-skill", name: "Attack Boost", level: 1 }],
};

const buildWith = (weaponPosition: SavedBuild["composition"]["positions"]["weapon"]): SavedBuild => ({
  id: "b1",
  name: "Test",
  description: null,
  isShared: false,
  sharedAt: null,
  revision: 1,
  isStale: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  composition: {
    schemaVersion: 1,
    positions: {
      head: null,
      chest: null,
      arms: null,
      waist: null,
      legs: null,
      talisman: null,
      weapon: weaponPosition,
    },
    skillDefinitions: {},
    bonusDefinitions: {},
  },
});

test("editing a build restores armor and skill totals after catalog IDs change", () => {
  const saved = buildWith(null);
  saved.composition.positions.head = {
    ...helm,
    armorId: "old-helm",
    type: "head",
    skills: [{ skillId: "old-skill", name: "Attack Boost", level: 2 }],
    decorations: [{
      slotIndex: 0,
      decorationId: "old-jewel",
      name: armorJewel.name,
      slotSize: 1,
      skills: [{ skillId: "old-skill", name: "Attack Boost", level: 1 }],
    }],
  };

  const draft = draftFromBuild(saved, { armors: [helm], decorations: [armorJewel] });
  expect(draft.composition.head).toEqual({
    armorId: helm.id,
    decorations: [{ slotIndex: 0, decorationId: armorJewel.id }],
  });
  const head = buildGearRows(draft, [helm], [armorJewel], []).find((row) => row.position === "head");
  expect(head?.name).toBe(helm.name);
  expect(head?.skills).toEqual(helm.skills);
  expect(head?.slots[0]?.selectedId).toBe(armorJewel.id);
  const snapshot = snapshotFromDraft(draft, [helm], [armorJewel], undefined, []);
  expect(calculateBuild(snapshot).skills).toEqual({ "Attack Boost": 3 });
});

describe("weapon in the draft <-> snapshot translation", () => {
  const draft: BuildDraft = {
    ...EMPTY_DRAFT,
    name: "Test",
    composition: {
      ...EMPTY_DRAFT.composition,
      weapon: {
        weaponId: "gs-1",
        decorations: [{ slotIndex: 0, decorationId: "crit-jewel" }],
        setBonusId: null,
        groupBonusId: null,
        customization: null,
      },
    },
  };

  test("the editor snapshot carries the weapon item and its decoration", () => {
    const snapshot = snapshotFromDraft(draft, [], [jewel], undefined, [], [weapon]);
    const saved = snapshot.positions.weapon!;
    expect(saved.weaponId).toBe("gs-1");
    expect(saved.skills).toEqual(weapon.skills);
    expect(saved.decorations?.[0]).toMatchObject({
      slotIndex: 0,
      decorationId: "crit-jewel",
      slotSize: 1,
    });
  });

  test("a saved weapon hydrates back to the same draft (round trip)", () => {
    const snapshot = snapshotFromDraft(draft, [], [jewel], undefined, [], [weapon]);
    const hydrated = draftFromBuild(buildWith(snapshot.positions.weapon));
    expect(hydrated.composition.weapon).toEqual(draft.composition.weapon);
    expect(toCreateBody(hydrated).composition.weapon).toEqual(
      toCreateBody(draft).composition.weapon,
    );
  });

  test("a legacy bonus-only weapon hydrates with no weapon item or decorations", () => {
    const hydrated = draftFromBuild(
      buildWith({
        setBonus: { bonusId: "set-1", name: "Set One", kind: "set" },
        groupBonus: null,
      }),
    );
    expect(hydrated.composition.weapon).toEqual({
      weaponId: null,
      decorations: [],
      setBonusId: "set-1",
      groupBonusId: null,
      customization: null,
    });
  });

  test("a weapon id missing from the catalog falls back to its bonuses only", () => {
    const snapshot = snapshotFromDraft(draft, [], [jewel], undefined, [], []);
    expect(snapshot.positions.weapon).toBeNull();
  });
});

describe("Gogma Artian in the draft <-> snapshot translation", () => {
  const gogma: Weapon = {
    ...weapon,
    id: "ostrak",
    name: "Ostrak Oblivion (+15% affinity)",
    rarity: 8,
    damage: { raw: 180, display: 864 },
    affinity: 15,
    sharpness: { red: 140, orange: 40, yellow: 40, green: 50, blue: 70, white: 10, purple: 0 },
    slots: [3, 3, 3],
    skills: [],
    artian: { family: "gogma", tier: 8, focus: "affinity" },
  };
  const rules = rulesJson as unknown as ArtianRules;
  const customization = {
    element: "water" as const,
    attackParts: 1,
    affinityParts: 2,
    elementInfusion: false,
    reinforcements: [
      { type: "attack" as const, level: "EX" as const },
      { type: "attack" as const, level: "EX" as const },
      { type: "affinity" as const, level: "III" as const },
      { type: "element" as const, level: "EX" as const },
      { type: "sharpness" as const, level: "EX" as const },
    ],
  };
  const draft: BuildDraft = {
    ...EMPTY_DRAFT,
    name: "Gogma",
    composition: {
      ...EMPTY_DRAFT.composition,
      weapon: {
        weaponId: "ostrak",
        decorations: [],
        setBonusId: "set-1",
        groupBonusId: "group-1",
        customization,
      },
    },
  };
  const catalog = {
    skills: [],
    bonuses: [
      { id: "set-1", name: "Set One", kind: "set" as const, icon: null, thresholds: [{ piecesRequired: 1, effectName: "Set Effect", level: 1 }] },
      { id: "group-1", name: "Group One", kind: "group" as const, icon: null, thresholds: [{ piecesRequired: 1, effectName: "Group Effect", level: 1 }] },
    ],
  };

  test("the editor snapshot stores effective stats, the config and both bonuses", () => {
    const snapshot = snapshotFromDraft(draft, [], [], catalog, [], [gogma], rules);
    const saved = snapshot.positions.weapon!;
    // Same numbers the backend asserts for this configuration.
    expect(saved.damage).toEqual({ raw: 209, display: 1003 });
    expect(saved.affinity).toBe(33);
    expect(saved.specials).toEqual([
      { kind: "element", name: "water", damage: { raw: 55, display: 550 }, hidden: false },
    ]);
    expect(saved.customization).toEqual({
      family: "gogma",
      tier: 8,
      focus: "affinity",
      config: customization,
      base: { damage: { raw: 180, display: 864 }, affinity: 15 },
      sharpnessBonus: 50,
      ammoBonus: 0,
      gameVersion: "1.041",
    });
    expect(saved.setBonus?.name).toBe("Set One");
    expect(saved.groupBonus?.name).toBe("Group One");
  });

  test("the Gogma set and group bonus count toward the editor's totals", () => {
    const snapshot = snapshotFromDraft(draft, [], [], catalog, [], [gogma], rules);
    const totals = calculateBuild(snapshot);
    expect(totals.bonusCounts).toEqual({ "Set One": 1, "Group One": 1 });
    expect(totals.activeBonuses.map((bonus) => bonus.effectName).sort()).toEqual([
      "Group Effect",
      "Set Effect",
    ]);
  });

  test("a saved Gogma weapon hydrates back to the same draft and save body", () => {
    const snapshot = snapshotFromDraft(draft, [], [], catalog, [], [gogma], rules);
    const hydrated = draftFromBuild(buildWith(snapshot.positions.weapon));
    expect(hydrated.composition.weapon).toEqual(draft.composition.weapon);
    expect(toCreateBody(hydrated).composition.weapon).toEqual(
      toCreateBody(draft).composition.weapon,
    );
  });

  test("without the rules the weapon shows its catalog stats and no configuration", () => {
    const snapshot = snapshotFromDraft(draft, [], [], catalog, [], [gogma]);
    expect(snapshot.positions.weapon?.damage).toEqual(gogma.damage);
    expect(snapshot.positions.weapon?.customization).toBeNull();
  });
});
