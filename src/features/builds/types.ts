/**
 * Domain types for the Builds feature.
 *
 * Everything the API owns is *derived* from the generated OpenAPI paths rather
 * than restated, so a backend schema change surfaces as a type error here. The
 * editor-only shapes (`BuildDraft` and friends) are the exception: they model
 * in-progress UI state that has no server representation until save.
 */

import type { ElementalDefenses } from "@/lib/mh-wilds";
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
export type SkillCatalog = JsonResponse<"/api/mh-wilds/skills", "get">;
export type BuildSummary = JsonResponse<"/api/mh-wilds/builds", "get">[number];
export type SharedBuildPage = JsonResponse<
  "/api/mh-wilds/builds/shared",
  "get"
>;
export type SavedBuild = JsonResponse<"/api/mh-wilds/builds/{id}", "get">;

export type BuildSnapshot = SavedBuild["composition"];
export type SnapshotPositions = BuildSnapshot["positions"];
/** The six position keys the API stores. Pinned to `@/lib/mh-wilds` in `config.ts`. */
export type PositionKey = keyof SnapshotPositions;
export type ArmorPosition = Exclude<PositionKey, "talisman">;
export type SnapshotPiece = NonNullable<SnapshotPositions[PositionKey]>;
export type SnapshotArmor = NonNullable<SnapshotPositions[ArmorPosition]>;
export type SnapshotTalisman = NonNullable<SnapshotPositions["talisman"]>;

export type CreateBuildBody =
  paths["/api/mh-wilds/builds"]["post"]["requestBody"]["content"]["application/json"];

/** Fields the PATCH endpoint accepts — metadata only, never the composition. */
export interface BuildMetadataPatch {
  name?: string;
  description?: string | null;
  isShared?: boolean;
}

export interface DecorationAssignment {
  slotIndex: number;
  decorationId: string;
}

export interface EditorArmorSelection {
  armorId: string;
  decorations: DecorationAssignment[];
}

export interface EditorTalismanSelection {
  source: TalismanSource;
  talismanId: string;
  decorations: DecorationAssignment[];
}

/** Talismans come either from the scraped catalog or the hunter's own list. */
export type TalismanSource = "custom" | "scraped";

/** In-progress editor state; becomes a `CreateBuildBody` on save. */
export interface BuildDraft {
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
  };
}

export interface ActivatedBonus {
  name: string;
  kind: "set" | "group";
  pieces: number;
  piecesRequired: number;
  effectName: string;
  level: number;
}

/** Display totals projected from a snapshot by `calculator.ts`. */
export interface BuildTotals {
  skills: Record<string, number>;
  rawSkills: Record<string, number>;
  bonusCounts: Record<string, number>;
  activeBonuses: ActivatedBonus[];
  defense: number;
  resistances: ElementalDefenses;
}

/** A decoration slot on a piece: armour slots carry no `type`, weapon slots do. */
export interface GearSlot {
  size: number;
  type: "armor" | "weapon";
}

/** One choice in a gear or decoration picker. */
export interface GearOption {
  id: string;
  name: string;
  /** Rarity of the piece, used to tint its glyph. Absent when it has none. */
  rarity?: number;
  /** Extra terms the search should match, e.g. the skills a piece grants. */
  keywords?: string[];
}

/**
 * Options bucketed under a heading — rarity for armour, source for talismans,
 * jewel level for decorations. The heading carries what a per-row `R8` suffix
 * used to, so options themselves stay clean.
 */
export interface GearOptionGroup {
  label: string;
  options: GearOption[];
}

/** A decoration slot rendered as a picker: what fits it, and what sits in it. */
export interface EditorSlot extends GearSlot {
  slotIndex: number;
  selectedId: string;
  groups: GearOptionGroup[];
}

/**
 * Everything one row of the editor needs, resolved from the draft against the
 * catalogs. Derived by `gear-rows.ts` so the row component is pure presentation.
 */
export interface EditorGearRow {
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
}
