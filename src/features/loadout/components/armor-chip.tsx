import { SlotIcon } from "@/components/gear/slot-icon";
import { Typography } from "@/components/ui/typography";
import { EQUIPMENT_POSITIONS, rarityColor } from "@/lib/mh-wilds";
import { shortArmorName } from "../utils";

interface ArmorChipProps {
  piece: string;
  slotIndex: number;
  /** Index-aligned rarity from the result. 0 = no rarity (talisman slot). */
  rarity?: number;
}

/** Compact armour-piece chip with a slot glyph, shortened name and rarity. */
export function ArmorChip({ piece, slotIndex, rarity }: ArmorChipProps) {
  const color = rarityColor(rarity ?? 0);
  const position = EQUIPMENT_POSITIONS[slotIndex] ?? "head";

  return (
    <div className="relative flex min-w-0 max-w-42 flex-1 flex-col items-center justify-center gap-[5px] overflow-hidden rounded-md bg-secondary px-1 py-2">
      <SlotIcon position={position} color={color} size={24} />
      <Typography
        as="span"
        className="w-full truncate text-center text-xs text-foreground"
      >
        {shortArmorName(piece)}
      </Typography>
    </div>
  );
}
