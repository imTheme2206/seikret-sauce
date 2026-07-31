import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { HunterStatus } from "../hunter-status";
import { BuildStats } from "./build-stats";

const status: HunterStatus = {
  defense: 10,
  resistances: { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 },
  skills: [
    {
      name: "Attack Boost",
      level: 1,
      icon: "attack",
      category: "armor",
    },
  ],
  activeBonuses: [],
};

test("uses catalog icons for active skills", () => {
  const html = renderToStaticMarkup(<BuildStats status={status} />);

  expect(html).toContain('/images/icons/attack.png');
  expect(html).toContain('alt="Attack Boost"');
});
