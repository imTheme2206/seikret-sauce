import { describe, expect, test } from "bun:test";
import fixture from "./__fixtures__/mhdb-skill-ranks.json";
import { elementOfAttackSkill, parseMhdbEffect } from "./mhdb-parse";
import {
  MODELLED_SKILLS,
  NOT_MODELLED_SKILLS,
  SKILL_EFFECTS,
  entriesFor,
  uptimeKey,
} from "./skill-effects";
import { GAME_VERSION, RETRIEVED_AT, WEAPON_KINDS } from "./tables";
import type { SkillEffect } from "./types";

const merge = (effects: SkillEffect[]): SkillEffect => {
  const out: Record<string, number> = {};
  for (const effect of effects) {
    for (const [key, value] of Object.entries(effect)) {
      out[key] = (out[key] ?? 0) + (value as number);
    }
  }
  return out as SkillEffect;
};

describe("table versus MHDB's rank descriptions", () => {
  // Every skill in the fixture is a skill whose numbers MHDB states; the curated
  // table must say exactly what MHDB's words say.
  for (const [skill, ranks] of Object.entries(fixture.skills)) {
    test(`${skill}: every rank matches its MHDB description`, () => {
      expect(ranks.length).toBeGreaterThan(0);
      for (const rank of ranks) {
        const parsed = parseMhdbEffect(rank.description);
        const entries = SKILL_EFFECTS.filter(
          (entry) => entry.skill === skill && entry.level === rank.level,
        );
        // Element-attack entries are per element; each is one entry.
        expect(entries.length).toBeGreaterThan(0);
        const table = merge(entries.map((entry) => entry.effect));
        const keys = new Set([...Object.keys(parsed), ...Object.keys(table)]);
        for (const key of keys) {
          const expected = (parsed as Record<string, number>)[key] ?? 0;
          const actual = (table as Record<string, number>)[key] ?? 0;
          expect(
            Math.abs(expected - actual) < 1e-9
              ? true
              : `${skill} L${rank.level} ${key}: MHDB ${expected}, table ${actual}`,
          ).toBe(true);
        }
        for (const entry of entries) expect(entry.source).toContain(fixture.source);
      }
    });
  }

  test("the table has no MHDB-sourced level that MHDB does not have", () => {
    for (const entry of SKILL_EFFECTS) {
      if (!entry.source.includes(fixture.source)) continue;
      const ranks = (fixture.skills as Record<string, { level: number }[]>)[entry.skill];
      expect(ranks?.some((rank) => rank.level === entry.level)).toBe(true);
    }
  });
});

describe("parseMhdbEffect", () => {
  test.each([
    ["Attack +3", { attackFlat: 3 }],
    ["Attack +2% Bonus: +8", { attackPct: 0.02, attackFlat: 8 }],
    ["Attack +4 and affinity +3% while active.", { attackFlat: 4, affinity: 0.03 }],
    ["Affinity +4%", { affinity: 0.04 }],
    ["Fire attack +40", { elementFlat: 40 }],
    ["Fire attack +10% Bonus: +50", { elementPct: 0.1, elementFlat: 50 }],
    ["Attack +5% and defense +50 while active.", { attackPct: 0.05 }],
    ["Defense +50 while active.", {}],
    ["Reduces fixed stamina depletion by 10%.", {}],
    [
      "Attacks that hit weak points have 20% increased affinity, with an extra 15% on wounds.",
      { weakPointAffinity: 0.2, woundAffinity: 0.15 },
    ],
  ])("%s", (description, expected) => {
    expect(parseMhdbEffect(description)).toEqual(expected as SkillEffect);
  });

  test("critical hit damage becomes a multiplier", () => {
    expect(
      parseMhdbEffect("Increases damage dealt by critical hits to 31%.").critDamage,
    ).toBeCloseTo(1.31, 9);
  });

  test("element-attack skill names", () => {
    expect(elementOfAttackSkill("Ice Attack")).toBe("ice");
    expect(elementOfAttackSkill("Attack Boost")).toBeNull();
  });
});

describe("table hygiene", () => {
  test("every entry is version-tagged and cites a source", () => {
    for (const entry of SKILL_EFFECTS) {
      expect(entry.gameVersion).toBe(GAME_VERSION);
      expect(entry.retrievedAt).toBe(RETRIEVED_AT);
      expect(entry.source.length).toBeGreaterThan(0);
      for (const url of entry.source) expect(url).toMatch(/^https:\/\//);
    }
  });

  test("skills outside MHDB's explicit numbers cite Game8", () => {
    for (const skill of ["Burst", "Critical Element", "Coalescence"]) {
      for (const entry of SKILL_EFFECTS.filter((e) => e.skill === skill)) {
        expect(entry.source.every((url) => url.startsWith("https://game8.co/"))).toBe(true);
      }
    }
  });

  test("a skill is either modelled or not modelled", () => {
    for (const { skill, reason } of NOT_MODELLED_SKILLS) {
      expect(MODELLED_SKILLS).not.toContain(skill);
      expect(reason.length).toBeGreaterThan(5);
    }
  });

  test("weapon-grouped skills cover every weapon type exactly once per level", () => {
    const levelsOf = { Burst: 5, "Critical Element": 3, Coalescence: 3 };
    for (const [skill, max] of Object.entries(levelsOf)) {
      for (const kind of WEAPON_KINDS) {
        for (let level = 1; level <= max; level += 1) {
          const hits = SKILL_EFFECTS.filter(
            (entry) =>
              entry.skill === skill &&
              entry.level === level &&
              (!entry.weapons || entry.weapons.includes(kind)),
          );
          expect(hits).toHaveLength(1);
        }
      }
    }
  });

  test("effects only use finite numbers", () => {
    for (const entry of SKILL_EFFECTS) {
      for (const value of Object.values(entry.effect)) {
        expect(Number.isFinite(value)).toBe(true);
      }
    }
  });

  test("Burst values match Game8's tables at the corners", () => {
    const burst = (kind: Parameters<typeof entriesFor>[2], level: number) =>
      entriesFor("Burst", level, kind)[0]?.effect;
    expect(burst("great-sword", 1)).toEqual({ attackFlat: 10, elementFlat: 80 });
    expect(burst("great-sword", 5)).toEqual({ attackFlat: 18, elementFlat: 200 });
    expect(burst("dual-blades", 4)).toEqual({ attackFlat: 15, elementFlat: 100 });
    expect(burst("light-bowgun", 5)).toEqual({ attackFlat: 10, elementFlat: 120 });
    expect(burst("hammer", 3)).toEqual({ attackFlat: 12, elementFlat: 100 });
  });
});

describe("entriesFor", () => {
  test("returns one entry per component at the highest level not above the skill level", () => {
    const entries = entriesFor("Weakness Exploit", 4, "great-sword");
    expect(entries.map(uptimeKey).sort()).toEqual([
      "Weakness Exploit",
      "Weakness Exploit/wounds",
    ]);
    expect(entries.every((entry) => entry.level === 4)).toBe(true);
  });

  test("is empty for an unmodelled skill or level 0", () => {
    expect(entriesFor("Mind's Eye", 3, "hammer")).toEqual([]);
    expect(entriesFor("Attack Boost", 0, "hammer")).toEqual([]);
  });
});
