import { describe, expect, test } from "bun:test";
import {
  availableReinforcementTypes,
  buildArtianPanel,
  customizationIssue,
  deriveArtianStats,
  effectiveWeapon,
  elementChoices,
  EMPTY_CUSTOMIZATION,
  normalizeCustomization,
  reinforcementLevels,
  withReinforcement,
} from "./artian";
import rulesJson from "./__fixtures__/artian-rules.json";
import type {
  ArtianCustomization,
  ArtianRules,
  Weapon,
  WeaponArtian,
} from "./types";

/** A copy of the backend's `GET /api/mh-wilds/artian-rules` at game version 1.041. */
const rules = rulesJson as unknown as ArtianRules;

const config = (overrides: Partial<ArtianCustomization> = {}): ArtianCustomization => ({
  ...EMPTY_CUSTOMIZATION,
  ...overrides,
});

const weapon = (overrides: Partial<Weapon> = {}): Weapon => ({
  id: "w",
  name: "Varianza",
  kind: "great-sword",
  rarity: 8,
  damage: { raw: 190, display: 912 },
  affinity: 5,
  specials: [],
  sharpness: { red: 80, orange: 40, yellow: 60, green: 80, blue: 70, white: 20, purple: 0 },
  handicraft: null,
  slots: [3, 3, 3],
  skills: [],
  elderseal: null,
  defenseBonus: 0,
  series: null,
  artian: { family: "artian", tier: 8, focus: null },
  kindSpecific: {},
  ...overrides,
});

const ARTIAN_8: WeaponArtian = { family: "artian", tier: 8, focus: null };
const gogma = (focus: "attack" | "affinity" | "element"): WeaponArtian => ({
  family: "gogma",
  tier: 8,
  focus,
});

// The worked examples below are the same ones the backend's `artian.test.ts`
// asserts, so the editor's live totals and the saved snapshot cannot drift.
describe("deriveArtianStats", () => {
  test("MH Wiki example: Artian Blade I with 2 attack and 1 affinity part", () => {
    const blade = weapon({
      name: "Artian Blade I",
      rarity: 6,
      damage: { raw: 170, display: 816 },
    });
    const stats = deriveArtianStats(
      blade,
      { family: "artian", tier: 6, focus: null },
      config({ attackParts: 2, affinityParts: 1 }),
      rules,
    );
    expect(stats.damage).toEqual({ raw: 180, display: 864 });
    expect(stats.affinity).toBe(10);
  });

  test("rarity-8 element value, infusion and status classification", () => {
    const fire = deriveArtianStats(weapon(), ARTIAN_8, config({ element: "fire" }), rules);
    expect(fire.specials).toEqual([
      { kind: "element", name: "fire", damage: { raw: 45, display: 450 }, hidden: false },
    ]);
    const infused = deriveArtianStats(
      weapon(),
      ARTIAN_8,
      config({ element: "fire", elementInfusion: true }),
      rules,
    );
    expect(infused.specials[0]?.damage.display).toBe(480);
    const poison = deriveArtianStats(weapon(), ARTIAN_8, config({ element: "poison" }), rules);
    expect(poison.specials[0]).toMatchObject({ kind: "status", damage: { display: 300 } });
  });

  test("level-I reinforcements on a plain Artian", () => {
    const stats = deriveArtianStats(
      weapon(),
      ARTIAN_8,
      config({
        element: "water",
        attackParts: 1,
        affinityParts: 2,
        reinforcements: [
          { type: "attack", level: "I" },
          { type: "attack", level: "I" },
          { type: "affinity", level: "I" },
          { type: "element", level: "I" },
          { type: "sharpness", level: "I" },
        ],
      }),
      rules,
    );
    expect(stats.damage).toEqual({ raw: 205, display: 984 });
    expect(stats.affinity).toBe(20);
    expect(stats.specials[0]?.damage.display).toBe(530);
    expect(stats.sharpnessBonus).toBe(30);
  });

  test("Gogma Affinity Focus Great Sword with EX reinforcements", () => {
    const ostrak = weapon({
      name: "Ostrak Oblivion (+15% affinity)",
      damage: { raw: 180, display: 864 },
      affinity: 15,
      artian: gogma("affinity"),
    });
    const stats = deriveArtianStats(
      ostrak,
      gogma("affinity"),
      config({
        element: "water",
        reinforcements: [
          { type: "attack", level: "EX" },
          { type: "attack", level: "EX" },
          { type: "affinity", level: "III" },
          { type: "element", level: "EX" },
          { type: "sharpness", level: "EX" },
        ],
      }),
      rules,
    );
    expect(stats.damage).toEqual({ raw: 204, display: 979 });
    expect(stats.affinity).toBe(23);
    expect(stats.specials[0]?.damage.display).toBe(450 - 10 + 110);
    expect(stats.sharpnessBonus).toBe(50);
  });

  test("Element Focus delta is per kind; Attack Focus changes nothing", () => {
    const horn = weapon({
      kind: "hunting-horn",
      damage: { raw: 190, display: 798 },
      affinity: 0,
    });
    const display = (focus: "attack" | "affinity" | "element") =>
      deriveArtianStats(horn, gogma(focus), config({ element: "fire" }), rules)
        .specials[0]?.damage.display;
    expect(display("element")).toBe(400);
    expect(display("affinity")).toBe(340);
    expect(display("attack")).toBe(320);
  });

  test("Insect Glaive level-I sharpness and bowgun ammo", () => {
    const glaive = weapon({ kind: "insect-glaive", damage: { raw: 190, display: 589 } });
    expect(
      deriveArtianStats(glaive, ARTIAN_8, config({ reinforcements: [{ type: "sharpness", level: "I" }] }), rules)
        .sharpnessBonus,
    ).toBe(20);
    const bowgun = weapon({ kind: "light-bowgun", damage: { raw: 190, display: 247 }, sharpness: null });
    expect(
      deriveArtianStats(bowgun, ARTIAN_8, config({ reinforcements: [{ type: "ammo", level: "I" }] }), rules)
        .ammoBonus,
    ).toBe(1);
  });

  test("an empty configuration leaves the catalog row alone", () => {
    expect(deriveArtianStats(weapon(), ARTIAN_8, EMPTY_CUSTOMIZATION, rules)).toEqual({
      damage: { raw: 190, display: 912 },
      affinity: 5,
      specials: [],
      sharpnessBonus: 0,
      ammoBonus: 0,
    });
  });
});

