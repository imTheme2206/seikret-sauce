/**
 * Adapts a catalog weapon (already carrying its *effective* stats, i.e. derived
 * Artian / Gogma values from #03) to the model's `EfrWeapon`. Structural types,
 * so this module does not depend on the builds feature.
 */

import { ELEMENT_NAMES, SHARPNESS_COLORS, WEAPON_KINDS } from "./tables";
import type { EfrWeapon } from "./efr";
import type { ElementKey, SharpnessColor, WeaponKind } from "./types";

export type CatalogWeaponLike = {
  kind: string;
  damage: { raw: number };
  affinity: number;
  specials: {
    kind: string;
    name: string;
    damage: { display: number };
    hidden: boolean;
  }[];
  sharpness: Record<SharpnessColor | "purple", number> | null;
};

export type WeaponAdaptation =
  | {
      ok: true;
      weapon: EfrWeapon;
      /** Highest colour of the catalog bar; the colour used unless overridden. */
      maxSharpness: SharpnessColor | null;
      /** Visible element specials that are not one of the five hitzone elements (status). */
      ignoredSpecials: string[];
      hiddenElement: string | null;
    }
  | { ok: false; reason: string };

/** Highest colour with sharpness points, or `null` for no bar. Purple is not modelled. */
export const maxSharpnessColor = (
  bar: CatalogWeaponLike["sharpness"],
): SharpnessColor | null | "unmodelled" => {
  if (!bar) return null;
  if (bar.purple > 0) return "unmodelled";
  return [...SHARPNESS_COLORS].reverse().find((color) => bar[color] > 0) ?? null;
};

const isElementKey = (name: string): name is ElementKey =>
  (ELEMENT_NAMES as readonly string[]).includes(name);

export const adaptWeapon = (
  weapon: CatalogWeaponLike,
  sharpnessOverride?: SharpnessColor | null,
): WeaponAdaptation => {
  if (!(WEAPON_KINDS as string[]).includes(weapon.kind)) {
    return { ok: false, reason: `Unknown weapon type "${weapon.kind}".` };
  }
  const max = maxSharpnessColor(weapon.sharpness);
  if (max === "unmodelled") {
    return {
      ok: false,
      reason: "Purple sharpness has no confirmed modifiers, so it is not modelled.",
    };
  }

  const visible = weapon.specials.filter((special) => !special.hidden);
  const elementSpecial = visible.find(
    (special) => special.kind === "element" && isElementKey(special.name),
  );
  const hidden = weapon.specials.find(
    (special) => special.hidden && special.kind === "element",
  );

  return {
    ok: true,
    weapon: {
      kind: weapon.kind as WeaponKind,
      trueRaw: weapon.damage.raw,
      affinity: weapon.affinity,
      element: elementSpecial
        ? {
            name: elementSpecial.name as ElementKey,
            display: elementSpecial.damage.display,
          }
        : null,
      sharpness:
        weapon.sharpness === null ? null : (sharpnessOverride ?? max),
    },
    maxSharpness: max,
    ignoredSpecials: visible
      .filter((special) => special !== elementSpecial)
      .map((special) => special.name),
    hiddenElement: hidden?.name ?? null,
  };
};
