import { expect, test } from "bun:test";
import {
  elementWeaknesses,
  formatMultiplier,
  isWeakPoint,
  partLabels,
  sortPartsBy,
} from "./hitzone";
import type { MonsterPart, MonsterWeakness } from "./types";

const zero = {
  slash: 0,
  blunt: 0,
  pierce: 0,
  fire: 0,
  water: 0,
  thunder: 0,
  ice: 0,
  dragon: 0,
  stun: 0,
};

const part = (
  id: string,
  name: string,
  multipliers: Partial<MonsterPart["multipliers"]>,
): MonsterPart => ({
  id,
  kind: name,
  name,
  health: null,
  kinsectEssence: null,
  multipliers: { ...zero, ...multipliers },
});

test("a weak point starts at 0.45 for the chosen damage type only", () => {
  const head = part("h", "head", { slash: 0.45, blunt: 0.44 });
  expect(isWeakPoint(head, "slash")).toBe(true);
  expect(isWeakPoint(head, "blunt")).toBe(false);
  expect(isWeakPoint(head, "fire")).toBe(false);
});

test("parts sort by the selected damage type, descending, without mutating the input", () => {
  const parts = [
    part("a", "tail", { slash: 0.3, blunt: 0.9 }),
    part("b", "head", { slash: 0.65, blunt: 0.1 }),
    part("c", "neck", { slash: 0.3, blunt: 0.5 }),
  ];
  expect(sortPartsBy(parts, "slash").map((p) => p.id)).toEqual(["b", "a", "c"]);
  expect(sortPartsBy(parts, "blunt").map((p) => p.id)).toEqual(["a", "c", "b"]);
  expect(parts.map((p) => p.id)).toEqual(["a", "b", "c"]);
});

test("repeated part names are numbered, unique ones are not", () => {
  const labels = partLabels([
    part("1", "left-wing", {}),
    part("2", "hide", {}),
    part("3", "hide", {}),
  ]);
  expect(labels.get("1")).toBe("Left Wing");
  expect(labels.get("2")).toBe("Hide 1");
  expect(labels.get("3")).toBe("Hide 2");
});

test("only element weaknesses are listed, strongest first", () => {
  const list: MonsterWeakness[] = [
    { kind: "status", name: "poison", level: 3, condition: null },
    { kind: "element", name: "ice", level: 1, condition: null },
    { kind: "element", name: "dragon", level: 3, condition: null },
  ];
  expect(elementWeaknesses(list).map((w) => w.name)).toEqual(["dragon", "ice"]);
});

test("multipliers print compactly", () => {
  expect(formatMultiplier(0)).toBe("0");
  expect(formatMultiplier(0.65)).toBe("0.65");
  expect(formatMultiplier(0.7)).toBe("0.7");
  expect(formatMultiplier(1)).toBe("1");
});
