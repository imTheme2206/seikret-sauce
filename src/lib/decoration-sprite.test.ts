import { describe, expect, test } from "bun:test";
import { decorationColor, spriteFrame } from "./decoration-sprite";

describe("spriteFrame", () => {
  test("an empty socket is the first frame of its slot-level group, top row", () => {
    expect(spriteFrame(1)).toEqual({ x: 0, y: 0 });
    expect(spriteFrame(3)).toEqual({ x: 330, y: 0 });
  });

  test("a jewel sits at its own level inside the socket group, on its colour row", () => {
    // Level-2 red jewel in a level-3 socket: group 3, frame 2, red row (1).
    expect(spriteFrame(3, { level: 2, color: "red" })).toEqual({ x: 396, y: 30 });
  });

  test("a jewel can never render larger than its socket", () => {
    expect(spriteFrame(1, { level: 3, color: "white" })).toEqual({ x: 33, y: 0 });
  });
});

describe("decorationColor", () => {
  test("looks up the in-game colour by decoration name", () => {
    expect(decorationColor("Tenderizer Jewel 3")).toBe("dark-purple");
  });

  test("falls back to white for unknown names", () => {
    expect(decorationColor("Not A Jewel 9")).toBe("white");
    expect(decorationColor(undefined)).toBe("white");
  });
});
