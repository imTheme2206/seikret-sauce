import { expect, test } from "bun:test";
import { efrBonusLines, skillsByName } from "./efr-view";

const zero = {
  attackFlat: 0,
  attackPct: 0,
  affinity: 0,
  elementFlat: 0,
  elementPct: 0,
  elementMultiplier: 0,
  critDamage: 0,
  critElement: 0,
};

test("skillsByName maps names to levels", () => {
  expect(
    skillsByName([
      { name: "Agitator", level: 3, icon: null, category: "armor" },
      { name: "Burst", level: 1, icon: null, category: "armor" },
    ]),
  ).toEqual({ Agitator: 3, Burst: 1 });
});

test("efrBonusLines lists only non-zero parts", () => {
  expect(efrBonusLines(zero)).toEqual([]);
  expect(
    efrBonusLines({ ...zero, attackFlat: 10, affinity: 0.075, elementMultiplier: 0.1 }),
  ).toEqual(["+10 attack", "+7.5% affinity", "x1.100 element"]);
});
