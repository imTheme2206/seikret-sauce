import { describe, expect, test } from "bun:test";
import { groupSkillsByIcon, resultName } from "./utils";
import type { PoolSkill, SelectedSkill } from "./types";

const skill = (name: string): SelectedSkill => {
  return { name, level: 1, maxLevel: 1, category: "armor", icon: null };
};

describe("resultName", () => {
  test("names a result after up to three requested skills", () => {
    expect(resultName([skill("Attack Boost")], 1)).toBe(
      "Optimized: Attack Boost",
    );
    expect(
      resultName([skill("Attack Boost"), skill("Weakness Exploit")], 1),
    ).toBe("Optimized: Attack Boost + Weakness Exploit");
  });

  test("appends '+ more' past three requested skills", () => {
    expect(
      resultName(
        ["Attack Boost", "Weakness Exploit", "Agitator", "Critical Eye"].map(
          skill,
        ),
        1,
      ),
    ).toBe("Optimized: Attack Boost + Weakness Exploit + Agitator + more");
  });

  test("falls back to an ordinal when no skills were requested", () => {
    expect(resultName([], 3)).toBe("Optimizer Result 3");
  });
});

describe("groupSkillsByIcon", () => {
  const pool = (name: string, icon: string | null) =>
    ({ name, icon, category: "armor", maxLevel: 1 }) as PoolSkill;

  test("groups by icon type in configured order and keeps input order inside a group", () => {
    const groups = groupSkillsByIcon([
      pool("Divine Blessing", "defense"),
      pool("Peak Performance", "attack"),
      pool("Defense Boost", "defense"),
    ]);
    expect(groups.map((group) => group.label)).toEqual(["Attack", "Defense"]);
    expect(groups[1]?.skills.map((skill) => skill.name)).toEqual([
      "Divine Blessing",
      "Defense Boost",
    ]);
  });

  test("puts missing or unknown icons in a trailing Other group", () => {
    const groups = groupSkillsByIcon([
      pool("Mystery", null),
      pool("Odd", "unknown-icon"),
      pool("Burst", "offense"),
    ]);
    expect(groups.map((group) => group.label)).toEqual(["Offense", "Other"]);
    expect(groups[1]?.skills).toHaveLength(2);
  });
});
