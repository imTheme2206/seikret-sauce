import { expect, test } from "bun:test";
import rulesJson from "./__fixtures__/artian-rules.json";
import { EMPTY_DRAFT } from "./config";
import {
  buildWeaponRow,
  formatAffinity,
  titleCase,
  weaponGroups,
  weaponOption,
  weaponSummary,
} from "./weapon-rows";
import type { ArtianRules, BuildDraft, Decoration, Weapon } from "./types";

const weapon = (overrides: Partial<Weapon>): Weapon => ({
  id: "rey-1",
  name: "Rey Tonitrus I",
  kind: "long-sword",
  rarity: 3,
  damage: { raw: 140, display: 462 },
  affinity: 0,
  specials: [
    {
      kind: "element",
      name: "thunder",
      damage: { raw: 15, display: 150 },
      hidden: false,
    },
  ],
  sharpness: {
    red: 10,
    orange: 10,
    yellow: 150,
    green: 80,
    blue: 0,
    white: 0,
    purple: 0,
  },
  handicraft: [5],
  slots: [],
  skills: [{ skillId: "focus", name: "Focus", level: 1 }],
  elderseal: null,
  defenseBonus: 0,
  series: "Rey Dau Tree",
  artian: null,
  kindSpecific: {},
  ...overrides,
});

const catalog: Weapon[] = [
  weapon({}),
  weapon({ id: "rey-2", name: "Rey Tonitrus II", rarity: 4 }),
  weapon({ id: "alpha", name: "Alpha Blade", rarity: 4, affinity: 15 }),
  weapon({ id: "gs", name: "Buster Sword", kind: "great-sword", rarity: 3 }),
];

const draftWith = (weaponId: string | null): BuildDraft => ({
  ...EMPTY_DRAFT,
  composition: {
    ...EMPTY_DRAFT.composition,
    weapon: { ...EMPTY_DRAFT.composition.weapon, weaponId },
  },
});

test("summary shows raw (display), signed affinity, and specials", () => {
  expect(weaponSummary(catalog[0]!)).toBe(
    "Raw 140 (462) · Affinity 0% · Thunder 150",
  );
  expect(
    weaponSummary(
      weapon({
        affinity: -10,
        specials: [
          {
            kind: "status",
            name: "paralysis",
            damage: { raw: 10, display: 100 },
            hidden: true,
          },
        ],
      }),
    ),
  ).toBe("Raw 140 (462) · Affinity -10% · Paralysis 100 (hidden)");
});

test("formatting helpers", () => {
  expect(formatAffinity(15)).toBe("+15%");
  expect(formatAffinity(0)).toBe("0%");
  expect(titleCase("sleep-gas")).toBe("Sleep Gas");
});

test("option carries skills, slots, and search keywords for skills, series, element", () => {
  const option = weaponOption(weapon({ slots: [3, 1] }));
  expect(option).toMatchObject({
    id: "rey-1",
    rarity: 3,
    slots: [3, 1],
    skills: [{ skillId: "focus", name: "Focus", level: 1 }],
  });
  expect(option.keywords).toEqual(["Focus", "Rey Dau Tree", "thunder"]);
});

test("groups only the chosen kind, by rarity descending, sorted by name", () => {
  const groups = weaponGroups(catalog, "long-sword");
  expect(groups.map((group) => group.label)).toEqual(["Rarity 4", "Rarity 3"]);
  expect(groups[0]!.options.map((option) => option.name)).toEqual([
    "Alpha Blade",
    "Rey Tonitrus II",
  ]);
  expect(groups.flatMap((group) => group.options).map((o) => o.id)).not.toContain(
    "gs",
  );
});

test("no kind chosen means no options and no weapon", () => {
  expect(buildWeaponRow(EMPTY_DRAFT, catalog, null)).toEqual({
    kind: null,
    value: "",
    groups: [],
    weapon: null,
    artian: null,
    slots: [],
  });
});

test("a chosen kind lists its weapons before anything is equipped", () => {
  const row = buildWeaponRow(EMPTY_DRAFT, catalog, "great-sword");
  expect(row.kind).toBe("great-sword");
  expect(row.groups[0]!.options.map((option) => option.id)).toEqual(["gs"]);
  expect(row.weapon).toBeNull();
});

