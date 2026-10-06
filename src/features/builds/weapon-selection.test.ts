import { describe, expect, test } from "bun:test";
import rulesJson from "./__fixtures__/artian-rules.json";
import type {
  ArtianRules,
  EditorArtianPanel,
  EditorWeaponSelection,
  Weapon,
} from "./types";
import {
  EMPTY_WEAPON_SELECTION,
  dropStrayBonuses,
  equipWeapon,
  weaponProblem,
  withWeaponBonus,
  withWeaponCustomization,
} from "./weapon-selection";

const rules = rulesJson as unknown as ArtianRules;

const weapon = (overrides: Partial<Weapon>): Weapon => ({
  id: "gs-1",
  name: "Buster Sword",
  kind: "great-sword",
  rarity: 5,
  damage: { raw: 100, display: 300 },
  affinity: 0,
  specials: [],
  sharpness: null,
  handicraft: null,
  slots: [3],
  skills: [],
  elderseal: null,
  defenseBonus: 0,
  series: null,
  artian: null,
  kindSpecific: {},
  ...overrides,
});

const weapons: Weapon[] = [
  weapon({}),
  weapon({ id: "artian", artian: { family: "artian", tier: 8, focus: null } }),
  weapon({ id: "gogma-a", artian: { family: "gogma", tier: 8, focus: "affinity" } }),
  weapon({ id: "gogma-b", artian: { family: "gogma", tier: 8, focus: "element" } }),
];

const gogma: EditorWeaponSelection = {
  weaponId: "gogma-a",
  decorations: [{ slotIndex: 0, decorationId: "jewel" }],
  setBonusId: "bn-set",
  groupBonusId: "bn-group",
  customization: {
    element: "fire",
    attackParts: 1,
    affinityParts: 0,
    elementInfusion: false,
    reinforcements: [{ type: "attack", level: "EX" }],
  },
};

describe("equipWeapon", () => {
  test("another Gogma row keeps the rolled bonuses and configuration, but not the jewels", () => {
    const next = equipWeapon(gogma, "gogma-b", weapons, rules);
    expect(next.weaponId).toBe("gogma-b");
    expect(next.setBonusId).toBe("bn-set");
    expect(next.groupBonusId).toBe("bn-group");
    expect(next.customization?.element).toBe("fire");
    expect(next.decorations).toEqual([]);
  });

  test("a plain weapon, or unequipping, clears bonuses and configuration", () => {
    for (const id of ["gs-1", "artian", ""]) {
      const next = equipWeapon(gogma, id, weapons, rules);
      expect(next.weaponId).toBe(id || null);
      expect(next.setBonusId).toBeNull();
      expect(next.groupBonusId).toBeNull();
      expect(next.customization).toBeNull();
    }
  });

  test("re-picking the same weapon keeps its jewels", () => {
    expect(equipWeapon(gogma, "gogma-a", weapons, rules).decorations).toEqual(gogma.decorations);
  });
});

describe("selection edits", () => {
  test("bonuses are set and cleared independently", () => {
    const next = withWeaponBonus(EMPTY_WEAPON_SELECTION, "setBonusId", "bn-set");
    expect(next).toMatchObject({ setBonusId: "bn-set", groupBonusId: null });
    expect(withWeaponBonus(next, "setBonusId", null).setBonusId).toBeNull();
  });

  test("a configuration needs an equipped weapon", () => {
    const config = gogma.customization!;
    expect(withWeaponCustomization(EMPTY_WEAPON_SELECTION, config)).toBe(EMPTY_WEAPON_SELECTION);
    expect(withWeaponCustomization(gogma, { ...config, element: "ice" }).customization?.element).toBe(
      "ice",
    );
  });

  test("stray bonuses on a non-Gogma weapon are dropped; Gogma and unchanged selections are returned as is", () => {
    expect(dropStrayBonuses({ ...gogma, weaponId: "gs-1" }, weapons)).toMatchObject({
      setBonusId: null,
      groupBonusId: null,
    });
    expect(dropStrayBonuses(gogma, weapons)).toBe(gogma);
    expect(dropStrayBonuses(EMPTY_WEAPON_SELECTION, weapons)).toBe(EMPTY_WEAPON_SELECTION);
    // An id the catalog does not know cannot be judged, so it is left alone.
    const unknown = { ...gogma, weaponId: "retired" };
    expect(dropStrayBonuses(unknown, weapons)).toBe(unknown);
  });
});

describe("weaponProblem", () => {
  const panel = (overrides: Partial<EditorArtianPanel>) =>
    ({ family: "gogma", issue: null, ...overrides }) as EditorArtianPanel;

  test("a Gogma Artian needs both bonuses", () => {
    expect(weaponProblem(panel({}), { ...gogma, groupBonusId: null })).toContain("Set Bonus and a Group Bonus");
    expect(weaponProblem(panel({}), gogma)).toBeNull();
  });

  test("a configuration issue wins; no panel means no problem", () => {
    expect(weaponProblem(panel({ issue: "Too many reinforcements." }), gogma)).toBe(
      "Too many reinforcements.",
    );
    expect(weaponProblem(null, EMPTY_WEAPON_SELECTION)).toBeNull();
    expect(weaponProblem(panel({ family: "artian" }), EMPTY_WEAPON_SELECTION)).toBeNull();
  });
});
