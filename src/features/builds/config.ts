/**
 * Static configuration for the Builds feature.
 *
 * The position lists come from `@/lib/mh-wilds` and are typed here as the
 * API-derived `PositionKey`/`ArmorPosition`, so if the backend snapshot ever
 * gains or renames a position these assignments stop compiling.
 */

import {
  ARMOR_POSITIONS as MH_ARMOR_POSITIONS,
  EQUIPMENT_POSITIONS,
} from "@/lib/mh-wilds";
import type {
  ArmorPosition,
  BuildDraft,
  PositionKey,
  WeaponKind,
} from "./types";

/** All six positions, in equip order. */
export const POSITION_KEYS: PositionKey[] = EQUIPMENT_POSITIONS;

/** The five body pieces — talisman handled separately, it has its own sources. */
export const ARMOR_POSITIONS: ArmorPosition[] = MH_ARMOR_POSITIONS;

/** Server-side field limits, mirrored so the inputs can enforce them. */
export const DRAFT_LIMITS = {
  name: 80,
  description: 500,
} as const;

/** Placeholder value for shadcn `Select`, which cannot hold an empty string. */
export const EMPTY_OPTION = "__empty__";

export const EMPTY_DRAFT: BuildDraft = {
  name: "",
  description: "",
  isShared: false,
  composition: {
    head: null,
    chest: null,
    arms: null,
    waist: null,
    legs: null,
    talisman: null,
    weapon: {
      weaponId: null,
      decorations: [],
      setBonusId: null,
      groupBonusId: null,
    },
  },
};

export type WeaponKindConfig = {
  kind: WeaponKind;
  label: string;
  /** Artwork under `public/weapons`. */
  image: string;
};

/** The 14 weapon types in in-game order. */
export const WEAPON_KINDS: WeaponKindConfig[] = [
  { kind: "great-sword", label: "Great Sword", image: "/weapons/Greatsword.webp" },
  { kind: "long-sword", label: "Long Sword", image: "/weapons/Longsword.webp" },
  { kind: "sword-shield", label: "Sword & Shield", image: "/weapons/Sword_and_Shield.webp" },
  { kind: "dual-blades", label: "Dual Blades", image: "/weapons/Dual_Blade.webp" },
  { kind: "hammer", label: "Hammer", image: "/weapons/Hammer.webp" },
  { kind: "hunting-horn", label: "Hunting Horn", image: "/weapons/Hunting_Horn.webp" },
  { kind: "lance", label: "Lance", image: "/weapons/Lance.webp" },
  { kind: "gunlance", label: "Gunlance", image: "/weapons/Gunlance.webp" },
  { kind: "switch-axe", label: "Switch Axe", image: "/weapons/Switch_Axe.webp" },
  { kind: "charge-blade", label: "Charge Blade", image: "/weapons/Charge_Blade.webp" },
  { kind: "insect-glaive", label: "Insect Glaive", image: "/weapons/Insect_Glaive.webp" },
  { kind: "bow", label: "Bow", image: "/weapons/Bow.webp" },
  { kind: "light-bowgun", label: "Light Bowgun", image: "/weapons/LBG.webp" },
  { kind: "heavy-bowgun", label: "Heavy Bowgun", image: "/weapons/HBG.webp" },
];

export const weaponKindConfig = (kind: WeaponKind): WeaponKindConfig =>
  WEAPON_KINDS.find((config) => config.kind === kind) ?? WEAPON_KINDS[0]!;

/** Sharpness bar segments, lowest to highest, with their in-game colours. */
export const SHARPNESS_SEGMENTS = [
  { key: "red", color: "#c0392b" },
  { key: "orange", color: "#e67e22" },
  { key: "yellow", color: "#f1c40f" },
  { key: "green", color: "#6fbf4a" },
  { key: "blue", color: "#3b82d9" },
  { key: "white", color: "#ecf0f1" },
  { key: "purple", color: "#a66de0" },
] as const;
