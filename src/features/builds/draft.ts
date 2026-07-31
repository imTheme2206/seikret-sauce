/**
 * Translation between the saved snapshot (server-owned facts) and the editor
 * draft (ids only). `snapshotFromDraft` resolves ids against the catalogs so the
 * editor can show live totals using the exact same `calculateBuild` the
 * permalink uses — nothing is computed twice in two ways.
 */

import type { CustomTalisman } from "@/features/talismans/types";
import { ARMOR_POSITIONS, EMPTY_DRAFT } from "./config";
import { toGearSlots } from "./utils";
import type {
  Armor,
  BuildDraft,
  BuildSnapshot,
  Decoration,
  DecorationAssignment,
  EditorArmorSelection,
  SavedBuild,
  SkillCatalog,
  SnapshotArmor,
  SnapshotPiece,
  SnapshotTalisman,
  SnapshotWeapon,
} from "./types";

const toAssignments = (piece: SnapshotPiece): DecorationAssignment[] => {
  return piece.decorations.map(({ slotIndex, decorationId }) => ({
    slotIndex,
    decorationId,
  }));
};

/** Rehydrates the editor from a saved build; unknown pieces simply come back empty. */
export const draftFromBuild = (build: SavedBuild): BuildDraft => {
  const { positions } = build.composition;
  const composition: BuildDraft["composition"] = { ...EMPTY_DRAFT.composition };

  for (const position of ARMOR_POSITIONS) {
    const piece = positions[position];
    if (!piece) continue;
    composition[position] = {
      armorId: piece.armorId,
      decorations: toAssignments(piece),
    };
  }

  const talisman = positions.talisman;
  if (talisman) {
    composition.talisman = {
      source: talisman.source,
      talismanId: talisman.talismanId,
      decorations: toAssignments(talisman),
    };
  }

  composition.weapon = {
    setBonusId: positions.weapon?.setBonus?.bonusId ?? null,
    groupBonusId: positions.weapon?.groupBonus?.bonusId ?? null,
  };

  return {
    name: build.name,
    description: build.description ?? "",
    isShared: build.isShared,
    composition,
  };
};

export const snapshotFromDraft = (
  draft: BuildDraft,
  armors: Armor[],
  decorations: Decoration[],
  catalog: SkillCatalog | undefined,
  customTalismans: CustomTalisman[],
): BuildSnapshot => {
  const armorById = new Map(armors.map((armor) => [armor.id, armor]));
  const decorationById = new Map(
    decorations.map((decoration) => [decoration.id, decoration]),
  );
  const skillById = new Map((catalog?.skills ?? []).map((skill) => [skill.id, skill]));
  const bonusById = new Map((catalog?.bonuses ?? []).map((bonus) => [bonus.id, bonus]));

  const decorate = (assignments: DecorationAssignment[]) =>
    assignments.flatMap((assignment) => {
      const decoration = decorationById.get(assignment.decorationId);
      return decoration
        ? [
            {
              slotIndex: assignment.slotIndex,
              decorationId: decoration.id,
              name: decoration.name,
              slotSize: decoration.slotSize,
              skills: decoration.skills,
            },
          ]
        : [];
    });

  const toArmor = (
    selection: EditorArmorSelection | null,
  ): SnapshotArmor | null => {
    if (!selection) return null;
    const armor = armorById.get(selection.armorId);
    if (!armor || armor.type === "talisman") return null;
    return {
      armorId: armor.id,
      name: armor.name,
      type: armor.type,
      rank: armor.rank,
      rarity: armor.rarity,
      defense: armor.defense,
      resistances: armor.resistances,
      slots: armor.slots,
      skills: armor.skills,
      bonuses: armor.bonuses,
      decorations: decorate(selection.decorations),
    };
  };

  const toTalisman = (): SnapshotTalisman | null => {
    const selection = draft.composition.talisman;
    if (!selection) return null;

    if (selection.source === "custom") {
      const source = customTalismans.find((item) => item.id === selection.talismanId);
      if (!source) return null;
      return {
        source: "custom",
        talismanId: source.id,
        name: source.name,
        slots: source.slots,
        skills: source.skills.flatMap((skill) => {
          const definition = skillById.get(skill.skillId);
          return definition
            ? [{ skillId: skill.skillId, name: definition.name, level: skill.level }]
            : [];
        }),
        bonuses: [],
        decorations: decorate(selection.decorations),
      };
    }

    const source = armorById.get(selection.talismanId);
    if (source?.type !== "talisman") return null;
    return {
      source: "scraped",
      talismanId: source.id,
      name: source.name,
      slots: toGearSlots(source.slots),
      skills: source.skills,
      bonuses: source.bonuses,
      decorations: decorate(selection.decorations),
    };
  };

  /** Resolves a chosen bonus id to the full record the snapshot stores. */
  const toWeaponBonus = (bonusId: string | null) => {
    if (!bonusId) return null;
    const bonus = bonusById.get(bonusId);
    return bonus
      ? { bonusId: bonus.id, name: bonus.name, kind: bonus.kind }
      : null;
  };

  const toWeapon = (): SnapshotWeapon | null => {
    const setBonus = toWeaponBonus(draft.composition.weapon.setBonusId);
    const groupBonus = toWeaponBonus(draft.composition.weapon.groupBonusId);
    return setBonus || groupBonus ? { setBonus, groupBonus } : null;
  };

  return {
    schemaVersion: 1,
    positions: {
      head: toArmor(draft.composition.head),
      chest: toArmor(draft.composition.chest),
      arms: toArmor(draft.composition.arms),
      waist: toArmor(draft.composition.waist),
      legs: toArmor(draft.composition.legs),
      talisman: toTalisman(),
      weapon: toWeapon(),
    },
    skillDefinitions: Object.fromEntries(
      (catalog?.skills ?? []).map((skill) => [skill.name, skill.maxLevel]),
    ),
    bonusDefinitions: Object.fromEntries(
      (catalog?.bonuses ?? []).map((bonus) => [
        bonus.name,
        { kind: bonus.kind, thresholds: bonus.thresholds },
      ]),
    ),
  };
};
