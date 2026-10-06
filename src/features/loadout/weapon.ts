/**
 * Derivations from the optimizer's equipped weapon. The optimizer stores the same
 * weapon selection the Build Editor does (catalog weapon id, Artian configuration,
 * a Gogma Artian's rolled bonus ids); everything the search and the import need is
 * derived from it here.
 */

import type {
  EditorWeaponSelection,
  ImportBuildBody,
  SkillCatalog,
  Weapon,
} from "@/features/builds/types";
import type { WeaponSkills } from "./types";
import { EMPTY_WEAPON_SKILLS } from "./types";

type BonusLookup = SkillCatalog["bonuses"];

const bonusName = (
  bonuses: BonusLookup,
  id: string | null,
  kind: "set" | "group",
): string | null =>
  (id && bonuses.find((bonus) => bonus.id === id && bonus.kind === kind)?.name) ||
  null;

/**
 * The Set/Group Skill names the equipped weapon adds one Pre-owned Piece to. Only a
 * Gogma Artian carries bonuses (backend ADR-0014); any other weapon, no weapon, or a
 * catalog that has not loaded yet contributes nothing. Weapon *skills* (e.g. a
 * weapon's own Attack Boost) are deliberately not part of this — see CONTEXT.md.
 */
export const weaponSkillsOf = (
  selection: EditorWeaponSelection,
  weapons: Weapon[],
  bonuses: BonusLookup,
): WeaponSkills => {
  const weapon = weapons.find((item) => item.id === selection.weaponId);
  if (weapon?.artian?.family !== "gogma") return EMPTY_WEAPON_SKILLS;
  return {
    set: bonusName(bonuses, selection.setBonusId, "set"),
    group: bonusName(bonuses, selection.groupBonusId, "group"),
  };
};

/**
 * The `weapon` part of `POST /api/mh-wilds/builds/import`: bonuses by name (the
 * search result has no ids), the catalog weapon by id, and its Artian configuration.
 */
export const toImportWeapon = (
  selection: EditorWeaponSelection,
  skills: WeaponSkills,
): ImportBuildBody["weapon"] => ({
  setBonus: skills.set,
  groupBonus: skills.group,
  weaponId: selection.weaponId,
  customization: selection.weaponId ? selection.customization : null,
});
