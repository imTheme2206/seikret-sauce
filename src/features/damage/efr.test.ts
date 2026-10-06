import { describe, expect, test } from "bun:test";
import { computeEfr, type EfrInput, type EfrWeapon } from "./efr";
import type { PartMultipliers } from "./types";

const part = (overrides: Partial<PartMultipliers> = {}): PartMultipliers => ({
  slash: 1,
  blunt: 1,
  pierce: 1,
  fire: 1,
  water: 1,
  thunder: 1,
  ice: 1,
  dragon: 1,
  ...overrides,
});

const sword = (overrides: Partial<EfrWeapon> = {}): EfrWeapon => ({
  kind: "great-sword",
  trueRaw: 200,
  affinity: 0,
  element: null,
  sharpness: "yellow",
  ...overrides,
});

const run = (input: Partial<EfrInput> & { weapon: EfrWeapon }) =>
  computeEfr({ multipliers: part(), skills: {}, ...input });

describe("worked example 1 (Fextralife, Attack Power page)", () => {
  // Source: https://monsterhunterwilds.wiki.fextralife.com/Attack_Power
  // "90 (Raw Attack) x 1.05 (Green sharpness) x 0.42 (Combo Move) x 0.8 (Monster Part)
  //  = 31 damage (rounded down)": Bone Hammer I, Overhead Smash on Great Izuchi's tail.
  // Our per-100-MV figure is 90 x 1.05 x 0.8 = 75.6; the move's 42 MV scales it.
  test("per-hit damage matches the quoted 31", () => {
    const result = run({
      weapon: sword({ kind: "hammer", trueRaw: 90, sharpness: "green" }),
      multipliers: part({ blunt: 0.8 }),
    });
    expect(result.damageType).toBe("blunt");
    expect(result.effectiveRaw).toBeCloseTo(75.6, 9);
    expect(Math.floor((result.effectiveRaw * 42) / 100)).toBe(31);
  });
});

describe("worked example 2 (wiggler.pet expected crit multiplier)", () => {
  // Source: https://wiggler.pet/other/guides/intermediate_damage_calculation, Wilds
  // example "1*0.95*1.34+1*0.05 -> (1+(0.34*0.95)) = 1.323": 95% affinity with
  // Critical Boost 3 (1.34). With true raw 100, yellow (1.0) and hitzone 1 the
  // effective raw is simply 100 x 1.323.
  test("95% affinity with Critical Boost 3 gives 1.323x", () => {
    const result = run({
      weapon: sword({ trueRaw: 100, affinity: 95 }),
      skills: { "Critical Boost": 3 },
    });
    expect(result.critMultiplier).toBeCloseTo(1.323, 9);
    expect(result.effectiveRaw).toBeCloseTo(132.3, 9);
  });
});

describe("worked example 3 (hand calculation, raw skills)", () => {
  // Great Sword, true raw 210, affinity +10%, white sharpness, hitzone slash 0.65.
  // Skills: Attack Boost 5 (+4%, +9), Critical Eye 3 (+12%), Critical Boost 3 (1.34),
  // Agitator 5 at 100% (+20 attack, +15% affinity).
  //   attack  = 210 x 1.04 + 9 + 20          = 247.4
  //   affinity = 0.10 + 0.12 + 0.15          = 0.37
  //   crit    = 1 + 0.37 x (1.34 - 1)        = 1.1258
  //   efr     = 247.4 x 1.32 x 1.1258        = 367.6502544
  //   on part = 367.6502544 x 0.65           = 238.97266536
  const input = {
    weapon: sword({ trueRaw: 210, affinity: 10, sharpness: "white" }),
    multipliers: part({ slash: 0.65 }),
    skills: {
      "Attack Boost": 5,
      "Critical Eye": 3,
      "Critical Boost": 3,
      Agitator: 5,
    },
    uptimes: { Agitator: 1 },
  };

  test("matches the hand-calculated figures", () => {
    const result = run(input);
    expect(result.attack).toBeCloseTo(247.4, 9);
    expect(result.affinity).toBeCloseTo(0.37, 9);
    expect(result.critMultiplier).toBeCloseTo(1.1258, 9);
    expect(result.efr).toBeCloseTo(367.6502544, 7);
    expect(result.effectiveRaw).toBeCloseTo(238.97266536, 7);
    expect(result.effectiveElement).toBe(0);
    expect(result.total).toBeCloseTo(238.97266536, 7);
  });

  test("Agitator's leave-one-out delta equals the with/without difference", () => {
    const withAgitator = run(input);
    const without = run({ ...input, skills: { ...input.skills, Agitator: 0 } });
    const row = withAgitator.skills.find((item) => item.skill === "Agitator");
    expect(row?.rawDelta).toBeCloseTo(
      withAgitator.effectiveRaw - without.effectiveRaw,
      9,
    );
    expect(row?.rawDelta).toBeGreaterThan(0);
  });
});

