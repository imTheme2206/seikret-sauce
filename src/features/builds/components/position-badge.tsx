import { SlotIcon } from "@/components/gear/slot-icon";
import { Typography } from "@/components/ui/typography";
import { POSITION_LABELS, rarityColor } from "@/lib/mh-wilds";
import { cn } from "@/lib/utils";
import type { PositionKey } from "../types";

type PositionBadgeProps = {
  position: PositionKey;
  /** Small line above the label, e.g. "Equip" or "Equipped". */
  caption: string;
  /** Tints the glyph with the equipped piece's rarity when there is one. */
  rarity?: number;
  className?: string;
};

/**
 * Left-hand identity cell of a gear row — the same glyph the optimizer shows for
 * that position, so a build row and a search result read alike.
 */
export const PositionBadge = ({
  position,
  caption,
  rarity,
  className,
}: PositionBadgeProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border bg-secondary/40 p-4 md:border-b-0 md:border-r",
        className,
      )}
    >
      <div className="grid size-10 shrink-0 place-items-center border border-primary/30 bg-primary/[.08]">
        <SlotIcon position={position} color={rarityColor(rarity ?? 0)} size={20} />
      </div>
      <div>
        <Typography
          as="div"
          className="text-[11px] uppercase tracking-[.2em] text-muted-foreground"
        >
          {caption}
        </Typography>
        <Typography as="div" className="font-semibold">
          {POSITION_LABELS[position]}
        </Typography>
      </div>
    </div>
  );
};
