import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import rulesJson from "../__fixtures__/artian-rules.json";
import { buildArtianPanel } from "../artian";
import type { ArtianRules, Weapon } from "../types";
import { ArtianCustomizationPanel } from "./artian-customization-panel";
import { EquippedWeaponRow } from "./equipped-weapon-row";

const rules = rulesJson as unknown as ArtianRules;

const gogma: Weapon = {
  id: "ostrak",
  name: "Ostrak Oblivion (+15% affinity)",
  kind: "great-sword",
  rarity: 8,
  damage: { raw: 180, display: 864 },
  affinity: 15,
  specials: [],
  sharpness: { red: 140, orange: 40, yellow: 40, green: 50, blue: 70, white: 10, purple: 0 },
  handicraft: null,
  slots: [3, 3, 3],
  skills: [],
  elderseal: null,
  defenseBonus: 0,
  series: null,
  artian: { family: "gogma", tier: 8, focus: "affinity" },
  kindSpecific: {},
};

const render = (weapon: Weapon, issueConfig?: Parameters<typeof buildArtianPanel>[1]) => {
  const panel = buildArtianPanel(weapon, issueConfig ?? null, rules)!;
  return renderToStaticMarkup(
    <ArtianCustomizationPanel
      panel={panel}
      setBonusId={null}
      groupBonusId={null}
      setBonusOptions={[]}
      groupBonusOptions={[]}
      onChange={() => {}}
      onBonus={() => {}}
    />,
  );
};

test("a Gogma Artian panel shows its focus, five reinforcement slots and both bonuses", () => {
  const html = render(gogma);
  expect(html).toContain("Gogma Artian · Affinity Focus");
  expect(html).toContain("Reinforcement 5 type");
  expect(html).not.toContain("Reinforcement 6 type");
  expect(html).toContain("Set Bonus");
  expect(html).toContain("Group Bonus");
});

test("a plain Artian has no bonus selects and an invalid config shows its reason", () => {
  const artian: Weapon = {
    ...gogma,
    name: "Varianza",
    artian: { family: "artian", tier: 8, focus: null },
  };
  const html = render(artian, {
    element: null,
    attackParts: 3,
    affinityParts: 1,
    elementInfusion: false,
    reinforcements: [],
  });
  expect(html).toContain("Artian · Rarity 8");
  expect(html).not.toContain("Group Bonus");
  expect(html).toContain("forged from 3 parts");
});

test("a saved customized weapon summarises its configuration read-only", () => {
  const html = renderToStaticMarkup(
    <EquippedWeaponRow
      weapon={{
        weaponId: "ostrak",
        name: gogma.name,
        kind: "great-sword",
        rarity: 8,
        damage: { raw: 209, display: 1003 },
        affinity: 33,
        specials: [],
        sharpness: null,
        slots: [3, 3, 3],
        skills: [],
        decorations: [],
        customization: {
          family: "gogma",
          tier: 8,
          focus: "affinity",
          config: {
            element: "water",
            attackParts: 1,
            affinityParts: 2,
            elementInfusion: false,
            reinforcements: [{ type: "attack", level: "EX" }],
          },
          base: { damage: { raw: 180, display: 864 }, affinity: 15 },
          sharpnessBonus: 50,
          ammoBonus: 0,
          gameVersion: "1.041",
        },
        setBonus: { bonusId: "s", name: "Arkveld's Hunger", kind: "set" },
        groupBonus: { bonusId: "g", name: "Alluring Pelt", kind: "group" },
      }}
    />,
  );
  expect(html).toContain("Gogma Artian · Affinity Focus");
  expect(html).toContain("Attack EX");
  expect(html).toContain("Sharpness +50");
  expect(html).toContain("Arkveld&#x27;s Hunger");
});
