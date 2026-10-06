/**
 * Resolves the draft's weapon selection into what the weapon row renders:
 * picker options for the chosen weapon type (bucketed by rarity) and the
 * equipped weapon. Pure and catalog-driven, like `gear-rows.ts`.
 */

import { gearKeywords, groupBy, toEditorSlots } from "./gear-rows";
import { toWeaponSlots } from "./utils";
import type {
  BuildDraft,
  Decoration,
  EditorWeaponRow,
  GearOption,
  GearOptionGroup,
  Weapon,
  WeaponKind,
} from "./types";

/** "thunder" -> "Thunder", "sleep-gas" -> "Sleep Gas". */
export const titleCase = (value: string): string =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** Signed percentage for display: `+15%`, `0%`, `-10%`. */
export const formatAffinity = (affinity: number): string =>
  `${affinity > 0 ? "+" : ""}${affinity}%`;

/** "Thunder 150" / "Paralysis 100 (hidden)"; display damage, as the game shows it. */
export const formatSpecial = (special: Weapon["specials"][number]): string =>
  `${titleCase(special.name)} ${special.damage.display}${special.hidden ? " (hidden)" : ""}`;

/** Raw damage with the in-game display value, e.g. `140 (462)`. */
export const formatDamage = (weapon: Weapon): string =>
  `${weapon.damage.raw} (${weapon.damage.display})`;

/** One-line stats shown under the weapon's name in the picker. */
export const weaponSummary = (weapon: Weapon): string =>
  [
    `Raw ${formatDamage(weapon)}`,
    `Affinity ${formatAffinity(weapon.affinity)}`,
    ...weapon.specials.map(formatSpecial),
  ].join(" · ");

export const weaponOption = (weapon: Weapon): GearOption => ({
  id: weapon.id,
  name: weapon.name,
  rarity: weapon.rarity,
  skills: weapon.skills,
  slots: weapon.slots,
  summary: weaponSummary(weapon),
  keywords: [
    ...gearKeywords(weapon),
    ...(weapon.series ? [weapon.series] : []),
    ...weapon.specials.map((special) => special.name),
  ],
});

/** Weapons of one kind grouped by rarity, highest first. */
export const weaponGroups = (
  weapons: Weapon[],
  kind: WeaponKind,
): GearOptionGroup[] =>
  groupBy(
    weapons.filter((weapon) => weapon.kind === kind),
    (weapon) => ({ rank: weapon.rarity, label: `Rarity ${weapon.rarity}` }),
    weaponOption,
  );

/**
 * `chosenKind` is the type the hunter picked in the UI; it only matters while
 * no weapon is equipped — an equipped weapon always dictates its own type, so
 * a restored draft shows the right list after a reload.
 */
export const buildWeaponRow = (
  draft: BuildDraft,
  weapons: Weapon[],
  chosenKind: WeaponKind | null,
  decorations: Decoration[] = [],
): EditorWeaponRow => {
  const weapon =
    weapons.find((item) => item.id === draft.composition.weapon.weaponId) ??
    null;
  const kind = weapon?.kind ?? chosenKind;
  return {
    kind,
    value: weapon?.id ?? "",
    groups: kind ? weaponGroups(weapons, kind) : [],
    weapon,
    slots: weapon
      ? toEditorSlots(
          toWeaponSlots(weapon.slots),
          draft.composition.weapon.decorations,
          decorations,
        )
      : [],
  };
};
