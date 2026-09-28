import { SlotIcon } from "@/components/gear/slot-icon";
import { Typography } from "@/components/ui/typography";
import { EQUIPMENT_POSITIONS, rarityColor } from "@/lib/mh-wilds";
import { shortArmorName } from "../utils";

type ArmorChipProps = {
  piece: string;
  slotIndex: number;
  /** Index-aligned rarity from the result. 0 = no rarity (talisman slot). */
  rarity?: number;
};

/** Compact armour-piece summary with a slot glyph, shortened name and rarity. */
export const ArmorChip = ({ piece, slotIndex, rarity }: ArmorChipProps) => {
  const color = rarityColor(rarity ?? 0);
  const position = EQUIPMENT_POSITIONS[slotIndex] ?? "head";

  return (
    <div className="relative flex min-w-0 max-w-44 flex-1 flex-col items-center justify-center gap-2 overflow-hidden border-l border-border/60 px-2 py-1 first:border-l-0">
      <SlotIcon position={position} color={color} size={28} />
      <Typography
        as="span"
        className="w-full truncate text-center text-xs text-foreground"
        title={piece}
      >
        {shortArmorName(piece)}
      </Typography>
    </div>
  );
};