describe("choices and issues", () => {
  test("elements come from the rules; bowguns have none and bows skip status coatings", () => {
    expect(elementChoices("great-sword", rules)).toHaveLength(9);
    expect(elementChoices("bow", rules)).toEqual(["fire", "water", "thunder", "ice", "dragon", "blast"]);
    expect(elementChoices("light-bowgun", rules)).toEqual([]);
  });

  test("a plain Artian only rolls level I; a Gogma has no level III element", () => {
    expect(reinforcementLevels("artian", "attack", "great-sword", rules)).toEqual(["I"]);
    expect(reinforcementLevels("gogma", "attack", "great-sword", rules)).toEqual(["I", "II", "III", "EX"]);
    expect(reinforcementLevels("gogma", "element", "great-sword", rules)).toEqual(["I", "II", "EX"]);
    expect(reinforcementLevels("gogma", "sharpness", "great-sword", rules)).toEqual(["I", "EX"]);
  });

  test("element and ammo reinforcements depend on the weapon", () => {
    const gs = weapon();
    expect(availableReinforcementTypes(gs, config(), rules)).toEqual(["attack", "affinity", "sharpness"]);
    expect(availableReinforcementTypes(gs, config({ element: "fire" }), rules)).toContain("element");
    const lbg = weapon({ kind: "light-bowgun", sharpness: null });
    expect(availableReinforcementTypes(lbg, config(), rules)).toEqual(["attack", "affinity", "ammo"]);
  });

  test("names the first broken rule", () => {
    const issue = (cfg: Partial<ArtianCustomization>, artian = gogma("attack")) =>
      customizationIssue(weapon(), artian, config(cfg), rules);
    expect(issue({ attackParts: 2, affinityParts: 2 })).toMatch(/3 parts/);
    expect(issue({ elementInfusion: true })).toMatch(/infusion/i);
    expect(
      issue({
        reinforcements: Array.from({ length: 6 }, () => ({ type: "attack" as const, level: "I" as const })),
      }),
    ).toMatch(/At most 5/);
    expect(
      issue({
        reinforcements: Array.from({ length: 3 }, () => ({ type: "attack" as const, level: "EX" as const })),
      }),
    ).toMatch(/EX attack/);
    expect(issue({ reinforcements: [{ type: "attack", level: "EX" }] }, ARTIAN_8)).toMatch(/level EX/);
    expect(issue({ reinforcements: [{ type: "element", level: "I" }] })).toMatch(/cannot roll/);
    expect(issue({ element: "fire", attackParts: 3, reinforcements: [{ type: "attack", level: "EX" }] })).toBeNull();
  });
});

describe("editing helpers", () => {
  test("changing element or weapon drops what became impossible", () => {
    const gs = weapon();
    const cleaned = normalizeCustomization(
      gs,
      ARTIAN_8,
      config({
        element: "fire",
        elementInfusion: true,
        reinforcements: [
          { type: "attack", level: "EX" },
          { type: "element", level: "I" },
        ],
      }),
      rules,
    );
    // Artian only rolls level I, so the EX attack goes; the element pick stays.
    expect(cleaned.reinforcements).toEqual([{ type: "element", level: "I" }]);
    expect(cleaned.elementInfusion).toBe(true);

    const bow = weapon({ kind: "bow", sharpness: null });
    const onBow = normalizeCustomization(bow, ARTIAN_8, config({ element: "poison", elementInfusion: true }), rules);
    expect(onBow.element).toBeNull();
    expect(onBow.elementInfusion).toBe(false);
  });

  test("withReinforcement replaces, appends and removes", () => {
    const base = config({ reinforcements: [{ type: "attack", level: "I" }] });
    expect(withReinforcement(base, 0, { type: "affinity", level: "I" }).reinforcements).toEqual([
      { type: "affinity", level: "I" },
    ]);
    expect(withReinforcement(base, 3, { type: "attack", level: "I" }).reinforcements).toHaveLength(2);
    expect(withReinforcement(base, 0, null).reinforcements).toEqual([]);
  });

  test("effectiveWeapon applies derived stats only to Artian-family weapons", () => {
    const configured = effectiveWeapon(weapon(), config({ attackParts: 3 }), rules);
    expect(configured.damage).toEqual({ raw: 205, display: 984 });
    const plain = weapon({ artian: null });
    expect(effectiveWeapon(plain, config({ attackParts: 3 }), rules)).toBe(plain);
    // Rules still loading: the catalog row is shown untouched.
    const row = weapon();
    expect(effectiveWeapon(row, config({ attackParts: 3 }), undefined)).toBe(row);
  });

  test("the panel carries the derived extras and the first issue", () => {
    const panel = buildArtianPanel(
      weapon({ artian: gogma("element") }),
      config({ reinforcements: [{ type: "sharpness", level: "EX" }] }),
      rules,
    );
    expect(panel).toMatchObject({
      family: "gogma",
      focus: "element",
      sharpnessBonus: 50,
      canInfuse: false,
      issue: null,
    });
    expect(buildArtianPanel(weapon({ artian: null }), null, rules)).toBeNull();
  });
});
