import { expect, test } from "bun:test";
import {
  createSkillCatalog,
  type SkillCatalogResponse,
} from "./skill-catalog";

const response: SkillCatalogResponse = {
  skills: [
    {
      id: "attack",
      name: "Attack Boost",
      kind: "armor",
      maxLevel: 7,
      icon: "attack",
    },
    {
      id: "focus",
      name: "Focus",
      kind: "weapon",
      maxLevel: 3,
      icon: null,
    },
  ],
  bonuses: [
    {
      id: "might",
      name: "Doshaguma's Might",
      kind: "set",
      icon: "offense",
      thresholds: [
        { piecesRequired: 4, effectName: "Powerhouse II", level: 1 },
        { piecesRequired: 2, effectName: "Powerhouse I", level: 1 },
      ],
    },
    {
      id: "ward",
      name: "Ward of the Wild",
      kind: "group",
      icon: "group",
      thresholds: [
        { piecesRequired: 1, effectName: "Ward of the Wild I", level: 1 },
      ],
    },
  ],
};

test("creates every shared view from one skill catalog response", () => {
  const catalog = createSkillCatalog(response);

  expect(catalog.grouped.armorSkills[0]).toMatchObject({
    id: "attack",
    category: "armor",
    cleanName: "attack boost",
  });
  expect(catalog.grouped.weaponSkills[0]?.category).toBe("weapon");
  expect(catalog.grouped.setSkills[0]).toMatchObject({
    id: "might",
    category: "set",
    requiredPieces: 2,
    effectName: "Powerhouse I",
  });
  expect(catalog.grouped.groupSkills[0]?.category).toBe("group");
  expect(catalog.byId.get("attack")?.name).toBe("Attack Boost");
  expect(catalog.byName.get("Attack Boost")).toMatchObject({
    category: "armor",
    icon: "attack",
  });
  expect(catalog.bonuses.set[0]?.id).toBe("might");
  expect(catalog.bonuses.group[0]?.id).toBe("ward");
});
