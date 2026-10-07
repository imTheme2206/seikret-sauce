/**
 * Pure transitions over the weapon part of a build — shared by the Build Editor
 * and the Loadout Optimizer so both treat Artian / Gogma Artian rules the same
 * way (backend ADR-0014): the rolled Set/Group Bonus only belong to a Gogma
 * Artian, and a configuration only carries over within the same Artian family.
 */

import {
  completeArtianBonusParts,
  initialArtianCustomization,
  normalizeCustomization,
} from "./artian";
import type {
  ArtianCustomization,
  ArtianRules,
  EditorArtianPanel,
  EditorWeaponSelection,
  Weapon,
} from "./types";

/** No weapon, no bonuses, no configuration. */
export const EMPTY_WEAPON_SELECTION: EditorWeaponSelection = {
  weaponId: null,
  decorations: [],
  setBonusId: null,
  groupBonusId: null,
  customization: null,
};

/**
 * Empty `weaponId` unequips the weapon. Slot layouts differ per weapon, so its decorations are dropped.
 * Artian configuration and Gogma bonuses only make sense on the same family of weapon,
 * so they carry over to another Artian-family row of the same family and are cleared otherwise.
 */
export const equipWeapon = (
  previous: EditorWeaponSelection,
  weaponId: string,
  weapons: Weapon[],
  rules: ArtianRules | undefined,
): EditorWeaponSelection => {
  const from = weapons.find((item) => item.id === previous.weaponId);
  const to = weapons.find((item) => item.id === weaponId);
  const sameFamily = Boolean(
    from?.artian && to?.artian && from.artian.family === to.artian.family,
  );
  const keepsBonuses = sameFamily && to?.artian?.family === "gogma";
  return {
    weaponId: weaponId || null,
    decorations: weaponId === previous.weaponId ? previous.decorations : [],
    setBonusId: keepsBonuses ? previous.setBonusId : null,
    groupBonusId: keepsBonuses ? previous.groupBonusId : null,
    customization: to?.artian && rules
      ? previous.customization && sameFamily
        ? completeArtianBonusParts(
            normalizeCustomization(to, to.artian, previous.customization, rules),
          )
        : initialArtianCustomization()
      : null,
  };
};

/** Set (or clear, with `null`) the weapon's Set or Group Bonus, by id. */
export const withWeaponBonus = (
  current: EditorWeaponSelection,
  kind: "setBonusId" | "groupBonusId",
  bonusId: string | null,
): EditorWeaponSelection => ({ ...current, [kind]: bonusId });

/** Replace the Artian / Gogma Artian configuration; ignored while no weapon is equipped. */
export const withWeaponCustomization = (
  current: EditorWeaponSelection,
  customization: ArtianCustomization,
): EditorWeaponSelection =>
  current.weaponId ? { ...current, customization } : current;

/**
 * Only a Gogma Artian carries a Set/Group Bonus. Drafts and saved state from before that rule may
 * pair bonuses with another weapon; drop them once the catalog can say so. Returns `current`
 * itself when there is nothing to drop, so callers can skip a state update.
 */
export const dropStrayBonuses = (
  current: EditorWeaponSelection,
  weapons: Weapon[],
): EditorWeaponSelection => {
  const { weaponId, setBonusId, groupBonusId } = current;
  if (!weaponId || (!setBonusId && !groupBonusId)) return current;
  const item = weapons.find((weapon) => weapon.id === weaponId);
  if (!item || item.artian?.family === "gogma") return current;
  return { ...current, setBonusId: null, groupBonusId: null };
};

/** Weapon rules the API would reject anyway, as a readable sentence; `null` when fine. */
export const weaponProblem = (
  panel: EditorArtianPanel | null,
  selection: EditorWeaponSelection,
): string | null => {
  if (panel?.issue) return panel.issue;
  if (panel?.family === "gogma" && (!selection.setBonusId || !selection.groupBonusId)) {
    return "A Gogma Artian weapon always has both a Set Bonus and a Group Bonus.";
  }
  return null;
};
