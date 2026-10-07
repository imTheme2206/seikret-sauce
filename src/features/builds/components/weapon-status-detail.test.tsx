import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { Weapon } from "../types";
import { WeaponStatusDetail } from "./weapon-status-detail";

const weapon: Weapon = {
  id: "status-test",
  name: "Status Test Weapon",
  kind: "great-sword",
  rarity: 8,
  damage: { raw: 100, display: 480 },
  affinity: 0,
  specials: [
    { kind: "status", name: "poison", damage: { raw: 0, display: 240 }, hidden: false },
    { kind: "status", name: "sleep", damage: { raw: 0, display: 180 }, hidden: false },
  ],
  sharpness: null,
  handicraft: null,
  slots: [3, 3, 3],
  skills: [],
  elderseal: null,
  defenseBonus: 0,
  series: null,
  artian: null,
  kindSpecific: {},
};

test("weapon status details use the shared ailment glyphs and labels", () => {
  const html = renderToStaticMarkup(<WeaponStatusDetail weapon={weapon} showName={false} />);
  expect(html).toContain("Poison");
  expect(html).toContain("240");
  expect(html).toContain("/images/status/poison.png");
  expect(html).toContain("Sleep");
  expect(html).toContain("/images/status/sleep.png");
});