describe("worked example 4 (hand calculation, element)", () => {
  // Long Sword, true raw 200, fire 350 displayed, affinity +0 and Critical Eye 5
  // (+20%), blue sharpness (element 1.0625); part: slash 0.6, fire 0.3.
  // Skills: Fire Attack 3 (+20%, +60 displayed), Critical Element 3 (Long Sword 1.15).
  //   element value = (350 x 1.2 + 60) / 10          = 48
  //   crit element  = 1 + 0.20 x (1.15 - 1)          = 1.03
  //   element dmg   = 48 x 1.0625 x 0.3 x 1.03       = 15.759
  //   raw: 200 x 1.2 x (1 + 0.2 x 0.25) x 0.6        = 151.2
  const result = run({
    weapon: sword({
      kind: "long-sword",
      element: { name: "fire", display: 350 },
      sharpness: "blue",
    }),
    multipliers: part({ slash: 0.6, fire: 0.3 }),
    skills: { "Critical Eye": 5, "Fire Attack": 3, "Critical Element": 3 },
  });

  test("element damage follows the element formula", () => {
    expect(result.effectiveElement).toBeCloseTo(15.759, 9);
  });

  test("raw damage is unaffected by the element skills", () => {
    expect(result.effectiveRaw).toBeCloseTo(151.2, 9);
    expect(result.total).toBeCloseTo(151.2 + 15.759, 9);
  });
});

describe("affinity and crits", () => {
  test("negative affinity is a 0.75x blunder in expectation", () => {
    // affinity -20%: 1 + (-0.2) x (1 - 0.75) = 0.95
    const result = run({ weapon: sword({ affinity: -20 }) });
    expect(result.critMultiplier).toBeCloseTo(0.95, 9);
  });

  test("affinity is capped at 100%", () => {
    const result = run({
      weapon: sword({ affinity: 90 }),
      skills: { "Critical Eye": 5 },
    });
    expect(result.affinity).toBe(1);
    expect(result.critMultiplier).toBeCloseTo(1.25, 9);
  });

  test("a blunder does not reduce elemental damage", () => {
    const base = sword({ affinity: 0, element: { name: "fire", display: 100 } });
    const negative = sword({ affinity: -50, element: { name: "fire", display: 100 } });
    expect(run({ weapon: negative }).effectiveElement).toBe(
      run({ weapon: base }).effectiveElement,
    );
  });

  test("affinity reaches element only through Critical Element", () => {
    const weapon = sword({ affinity: 50, element: { name: "fire", display: 100 } });
    const plain = run({ weapon }).effectiveElement;
    const withSkill = run({ weapon, skills: { "Critical Element": 3 } });
    // Great Sword (heavy group) level 3 = 1.2: 1 + 0.5 x 0.2 = 1.1
    expect(plain).toBeCloseTo(10 * 0.75, 9);
    expect(withSkill.effectiveElement).toBeCloseTo(10 * 0.75 * 1.1, 9);
  });
});

describe("sharpness and weapon types", () => {
  test("bowguns and bows have no sharpness: modifier 1", () => {
    const result = run({
      weapon: sword({ kind: "heavy-bowgun", trueRaw: 100, sharpness: null }),
    });
    expect(result.effectiveRaw).toBe(100);
    expect(result.approximate).toBe(true);
  });

  test.each([
    ["red", 0.5, 0.25],
    ["orange", 0.75, 0.5],
    ["yellow", 1, 0.75],
    ["green", 1.05, 1],
    ["blue", 1.2, 1.0625],
    ["white", 1.32, 1.15],
  ] as const)("%s sharpness", (sharpness, rawMod, elementMod) => {
    const result = run({
      weapon: sword({
        trueRaw: 100,
        sharpness,
        element: { name: "fire", display: 100 },
      }),
    });
    expect(result.effectiveRaw).toBeCloseTo(100 * rawMod, 9);
    expect(result.effectiveElement).toBeCloseTo(10 * elementMod, 9);
  });

  test("hammer uses the blunt zone, great sword slash, bow pierce", () => {
    const multipliers = part({ slash: 0.2, blunt: 0.4, pierce: 0.6 });
    const hit = (kind: EfrWeapon["kind"]) =>
      run({ weapon: sword({ kind, trueRaw: 100, sharpness: null }), multipliers });
    expect(hit("hammer").effectiveRaw).toBeCloseTo(40, 9);
    expect(hit("great-sword").effectiveRaw).toBeCloseTo(20, 9);
    expect(hit("bow").effectiveRaw).toBeCloseTo(60, 9);
  });

  test("status specials give no element damage", () => {
    expect(run({ weapon: sword({ element: null }) }).effectiveElement).toBe(0);
  });

  test("element hitzone scales element damage independently of raw", () => {
    const result = run({
      weapon: sword({ element: { name: "ice", display: 200 }, sharpness: "green" }),
      multipliers: part({ ice: 0.25, slash: 0.9 }),
    });
    expect(result.effectiveElement).toBeCloseTo(20 * 1 * 0.25, 9);
    expect(result.elementHitzone).toBe(0.25);
  });
});

