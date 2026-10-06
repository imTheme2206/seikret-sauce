import { describe, expect, test } from "bun:test";
import { adaptWeapon, maxSharpnessColor, type CatalogWeaponLike } from "./weapon";

const bar = (overrides: Record<string, number> = {}) => ({
  red: 50,
  orange: 50,
  yellow: 40,
  green: 60,
  blue: 0,
  white: 0,
  purple: 0,
  ...overrides,
});

const weapon = (overrides: Partial<CatalogWeaponLike> = {}): CatalogWeaponLike => ({
  kind: "charge-blade",
  damage: { raw: 100 },
  affinity: 10,
  specials: [],
  sharpness: bar(),
  ...overrides,
});

describe("maxSharpnessColor", () => {
  test("is the highest colour with points", () => {
    expect(maxSharpnessColor(bar())).toBe("green");
    expect(maxSharpnessColor(bar({ blue: 20, white: 10 }))).toBe("white");
  });
  test("no bar means no colour", () => {
    expect(maxSharpnessColor(null)).toBeNull();
  });
  test("purple is reported as unmodelled", () => {
    expect(maxSharpnessColor(bar({ purple: 10 }))).toBe("unmodelled");
  });
});

describe("adaptWeapon", () => {
  test("maps stats and the visible element special", () => {
    const result = adaptWeapon(
      weapon({
        specials: [
          { kind: "element", name: "ice", damage: { display: 250 }, hidden: false },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.weapon).toEqual({
      kind: "charge-blade",
      trueRaw: 100,
      affinity: 10,
      element: { name: "ice", display: 250 },
      sharpness: "green",
    });
  });

  test("status specials are ignored, hidden elements reported", () => {
    const result = adaptWeapon(
      weapon({
        specials: [
          { kind: "status", name: "paralysis", damage: { display: 100 }, hidden: false },
          { kind: "element", name: "dragon", damage: { display: 300 }, hidden: true },
        ],
      }),
    );
    expect(result.ok && result.weapon.element).toBeNull();
    expect(result.ok && result.ignoredSpecials).toEqual(["paralysis"]);
    expect(result.ok && result.hiddenElement).toBe("dragon");
  });

  test("a sharpness override replaces the max colour", () => {
    const result = adaptWeapon(weapon(), "yellow");
    expect(result.ok && result.weapon.sharpness).toBe("yellow");
    expect(result.ok && result.maxSharpness).toBe("green");
  });

  test("weapons without a bar stay without sharpness even with an override", () => {
    const result = adaptWeapon(weapon({ kind: "bow", sharpness: null }), "white");
    expect(result.ok && result.weapon.sharpness).toBeNull();
  });

  test("purple sharpness and unknown kinds are refused", () => {
    expect(adaptWeapon(weapon({ sharpness: bar({ purple: 5 }) })).ok).toBe(false);
    expect(adaptWeapon(weapon({ kind: "tonfa" })).ok).toBe(false);
  });
});
