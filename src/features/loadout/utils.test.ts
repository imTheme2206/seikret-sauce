import { describe, expect, test } from "bun:test";
import { resultName } from "./utils";
import type { SelectedSkill } from "./types";

function skill(name: string): SelectedSkill {
  return { name, level: 1, maxLevel: 1, category: "armor", icon: null };
}

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
