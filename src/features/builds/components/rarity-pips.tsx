import { Typography } from "@/components/ui/typography";
import { rarityColor } from "@/lib/mh-wilds";

/** Rarity as diamonds, tinted with the in-game rarity colour. */
export function RarityPips({ value }: { value: number }) {
  const clamped = Math.max(1, Math.min(value, 8));
  return (
    <Typography
      as="span"
      className="text-[10px] tracking-[.18em]"
      style={{ color: rarityColor(value) }}
      title={`Rarity ${value}`}
    >
      {"◆".repeat(clamped)}
    </Typography>
  );
}
