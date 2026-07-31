import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BuildStats } from "./build-stats";
import type { BuildSnapshot } from "../types";

const snapshot: BuildSnapshot = {
  schemaVersion: 1,
  positions: {
    head: {
      armorId: "head-1",
      name: "Test Helm",
      type: "head",
      rank: "high",
      rarity: 8,
      defense: 10,
      resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
      slots: [],
      skills: [{ skillId: "attack", name: "Attack Boost", level: 1 }],
      bonuses: [],
      decorations: [],
    },
    chest: null,
    arms: null,
    waist: null,
    legs: null,
    talisman: null,
    weapon: null,
  },
  skillDefinitions: { "Attack Boost": 7 },
  bonusDefinitions: {},
};

test("uses catalog icons for active skills", () => {
  const html = renderToStaticMarkup(
    <BuildStats
      snapshot={snapshot}
      skillIcons={{ "Attack Boost": "attack" }}
    />,
  );

  expect(html).toContain('/images/icons/attack.png');
  expect(html).toContain('alt="Attack Boost"');
});
