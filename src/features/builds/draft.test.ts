import { describe, expect, test } from "bun:test";
import { draftFromBuild, snapshotFromDraft } from "./draft";
import { EMPTY_DRAFT } from "./config";
import { toCreateBody } from "./utils";
import type { BuildDraft, Decoration, SavedBuild, Weapon } from "./types";

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
  kindSpecific: {},
};

const jewel: Decoration = {
  id: "crit-jewel",
  name: "Critical Jewel",
  type: "weapon",
  slotSize: 1,
  skills: [{ skillId: "crit", name: "Critical Eye", level: 1 }],
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
    });
  });

  test("a weapon id missing from the catalog falls back to its bonuses only", () => {
    const snapshot = snapshotFromDraft(draft, [], [jewel], undefined, [], []);
    expect(snapshot.positions.weapon).toBeNull();
  });
});
