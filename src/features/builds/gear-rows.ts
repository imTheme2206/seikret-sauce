/**
 * Resolves an editor draft into the rows the editor renders: which pieces are
 * equipped, what else could be, and which decorations fit each open slot.
 *
 * Pure and catalog-driven — the row components receive finished data and hold no
 * lookup logic of their own. Options are bucketed into `GearOptionGroup`s
 * (rarity, source, jewel level) because the pickers are searchable lists rather
 * than short dropdowns.
 */

import type { CustomTalisman } from "@/features/talismans/types";
import { ARMOR_POSITIONS } from "./config";
import { encodeTalismanValue, toGearSlots } from "./utils";
import type {
  Armor,
  BuildDraft,
  Decoration,
  DecorationAssignment,
  EditorGearRow,
  EditorSlot,
  GearOption,
  GearOptionGroup,
  GearSlot,
} from "./types";

const byName = (a: GearOption, b: GearOption) => a.name.localeCompare(b.name);

/** Skills and bonuses a piece grants, so searching a skill finds the gear. */
function gearKeywords(piece: {
  skills: { name: string }[];
  bonuses?: { name: string }[];
}): string[] {
  return [
    ...piece.skills.map((skill) => skill.name),
    ...(piece.bonuses ?? []).map((bonus) => bonus.name),
  ];
}

/**
 * Buckets options under a heading and orders both the headings and their
 * contents. `rank` sorts headings descending, which puts the best gear first.
 */
function groupBy<T>(
  items: T[],
  key: (item: T) => { rank: number; label: string },
  toOption: (item: T) => GearOption,
): GearOptionGroup[] {
  const buckets = new Map<number, { label: string; options: GearOption[] }>();

  for (const item of items) {
    const { rank, label } = key(item);
    const bucket = buckets.get(rank) ?? { label, options: [] };
    bucket.options.push(toOption(item));
    buckets.set(rank, bucket);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => b - a)
    .map(([, bucket]) => ({
      label: bucket.label,
      options: bucket.options.sort(byName),
    }));
}

/** Armour pieces grouped by rarity, highest first. */
function armorGroups(armors: Armor[]): GearOptionGroup[] {
  return groupBy(
    armors,
    (armor) => ({ rank: armor.rarity, label: `Rarity ${armor.rarity}` }),
    (armor) => ({
      id: armor.id,
      name: armor.name,
      rarity: armor.rarity,
      keywords: gearKeywords(armor),
    }),
  );
}

/** Decorations that fit a slot, grouped by jewel level, highest first. */
function decorationGroups(
  decorations: Decoration[],
  slot: GearSlot,
): GearOptionGroup[] {
  const fitting = decorations.filter(
    (decoration) =>
      decoration.type === slot.type && decoration.slotSize <= slot.size,
  );

  return groupBy(
    fitting,
    (decoration) => ({
      rank: decoration.slotSize,
      label: `Level ${decoration.slotSize} jewels`,
    }),
    (decoration) => ({
      id: decoration.id,
      name: decoration.name,
      keywords: gearKeywords(decoration),
    }),
  );
}

function toEditorSlots(
  slots: GearSlot[],
  assignments: DecorationAssignment[],
  decorations: Decoration[],
): EditorSlot[] {
  return slots.map((slot, slotIndex) => ({
    ...slot,
    slotIndex,
    selectedId:
      assignments.find((item) => item.slotIndex === slotIndex)?.decorationId ?? "",
    groups: decorationGroups(decorations, slot),
  }));
}

/** The five armour rows. Options are the catalog pieces for that position. */
function armorRows(
  draft: BuildDraft,
  armors: Armor[],
  decorations: Decoration[],
): EditorGearRow[] {
  return ARMOR_POSITIONS.map((position) => {
    const selection = draft.composition[position];
    const armor = armors.find((item) => item.id === selection?.armorId);
    return {
      position,
      value: selection?.armorId ?? "",
      groups: armorGroups(armors.filter((item) => item.type === position)),
      name: armor?.name,
      rarity: armor?.rarity,
      skills: armor?.skills ?? [],
      bonuses: armor?.bonuses ?? [],
      slots: armor
        ? toEditorSlots(
            toGearSlots(armor.slots),
            selection?.decorations ?? [],
            decorations,
          )
        : [],
    };
  });
}

/**
 * The talisman row, whose options merge two sources: the hunter's own talismans
 * and the guild catalog (which, having rarities, groups by them).
 */
function talismanRow(
  draft: BuildDraft,
  armors: Armor[],
  decorations: Decoration[],
  customTalismans: CustomTalisman[],
): EditorGearRow {
  const selection = draft.composition.talisman;
  const guildTalismans = armors.filter((item) => item.type === "talisman");
  const guild = guildTalismans.find((item) => item.id === selection?.talismanId);
  const custom = customTalismans.find((item) => item.id === selection?.talismanId);
  const isGuild = selection?.source === "scraped";
  const equipped = isGuild ? guild : custom;

  const slots: GearSlot[] = isGuild
    ? toGearSlots(guild?.slots ?? [])
    : custom?.slots ?? [];

  const customGroup: GearOptionGroup[] = customTalismans.length
    ? [
        {
          label: "Your talismans",
          options: customTalismans
            .map((talisman) => ({
              id: `custom:${talisman.id}`,
              name: talisman.name,
            }))
            .sort(byName),
        },
      ]
    : [];

  return {
    position: "talisman",
    value: encodeTalismanValue(selection),
    groups: [
      ...customGroup,
      ...groupBy(
        guildTalismans,
        (talisman) => ({
          rank: talisman.rarity,
          label: `Guild · rarity ${talisman.rarity}`,
        }),
        (talisman) => ({
          id: `scraped:${talisman.id}`,
          name: talisman.name,
          rarity: talisman.rarity,
          keywords: gearKeywords(talisman),
        }),
      ),
    ],
    name: equipped?.name,
    rarity: isGuild ? guild?.rarity : undefined,
    skills: isGuild ? guild?.skills ?? [] : [],
    bonuses: isGuild ? guild?.bonuses ?? [] : [],
    slots: equipped
      ? toEditorSlots(slots, selection?.decorations ?? [], decorations)
      : [],
  };
}

export function buildGearRows(
  draft: BuildDraft,
  armors: Armor[],
  decorations: Decoration[],
  customTalismans: CustomTalisman[],
): EditorGearRow[] {
  return [
    ...armorRows(draft, armors, decorations),
    talismanRow(draft, armors, decorations, customTalismans),
  ];
}
