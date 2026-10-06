import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { Weapon } from "../types";
import type { HunterStatusSkill } from "../hunter-status";

// Link needs a router; the panel only uses it for a plain anchor to /monsters.
const realRouter = await import("@tanstack/react-router");
mock.module("@tanstack/react-router", () => ({
  ...realRouter,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));
const { EfrPanelView } = await import("./efr-panel");

const weapon = {
  kind: "long-sword",
  damage: { raw: 200, display: 660 },
  affinity: 0,
  specials: [
    { kind: "element", name: "fire", damage: { raw: 35, display: 350 }, hidden: false },
  ],
  sharpness: { red: 50, orange: 50, yellow: 50, green: 50, blue: 50, white: 0, purple: 0 },
} as unknown as Weapon;

const skills: HunterStatusSkill[] = [
  { name: "Attack Boost", level: 5, icon: null, category: "weapon" },
  { name: "Agitator", level: 5, icon: null, category: "armor" },
  { name: "Mind's Eye", level: 3, icon: null, category: "weapon" },
];

const target = {
  monsterName: "Rathalos",
  partLabel: "Head",
  multipliers: { slash: 0.65, blunt: 0.7, pierce: 0.6, fire: 0.1, water: 0.3, thunder: 0.3, ice: 0.3, dragon: 0.3 },
};

const render = (overrides: Partial<Parameters<typeof EfrPanelView>[0]> = {}) =>
  renderToStaticMarkup(
    <EfrPanelView
      weapon={weapon}
      skills={skills}
      target={target}
      uptimes={{}}
      onUptime={() => {}}
      sharpness={null}
      onSharpness={() => {}}
      {...overrides}
    />,
  );

test("without a weapon it shows an empty state and no numbers", () => {
  const html = render({ weapon: null });
  expect(html).toContain("Equip a weapon");
  expect(html).not.toContain("Effective raw");
});

test("without a target part it links to the Monsters page", () => {
  const html = render({ target: null });
  expect(html).toContain("Pick a target monster part");
  expect(html).toContain('href="/monsters"');
  expect(html).not.toContain("Effective raw");
});

test("with weapon and target it renders the numbers, sliders and the not-modelled list", () => {
  const html = render();
  // Long Sword blue (raw 1.2), head slash 0.65, Attack Boost 5 (+4% +9), Agitator at the
  // default 50% (+10 attack, +7.5% affinity): attack 200 x 1.04 + 9 + 10 = 227,
  // crit 1 + 0.075 x 0.25 = 1.01875, 227 x 1.2 x 1.01875 x 0.65 = 180.4
  expect(html).toContain("Rathalos - Head");
  expect(html).toContain("Effective raw");
  expect(html).toContain("180.4");
  expect(html).toContain('aria-label="Agitator uptime"');
  expect(html).toContain("Always on");
  expect(html).toContain("Not modelled");
  expect(html).toContain("Mind&#x27;s Eye");
});