describe("uptime", () => {
  const base = {
    weapon: sword({ trueRaw: 200, affinity: 0, sharpness: "yellow" as const }),
    multipliers: part(),
  };
  const agitator = { Agitator: 5 }; // +20 attack, +15% affinity

  test("0% equals the skill being absent", () => {
    const off = run({ ...base, skills: agitator, uptimes: { Agitator: 0 } });
    const absent = run({ ...base, skills: {} });
    expect(off.effectiveRaw).toBe(absent.effectiveRaw);
    expect(off.attack).toBe(absent.attack);
    expect(off.affinity).toBe(absent.affinity);
    expect(off.skills[0]?.rawDelta).toBe(0);
  });

  test("100% equals always active (and is the default)", () => {
    const on = run({ ...base, skills: agitator, uptimes: { Agitator: 1 } });
    const dflt = run({ ...base, skills: agitator });
    // attack 220, affinity 0.15, crit 1 + 0.15 x 0.25 = 1.0375
    expect(on.effectiveRaw).toBeCloseTo(220 * 1.0375, 9);
    expect(dflt.effectiveRaw).toBe(on.effectiveRaw);
  });

  test("an intermediate uptime weights the bonuses linearly", () => {
    // 50%: attack 200 + 10, affinity 0.075, crit 1 + 0.075 x 0.25 = 1.01875
    const half = run({ ...base, skills: agitator, uptimes: { Agitator: 0.5 } });
    expect(half.attack).toBeCloseTo(210, 9);
    expect(half.affinity).toBeCloseTo(0.075, 9);
    expect(half.effectiveRaw).toBeCloseTo(210 * 1.01875, 9);
  });

  test("defaultUptime stands in for skills without an explicit uptime", () => {
    const dflt = run({ ...base, skills: agitator, defaultUptime: 0.5 });
    const explicit = run({ ...base, skills: agitator, uptimes: { Agitator: 0.5 } });
    expect(dflt.effectiveRaw).toBe(explicit.effectiveRaw);
    const overridden = run({ ...base, skills: agitator, defaultUptime: 0.5, uptimes: { Agitator: 1 } });
    expect(overridden.attack).toBe(220);
  });

  test("uptime is clamped to [0, 1]", () => {
    const over = run({ ...base, skills: agitator, uptimes: { Agitator: 4 } });
    const under = run({ ...base, skills: agitator, uptimes: { Agitator: -1 } });
    expect(over.attack).toBe(220);
    expect(under.attack).toBe(200);
  });

  test("always-on skills ignore uptimes", () => {
    const withMap = run({ ...base, skills: { "Attack Boost": 3 }, uptimes: { "Attack Boost": 0 } });
    expect(withMap.attack).toBe(207);
  });

  test("the element multiplier of Coalescence weights linearly", () => {
    const weapon = sword({ element: { name: "fire", display: 100 }, sharpness: "green" });
    const at = (u: number) =>
      run({ weapon, skills: { Coalescence: 3 }, uptimes: { Coalescence: u } })
        .effectiveElement;
    expect(at(0)).toBeCloseTo(10, 9);
    expect(at(1)).toBeCloseTo(13, 9); // Great Sword is heavy: 1.3x
    expect(at(0.5)).toBeCloseTo(11.5, 9);
  });

  test("Burst weights its flat attack and element", () => {
    const weapon = sword({ element: { name: "fire", display: 100 }, sharpness: "green" });
    const at = (u: number) =>
      run({ weapon, skills: { Burst: 5 }, uptimes: { Burst: u } });
    // Great Sword level 5: +18 attack, +200 element displayed
    expect(at(1).attack).toBe(218);
    expect(at(1).effectiveElement).toBeCloseTo(30, 9);
    expect(at(0).effectiveElement).toBeCloseTo(10, 9);
    expect(at(0.5).attack).toBe(209);
  });
});

