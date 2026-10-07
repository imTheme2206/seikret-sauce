/**
 * Translation between the saved snapshot (server-owned facts) and the editor
 * draft (ids only). `snapshotFromDraft` resolves ids against the catalogs so the
 * editor can show live totals using the exact same `calculateBuild` the
 * permalink uses — nothing is computed twice in two ways.
 */

import type { CustomTalisman } from "@/features/talismans/types";
import { deriveArtianStats, EMPTY_CUSTOMIZATION } from "./artian";
import { ARMOR_POSITIONS, EMPTY_DRAFT } from "./config";
import { toGearSlots } from "./utils";
import type {
  Armor,
  ArtianRules,
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
  Weapon,
} from "./types";

const toAssignments = (
  piece: Pick<SnapshotPiece, "decorations"> | SnapshotWeapon,
  catalog: Decoration[] = [],
  type?: Decoration["type"],
): DecorationAssignment[] => {
  return (piece.decorations ?? []).map(({ slotIndex, decorationId, name, slotSize }) => ({
    slotIndex,
    decorationId: catalog.find((item) => item.id === decorationId)?.id
      ?? catalog.find((item) => item.name === name && item.type === type && item.slotSize === slotSize)?.id
      ?? decorationId,
  }));
};

type DraftCatalog = {
  armors: Armor[];
  decorations: Decoration[];
  weapons?: Weapon[];
  bonuses?: SkillCatalog["bonuses"];
};

/** Rehydrates the editor, resolving old catalog IDs by saved identity after a catalog refresh. */
export const draftFromBuild = (build: SavedBuild, catalog?: DraftCatalog): BuildDraft => {
  const { positions } = build.composition;
  const composition: BuildDraft["composition"] = { ...EMPTY_DRAFT.composition };

  for (const position of ARMOR_POSITIONS) {
    const piece = positions[position];
    if (!piece) continue;
    const armor = catalog?.armors.find((item) => item.id === piece.armorId)
      ?? catalog?.armors.find((item) => item.name === piece.name && item.type === position);
    composition[position] = {
      armorId: armor?.id ?? piece.armorId,
      decorations: toAssignments(piece, catalog?.decorations, "armor"),
    };
  }

  const talisman = positions.talisman;
  if (talisman) {
    const guild = talisman.source === "scraped"
      ? catalog?.armors.find((item) => item.id === talisman.talismanId)
        ?? catalog?.armors.find((item) => item.name === talisman.name && item.type === "talisman")
      : undefined;
    composition.talisman = {
      source: talisman.source,
      talismanId: guild?.id ?? talisman.talismanId,
      decorations: toAssignments(talisman, catalog?.decorations, "armor"),
    };
  }

  // A legacy bonus-only weapon has no `weaponId`; it hydrates as bonuses alone.
  const savedWeapon = positions.weapon;
  const weapon = savedWeapon?.weaponId
    ? catalog?.weapons?.find((item) => item.id === savedWeapon.weaponId)
      ?? catalog?.weapons?.find((item) => item.name === savedWeapon.name && item.kind === savedWeapon.kind)
    : undefined;
  const resolveBonus = (bonus: SnapshotWeapon["setBonus"] | undefined, kind: "set" | "group") =>
    catalog?.bonuses?.find((item) => item.id === bonus?.bonusId)?.id
      ?? catalog?.bonuses?.find((item) => item.name === bonus?.name && item.kind === kind)?.id
      ?? bonus?.bonusId ?? null;
  composition.weapon = {
    weaponId: weapon?.id ?? savedWeapon?.weaponId ?? null,
    decorations: savedWeapon ? toAssignments(savedWeapon, catalog?.decorations, "weapon") : [],
    setBonusId: resolveBonus(savedWeapon?.setBonus, "set"),
    groupBonusId: resolveBonus(savedWeapon?.groupBonus, "group"),
    // Snapshots saved before ADR-0014 (or for plain weapons) carry no configuration.
    customization: savedWeapon?.customization?.config ?? null,
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
  weapons: Weapon[] = [],
  artianRules?: ArtianRules,
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
    const selection = draft.composition.weapon;
    const setBonus = toWeaponBonus(selection.setBonusId);
    const groupBonus = toWeaponBonus(selection.groupBonusId);
    const item = weapons.find((weapon) => weapon.id === selection.weaponId);

    if (!item) {
      return setBonus || groupBonus
        ? { weaponId: null, setBonus, groupBonus }
        : null;
    }

    // An Artian-family weapon shows (and counts) its derived effective stats,
    // exactly as the backend snapshots them on save.
    let effective: Pick<Weapon, "damage" | "affinity" | "specials"> = item;
    let customization: SnapshotWeapon["customization"] = null;
    if (item.artian && artianRules) {
      const config = selection.customization ?? EMPTY_CUSTOMIZATION;
      const derived = deriveArtianStats(item, item.artian, config, artianRules);
      effective = derived;
      customization = {
        family: item.artian.family,
        tier: item.artian.tier,
        focus: item.artian.focus,
        config,
        base: { damage: item.damage, affinity: item.affinity },
        sharpnessBonus: derived.sharpnessBonus,
        ammoBonus: derived.ammoBonus,
        gameVersion: artianRules.gameVersion,
      };
    }
    return {
      weaponId: item.id,
      name: item.name,
      kind: item.kind,
      rarity: item.rarity,
      damage: effective.damage,
      affinity: effective.affinity,
      specials: effective.specials,
      sharpness: item.sharpness,
      slots: item.slots,
      skills: item.skills,
      decorations: decorate(selection.decorations),
      customization,
      setBonus,
      groupBonus,
    };
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
