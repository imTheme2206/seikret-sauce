import { describe, expect, test } from "bun:test";
import type { Weapon } from "@/features/builds/types";
import { EMPTY_WEAPON_SELECTION } from "@/features/builds/weapon-selection";
import {
  matchingSavedWeapon,
  savedWeaponIdFromOptionValue,
  savedWeaponOptionValue,
  savedWeaponPickerGroups,
} from "./picker-options";
import type { CustomWeapon } from "./types";

const weapons = [
  { id: "artian-bow", name: "Artian Bow", kind: "bow", rarity: 8, damage: { raw: 190, display: 228 }, affinity: 5, specials: [], sharpness: null, slots: [3], skills: [], artian: { family: "artian", tier: 8, focus: null } },
  { id: "gogma-ls", name: "Gogma Long Sword", kind: "long-sword", rarity: 8, damage: { raw: 200, display: 660 }, affinity: -10, specials: [], sharpness: null, slots: [3], skills: [], artian: { family: "gogma", tier: 8, focus: "attack" } },
] as unknown as Weapon[];

const saved = [
  { id: "uuid-bow", userId: "user", name: "Elemental Bow", weaponId: "artian-bow", customization: { element: null, attackParts: 0, affinityParts: 0, elementInfusion: false, reinforcements: [] }, setBonusId: null, groupBonusId: null, createdAt: "2026-01-01T00:00:00Z" },
  { id: "uuid-ls", userId: "user", name: "Raw Gogma LS", weaponId: "gogma-ls", customization: { element: null, attackParts: 0, affinityParts: 0, elementInfusion: false, reinforcements: [] }, setBonusId: "set", groupBonusId: "group", createdAt: "2026-01-01T00:00:00Z" },
] satisfies CustomWeapon[];
const longSwordSaved = saved[1]!;

describe("saved weapon picker options", () => {
  test("shows only presets whose base weapon matches the active kind", () => {
    expect(savedWeaponPickerGroups(saved, weapons, "bow", undefined)[0]?.options.map((option) => option.name)).toEqual(["Elemental Bow"]);
    expect(savedWeaponPickerGroups(saved, weapons, "long-sword", undefined)[0]?.options.map((option) => option.name)).toEqual(["Raw Gogma LS"]);
    expect(savedWeaponPickerGroups(saved, weapons, "hammer", undefined)).toEqual([]);
  });

  test("uses a prefixed value and matches the copied build snapshot", () => {
    const value = savedWeaponOptionValue(longSwordSaved.id);
    expect(value).toBe("saved:uuid-ls");
    expect(savedWeaponIdFromOptionValue(value)).toBe(longSwordSaved.id);
    expect(savedWeaponIdFromOptionValue("catalog-id")).toBeNull();
    expect(matchingSavedWeapon({ ...EMPTY_WEAPON_SELECTION, weaponId: longSwordSaved.weaponId, customization: longSwordSaved.customization, setBonusId: longSwordSaved.setBonusId, groupBonusId: longSwordSaved.groupBonusId }, saved)).toBe(longSwordSaved);
  });
});
