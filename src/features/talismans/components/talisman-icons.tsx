/** Decoration-slot icon helpers shared by the talisman form and card. */

import { cn } from "@/lib/utils";
import HeadSVG from "@/svg/HeadSvg";

/** Slot-type glyph: an armour piece (head) or a weapon (greatsword). */
export const SlotTypeIcon = ({
  type,
  className,
}: {
  type: "armor" | "weapon";
  className?: string;
}) => {
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
};

/** Decoration-slot size glyph (1–4), matching the in-game slot art. */
export const SlotSizeIcon = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => {
  const clamped = Math.min(Math.max(Math.round(size), 1), 4);
  return (
    <img
      src={`/images/slot${clamped}.png`}
      alt={`Slot size ${clamped}`}
      className={cn("object-contain", className)}
    />
  );
};
