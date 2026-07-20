/**
 * Presentational icon helpers shared by the talisman form and card, so the
 * slot / skill glyphs stay identical across both (DRY).
 */

import { CATEGORY_CONFIG } from "@/features/loadout/config";
import { TypeIcon } from "@/features/loadout/icons";
import type { SkillCategory } from "@/features/loadout/types";
import { cn } from "@/lib/utils";
import HeadSVG from "@/svg/HeadSvg";

/** Category glyph shown beside a skill name (armour/weapon/set/group). */
export function SkillIcon({
  icon,
  category,
  className,
}: {
  icon: string | null;
  category: SkillCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden [&_img]:size-full [&_img]:object-contain [&_svg]:size-full",
        className,
      )}
    >
      <TypeIcon
        category={category}
        color={CATEGORY_CONFIG[category].color}
        icon={icon}
      />
    </span>
  );
}

/** Slot-type glyph: an armour piece (head) or a weapon (greatsword). */
export function SlotTypeIcon({
  type,
  className,
}: {
  type: "armor" | "weapon";
  className?: string;
}) {
  if (type === "weapon") {
    return (
      <img
        src="/weapons/Greatsword.webp"
        alt="Weapon slot"
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center [&_svg]:size-full",
        className,
      )}
    >
      <HeadSVG color="currentColor" />
    </span>
  );
}

/** Decoration-slot size glyph (1–4), matching the in-game slot art. */
export function SlotSizeIcon({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  const clamped = Math.min(Math.max(Math.round(size), 1), 4);
  return (
    <img
      src={`/images/slot${clamped}.png`}
      alt={`Slot size ${clamped}`}
      className={cn("object-contain", className)}
    />
  );
}