test("an equipped weapon dictates the kind, even after a reload without UI state", () => {
  const row = buildWeaponRow(draftWith("rey-2"), catalog, null);
  expect(row.kind).toBe("long-sword");
  expect(row.value).toBe("rey-2");
  expect(row.weapon?.name).toBe("Rey Tonitrus II");

  // It wins over a stale UI choice too.
  expect(buildWeaponRow(draftWith("rey-2"), catalog, "bow").kind).toBe(
    "long-sword",
  );
});

test("a weapon id missing from the catalog resolves to nothing", () => {
  const row = buildWeaponRow(draftWith("retired"), catalog, null);
  expect(row.weapon).toBeNull();
  expect(row.value).toBe("");
});

test("an equipped weapon exposes weapon-typed slots with their seated jewels", () => {
  const withSlots = [weapon({ id: "slotted", slots: [3, 1] })];
  const decorations = [
    { id: "tenderizer", name: "Tenderizer Jewel", type: "weapon", slotSize: 1, skills: [] },
    { id: "guard", name: "Guard Jewel", type: "armor", slotSize: 1, skills: [] },
    { id: "big", name: "Big Weapon Jewel", type: "weapon", slotSize: 3, skills: [] },
  ] as Decoration[];
  const draft: BuildDraft = {
    ...EMPTY_DRAFT,
    composition: {
      ...EMPTY_DRAFT.composition,
      weapon: {
        ...EMPTY_DRAFT.composition.weapon,
        weaponId: "slotted",
        decorations: [{ slotIndex: 1, decorationId: "tenderizer" }],
      },
    },
  };

  const { slots } = buildWeaponRow(draft, withSlots, null, decorations);
  expect(slots.map((slot) => [slot.type, slot.size, slot.selectedId])).toEqual([
    ["weapon", 3, ""],
    ["weapon", 1, "tenderizer"],
  ]);
  const optionIds = (index: number) =>
    slots[index]!.groups.flatMap((group) => group.options).map((o) => o.id);
  // Armor jewels never fit; a size-3 jewel fits only the size-3 slot.
  expect(optionIds(0).sort()).toEqual(["big", "tenderizer"]);
  expect(optionIds(1)).toEqual(["tenderizer"]);
});

test("an equipped Artian shows its derived stats and an editable panel", () => {
  const rules = rulesJson as unknown as ArtianRules;
  const artian: Weapon = weapon({
    id: "var",
    name: "Varianza",
    kind: "great-sword",
    rarity: 8,
    damage: { raw: 190, display: 912 },
    affinity: 5,
    specials: [],
    slots: [3, 3, 3],
    skills: [],
    series: null,
    artian: { family: "artian", tier: 8, focus: null },
  });
  const draft: BuildDraft = {
    ...EMPTY_DRAFT,
    composition: {
      ...EMPTY_DRAFT.composition,
      weapon: {
        ...EMPTY_DRAFT.composition.weapon,
        weaponId: "var",
        customization: {
          element: "fire",
          attackParts: 3,
          affinityParts: 0,
          elementInfusion: true,
          reinforcements: [{ type: "sharpness", level: "I" }],
        },
      },
    },
  };

  const row = buildWeaponRow(draft, [artian], null, [], rules);
  expect(row.weapon?.damage).toEqual({ raw: 205, display: 984 });
  expect(row.weapon?.specials[0]?.damage.display).toBe(480);
  expect(row.artian).toMatchObject({ family: "artian", sharpnessBonus: 30, issue: null });
  expect(row.artian?.elements).toContain("fire");

  // A plain weapon has no panel; without rules the catalog row shows through.
  expect(buildWeaponRow(draftWith("rey-1"), catalog, null, [], rules).artian).toBeNull();
  const loading = buildWeaponRow(draft, [artian], null, [], undefined);
  expect(loading.artian).toBeNull();
  expect(loading.weapon?.damage).toEqual({ raw: 190, display: 912 });
});
