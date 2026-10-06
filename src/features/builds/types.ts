import type { DecorationColor } from "@/lib/decoration-sprite";
/**
 * Domain types for the Builds feature.
 *
 * Everything the API owns is *derived* from the generated OpenAPI paths rather
 * than restated, so a backend schema change surfaces as a type error here. The
 * editor-only shapes (`BuildDraft` and friends) are the exception: they model
 * in-progress UI state that has no server representation until save.
 */

import type { ElementalDefenses } from "@/lib/mh-wilds";
import type { SkillCatalogResponse } from "@/features/skills/skill-catalog";
import type { paths } from "@/vendor/openapi";

type JsonResponse<
  Path extends keyof paths,
  Method extends keyof paths[Path],
> = paths[Path][Method] extends {
  responses: { 200: { content: { "application/json": infer Response } } };
}
  ? Response
  : never;

export type Armor = JsonResponse<"/api/mh-wilds/armors", "get">[number];
export type Decoration = JsonResponse<
  "/api/mh-wilds/decorations",
  "get"
>[number];
export type Weapon = JsonResponse<"/api/mh-wilds/weapons", "get">[number];
export type WeaponKind = Weapon["kind"];
export type SkillCatalog = SkillCatalogResponse;
export type BuildSummary = JsonResponse<"/api/mh-wilds/builds", "get">[number];
export type SharedBuildPage = JsonResponse<
  "/api/mh-wilds/builds/shared",
  "get"
>;
export type SavedBuild = JsonResponse<"/api/mh-wilds/builds/{id}", "get">;

export type BuildSnapshot = SavedBuild["composition"];
export type SnapshotPositions = BuildSnapshot["positions"];
/**
 * The six *renderable gear-row* position keys the API stores — the five body
 * pieces plus the talisman. Pinned to `@/lib/mh-wilds` in `config.ts`.
 *
 * `weapon` is deliberately excluded: a weapon is picked by kind then item and
 * carries its own stats panel, so it doesn't fit the `EditorGearRow` /
 * `EquippedGearRow` shape the other six do (backend ADR-0013). It is modelled
 * separately below (`SnapshotWeapon`, `EditorWeaponSelection`, `EditorWeaponRow`).
 */
export type PositionKey = Exclude<keyof SnapshotPositions, "weapon">;
export type ArmorPosition = Exclude<PositionKey, "talisman">;
export type SnapshotPiece = NonNullable<SnapshotPositions[PositionKey]>;
export type SnapshotArmor = NonNullable<SnapshotPositions[ArmorPosition]>;
export type SnapshotTalisman = NonNullable<SnapshotPositions["talisman"]>;
/** A weapon's Set + Group Bonus contribution, resolved to full bonus records. */
export type SnapshotWeapon = NonNullable<SnapshotPositions["weapon"]>;

export type CreateBuildBody =
  paths["/api/mh-wilds/builds"]["post"]["requestBody"]["content"]["application/json"];

/**
 * Body for `POST /api/mh-wilds/builds/import` — the raw optimizer result plus
 * the weapon's Set/Group Bonus *names* (the optimizer's `WeaponSkills`
 * currency). The backend resolves names to ids and packs decorations itself;
 * the client sends `result` untouched, per ADR-0001.
 */
export type ImportBuildBody =
  paths["/api/mh-wilds/builds/import"]["post"]["requestBody"]["content"]["application/json"];

/** Fields the PATCH endpoint accepts — metadata only, never the composition. */
export type BuildMetadataPatch = {
  name?: string;
  description?: string | null;
  isShared?: boolean;
};

export type DecorationAssignment = {
  slotIndex: number;
  decorationId: string;
};

export type EditorArmorSelection = {
  armorId: string;
  decorations: DecorationAssignment[];
};

export type EditorTalismanSelection = {
  source: TalismanSource;
  talismanId: string;
  decorations: DecorationAssignment[];
};

/** Talismans come either from the scraped catalog or the hunter's own list. */
export type TalismanSource = "custom" | "scraped";

