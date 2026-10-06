import { effectiveWeapon } from "@/features/builds/artian";
import { weaponSummary } from "@/features/builds/weapon-rows";
import type {
  ArtianRules,
  EditorWeaponSelection,
  GearOptionGroup,
  Weapon,
  WeaponKind,
} from "@/features/builds/types";
import type { CustomWeapon } from "./types";

export const SAVED_WEAPON_OPTION_PREFIX = "saved:";

export const savedWeaponOptionValue = (id: string): string =>
  `${SAVED_WEAPON_OPTION_PREFIX}${id}`;

export const savedWeaponIdFromOptionValue = (value: string): string | null =>
  value.startsWith(SAVED_WEAPON_OPTION_PREFIX)
    ? value.slice(SAVED_WEAPON_OPTION_PREFIX.length)
    : null;

/** Finds a preset matching the build snapshot; builds intentionally store no preset link. */
export const matchingSavedWeapon = (
  selection: EditorWeaponSelection,
  savedWeapons: CustomWeapon[],
): CustomWeapon | undefined =>
  savedWeapons.find(
    (saved) =>
      saved.weaponId === selection.weaponId &&
      saved.setBonusId === selection.setBonusId &&
      saved.groupBonusId === selection.groupBonusId &&
      JSON.stringify(saved.customization) === JSON.stringify(selection.customization),
  );

/** One saved preset group for the active weapon kind, with non-colliding picker IDs. */
export const savedWeaponPickerGroups = (
  savedWeapons: CustomWeapon[],
  weapons: Weapon[],
  kind: WeaponKind | null,
  rules: ArtianRules | undefined,
): GearOptionGroup[] => {
  if (!kind) return [];
  const byId = new Map(weapons.map((weapon) => [weapon.id, weapon]));
  const options = savedWeapons.flatMap((saved) => {
    const base = byId.get(saved.weaponId);
    if (!base?.artian || base.kind !== kind) return [];
    const weapon = effectiveWeapon(base, saved.customization, rules);
    return [{
      id: savedWeaponOptionValue(saved.id),
      name: saved.name,
      rarity: base.rarity,
      skills: base.skills,
      slots: base.slots,
      summary: `${base.name} · ${weaponSummary(weapon)}`,
      keywords: [
        base.name,
        base.artian.family === "gogma" ? "Gogma Artian" : "Artian",
        saved.customization.element ?? "",
      ],
    }];
  });
  return options.length > 0 ? [{ label: "Saved Artian / Gogma", options }] : [];
};
