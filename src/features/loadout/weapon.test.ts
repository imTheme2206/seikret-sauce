import { describe, expect, test } from "bun:test";
import type {
  EditorWeaponSelection,
  SkillCatalog,
  Weapon,
} from "@/features/builds/types";
import { EMPTY_WEAPON_SELECTION } from "@/features/builds/weapon-selection";
import { toRequestBody } from "./hooks/use-search-sets";
import { toImportWeapon, weaponSkillsOf } from "./weapon";
import { EMPTY_WEAPON_SKILLS } from "./types";

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
  slots: [],
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
  weapon({
    id: "artian-gs",
    name: "Varianza",
    artian: { family: "artian", tier: 8, focus: null },
  }),
  weapon({
    id: "gogma-gs",
    name: "Ostrak Oblivion",
    artian: { family: "gogma", tier: 8, focus: "affinity" },
  }),
];

const thresholds: SkillCatalog["bonuses"][number]["thresholds"] = [];
const bonuses: SkillCatalog["bonuses"] = [
  { id: "bn-set", name: "Gore Magala's Tyranny", kind: "set", icon: null, thresholds },
  { id: "bn-group", name: "Alpha's Hunger", kind: "group", icon: null, thresholds },
];

const selection = (
  overrides: Partial<EditorWeaponSelection>,
): EditorWeaponSelection => ({ ...EMPTY_WEAPON_SELECTION, ...overrides });

describe("weaponSkillsOf", () => {
  test("a Gogma Artian's rolled Set and Group Bonus become the weapon's skills", () => {
    expect(
      weaponSkillsOf(
        selection({ weaponId: "gogma-gs", setBonusId: "bn-set", groupBonusId: "bn-group" }),
        weapons,
        bonuses,
      ),
    ).toEqual({ set: "Gore Magala's Tyranny", group: "Alpha's Hunger" });
  });

  test("each bonus is independent, and an id of the wrong kind is ignored", () => {
    expect(
      weaponSkillsOf(selection({ weaponId: "gogma-gs", setBonusId: "bn-set" }), weapons, bonuses),
    ).toEqual({ set: "Gore Magala's Tyranny", group: null });
    expect(
      weaponSkillsOf(selection({ weaponId: "gogma-gs", setBonusId: "bn-group" }), weapons, bonuses),
    ).toEqual(EMPTY_WEAPON_SKILLS);
  });

  test("no weapon, a plain weapon and a plain Artian contribute nothing, even with stray bonuses", () => {
    const stray = { setBonusId: "bn-set", groupBonusId: "bn-group" };
    expect(weaponSkillsOf(EMPTY_WEAPON_SELECTION, weapons, bonuses)).toEqual(EMPTY_WEAPON_SKILLS);
    expect(weaponSkillsOf(selection({ weaponId: "gs-1", ...stray }), weapons, bonuses)).toEqual(
      EMPTY_WEAPON_SKILLS,
    );
    expect(
      weaponSkillsOf(selection({ weaponId: "artian-gs", ...stray }), weapons, bonuses),
    ).toEqual(EMPTY_WEAPON_SKILLS);
  });

  test("an unloaded catalog contributes nothing", () => {
    expect(
      weaponSkillsOf(selection({ weaponId: "gogma-gs", setBonusId: "bn-set" }), [], []),
    ).toEqual(EMPTY_WEAPON_SKILLS);
  });
});

describe("search request", () => {
  const picks = {};

  test("selecting a Gogma Artian with a rolled Set Bonus sends initialSetCounts for it", () => {
    const skills = weaponSkillsOf(
      selection({ weaponId: "gogma-gs", setBonusId: "bn-set" }),
      weapons,
      bonuses,
    );
    const body = toRequestBody(picks, "high", skills);
    expect(body.initialSetCounts).toEqual({ "Gore Magala's Tyranny": 1 });
    expect("initialGroupCounts" in body).toBe(false);
  });

  test("a rolled Group Bonus sends initialGroupCounts", () => {
    const skills = weaponSkillsOf(
      selection({ weaponId: "gogma-gs", setBonusId: "bn-set", groupBonusId: "bn-group" }),
      weapons,
      bonuses,
    );
    const body = toRequestBody(picks, "low", skills);
    expect(body.initialSetCounts).toEqual({ "Gore Magala's Tyranny": 1 });
    expect(body.initialGroupCounts).toEqual({ "Alpha's Hunger": 1 });
    expect(body.rank).toBe("low");
  });

  test("no weapon sends neither", () => {
    const body = toRequestBody(picks, "high", weaponSkillsOf(EMPTY_WEAPON_SELECTION, weapons, bonuses));
    expect("initialSetCounts" in body).toBe(false);
    expect("initialGroupCounts" in body).toBe(false);
  });
});

describe("toImportWeapon", () => {
  const customization = {
    element: "water" as const,
    attackParts: 1,
    affinityParts: 2,
    elementInfusion: false,
    reinforcements: [{ type: "attack" as const, level: "EX" as const }],
  };

  test("carries the weapon id, bonus names and customization", () => {
    const equipped = selection({
      weaponId: "gogma-gs",
      setBonusId: "bn-set",
      groupBonusId: "bn-group",
      customization,
    });
    expect(toImportWeapon(equipped, weaponSkillsOf(equipped, weapons, bonuses))).toEqual({
      setBonus: "Gore Magala's Tyranny",
      groupBonus: "Alpha's Hunger",
      weaponId: "gogma-gs",
      customization,
    });
  });

  test("no weapon imports as an empty weapon, never a stray customization", () => {
    expect(
      toImportWeapon(selection({ customization }), EMPTY_WEAPON_SKILLS),
    ).toEqual({ setBonus: null, groupBonus: null, weaponId: null, customization: null });
  });
});