/**
 * The weapon part of a draft: the catalog weapon (`weaponId`) plus its
 * Set/Group Bonus contribution, selected by id (unlike the optimizer's
 * `WeaponSkills`, which selects by name — see `src/features/loadout/types.ts`).
 * Always present on the draft, never `null`: each field independently means
 * "nothing chosen" when `null`.
 *
 * `weaponId` lives only in the local Working Build for now; saving a Build
 * does not send it yet (`toCreateBody` strips it).
 */
export type EditorWeaponSelection = {
  weaponId: string | null;
  setBonusId: string | null;
  groupBonusId: string | null;
};

/** In-progress editor state; becomes a `CreateBuildBody` on save. */
export type BuildDraft = {
  name: string;
  description: string;
  isShared: boolean;
  composition: {
    head: EditorArmorSelection | null;
    chest: EditorArmorSelection | null;
    arms: EditorArmorSelection | null;
    waist: EditorArmorSelection | null;
    legs: EditorArmorSelection | null;
    talisman: EditorTalismanSelection | null;
    weapon: EditorWeaponSelection;
  };
};

export type ActivatedBonus = {
  name: string;
  kind: "set" | "group";
  pieces: number;
  piecesRequired: number;
  effectName: string;
  level: number;
};

/** Display totals projected from a snapshot by `calculator.ts`. */
export type BuildTotals = {
  skills: Record<string, number>;
  rawSkills: Record<string, number>;
  bonusCounts: Record<string, number>;
  activeBonuses: ActivatedBonus[];
  defense: number;
  resistances: ElementalDefenses;
};

/** A decoration slot on a piece: armour slots carry no `type`, weapon slots do. */
export type GearSlot = {
  size: number;
  type: "armor" | "weapon";
};

/** One choice in a gear or decoration picker. */
export type GearOption = {
  id: string;
  name: string;
  /** Rarity of the piece, used to tint its glyph. Absent when it has none. */
  rarity?: number;
  /** Skills granted by this choice, shown directly in the picker. */
  skills?: { name: string; level: number }[];
  /** Set or group bonuses granted by this choice. */
  bonuses?: { name: string }[];
  /** Decoration slot levels. Undefined for choices that are not gear. */
  slots?: number[];
  /** One-line stat summary shown under the name (weapons). */
  summary?: string;
  /** Extra terms the search should match, e.g. the skills a piece grants. */
  keywords?: string[];
  /** For decorations: the jewel's size and in-game colour, to draw it in its socket. */
  jewel?: { level: number; color: DecorationColor };
};

/**
 * Options bucketed under a heading — rarity for armour, source for talismans,
 * jewel level for decorations. The heading carries what a per-row `R8` suffix
 * used to, so options themselves stay clean.
 */
export type GearOptionGroup = {
  label: string;
  options: GearOption[];
};

/** A decoration slot rendered as a picker: what fits it, and what sits in it. */
export type EditorSlot = GearSlot & {
  slotIndex: number;
  selectedId: string;
  groups: GearOptionGroup[];
};

/**
 * Everything one row of the editor needs, resolved from the draft against the
 * catalogs. Derived by `gear-rows.ts` so the row component is pure presentation.
 */
export type EditorGearRow = {
  position: PositionKey;
  /** Packed picker value: an armour id, or `source:id` for a talisman. */
  value: string;
  groups: GearOptionGroup[];
  /** Name of the equipped piece, or undefined when the position is empty. */
  name?: string;
  /** Absent for custom talismans, which have no rarity. */
  rarity?: number;
  skills: { name: string; level: number }[];
  bonuses: { name: string }[];
  slots: EditorSlot[];
};

/** The editable weapon row: weapon type, weapon picker, and the chosen weapon's stats. */
export type EditorWeaponRow = {
  /** Selected weapon type, or `null` until the hunter picks one. */
  kind: WeaponKind | null;
  /** Packed picker value: the weapon id, or "" when none is equipped. */
  value: string;
  /** Weapons of `kind` bucketed by rarity; empty until a type is chosen. */
  groups: GearOptionGroup[];
  /** The equipped weapon, when the draft's id resolves in the catalog. */
  weapon: Weapon | null;
};