describe("Weakness Exploit", () => {
  const weapon = sword({ trueRaw: 100, affinity: 0, sharpness: "yellow" });
  const skills = { "Weakness Exploit": 5 }; // +30% on weak points, +20% on wounds

  test("applies at a hitzone of 0.45 and above, not below", () => {
    const weak = run({ weapon, skills, multipliers: part({ slash: 0.45 }), uptimes: { "Weakness Exploit/wounds": 0 } });
    const notWeak = run({ weapon, skills, multipliers: part({ slash: 0.44 }) });
    expect(weak.weakPoint).toBe(true);
    expect(weak.affinity).toBeCloseTo(0.3, 9);
    expect(notWeak.weakPoint).toBe(false);
    expect(notWeak.affinity).toBe(0);
    expect(notWeak.skills[0]?.parts.every((p) => !p.applies)).toBe(true);
  });

  test("the wound part is weighted by its own uptime", () => {
    const at = (u: number) =>
      run({ weapon, skills, multipliers: part({ slash: 0.7 }), uptimes: { "Weakness Exploit/wounds": u } });
    expect(at(0).affinity).toBeCloseTo(0.3, 9);
    expect(at(1).affinity).toBeCloseTo(0.5, 9);
    expect(at(0.5).affinity).toBeCloseTo(0.4, 9);
  });

  test("uses the weapon's damage type for the weak point test", () => {
    const hammer = sword({ kind: "hammer", trueRaw: 100 });
    const result = run({ weapon: hammer, skills, multipliers: part({ slash: 0.9, blunt: 0.3 }) });
    expect(result.weakPoint).toBe(false);
  });
});

describe("element-specific and weapon-specific skills", () => {
  test("Fire Attack does nothing on a thunder weapon", () => {
    const weapon = sword({ element: { name: "thunder", display: 100 }, sharpness: "green" });
    const withSkill = run({ weapon, skills: { "Fire Attack": 3 } });
    const without = run({ weapon });
    expect(withSkill.effectiveElement).toBe(without.effectiveElement);
    expect(withSkill.skills[0]?.parts[0]?.inactiveReason).toMatch(/fire/);
  });

  test("Fire Attack does nothing on a non-elemental weapon", () => {
    const result = run({ weapon: sword(), skills: { "Fire Attack": 3 } });
    expect(result.effectiveElement).toBe(0);
  });

  test("Burst values depend on the weapon group", () => {
    const burst = (kind: EfrWeapon["kind"]) =>
      run({ weapon: sword({ kind, trueRaw: 100 }), skills: { Burst: 1 } }).attack;
    expect(burst("great-sword")).toBe(110);
    expect(burst("hunting-horn")).toBe(110);
    expect(burst("dual-blades")).toBe(108);
    expect(burst("bow")).toBe(106);
    expect(burst("long-sword")).toBe(108);
  });

  test("Critical Element differs between light and heavy weapons", () => {
    const at = (kind: EfrWeapon["kind"]) =>
      run({
        weapon: sword({ kind, affinity: 100, element: { name: "fire", display: 100 }, sharpness: "green" }),
        skills: { "Critical Element": 1 },
      });
    expect(at("long-sword").effectiveElement).toBeCloseTo(10 * 1.05, 9);
    const heavy = at("great-sword");
    expect(heavy.effectiveElement).toBeCloseTo(10 * 1.07, 9);
    expect(heavy.skills[0]?.approximate).toBe(true);
  });
});

describe("level handling and unmodelled skills", () => {
  test("a level above the table uses the highest defined level", () => {
    const result = run({ weapon: sword(), skills: { "Attack Boost": 7 } });
    expect(result.attack).toBeCloseTo(200 * 1.04 + 9, 9);
  });

  test("level 0 is ignored", () => {
    const result = run({ weapon: sword(), skills: { "Attack Boost": 0 } });
    expect(result.skills).toEqual([]);
  });

  test("skills the model has no effect for are listed as not modelled", () => {
    const result = run({ weapon: sword(), skills: { "Mind's Eye": 3, Handicraft: 2, Guard: 1 } });
    expect(result.notModelled.map((item) => item.skill).sort()).toEqual([
      "Handicraft",
      "Mind's Eye",
    ]);
    expect(result.skills).toEqual([]);
  });

  test("Heroics level 1 is modelled and adds no attack", () => {
    const result = run({ weapon: sword(), skills: { Heroics: 1 } });
    expect(result.attack).toBe(200);
    expect(result.skills).toHaveLength(1);
  });

  test("attack percentages from different skills add before multiplying", () => {
    // Attack Boost 5 (+4%, +9) + Heroics 5 (+30%): 200 x 1.34 + 9
    const result = run({ weapon: sword(), skills: { "Attack Boost": 5, Heroics: 5 } });
    expect(result.attack).toBeCloseTo(277, 9);
  });
});
