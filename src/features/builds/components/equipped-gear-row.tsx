import { CircleSlash, Gem } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { slotSizes } from "../utils";
import { GearSkillLine } from "./gear-skill-line";
import { HunterPanel } from "./hunter-panel";
import { PositionBadge } from "./position-badge";
import { RarityPips } from "./rarity-pips";
import { SlotPips } from "./slot-pips";
import type { PositionKey, SnapshotPositions } from "../types";

interface EquippedGearRowProps {
  position: PositionKey;
  piece: SnapshotPositions[PositionKey];
}

/** Read-only counterpart of the editor row, rendered from a saved snapshot. */
export function EquippedGearRow({ position, piece }: EquippedGearRowProps) {
  const rarity = piece && "rarity" in piece ? piece.rarity : undefined;

  return (
    <HunterPanel className="grid min-h-28 sm:grid-cols-[145px_1fr]">
      <PositionBadge position={position} caption="Equipped" rarity={rarity} />

      {piece ? (
        <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Typography as="h3" className="font-medium">
                {piece.name}
              </Typography>
              {rarity !== undefined && <RarityPips value={rarity} />}
            </div>
            <GearSkillLine
              skills={piece.skills}
              bonuses={piece.bonuses}
              className="mt-2"
            />
            {piece.decorations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {piece.decorations.map((decoration) => (
                  <Typography
                    as="span"
                    key={`${decoration.slotIndex}-${decoration.decorationId}`}
                    className="flex items-center gap-1 border border-primary/25 bg-primary/[.06] px-2 py-1 text-[10px] text-primary"
                  >
                    <Gem className="size-3" />
                    {decoration.name} · Lv {decoration.slotSize}
                  </Typography>
                ))}
              </div>
            )}
          </div>
          <SlotPips slots={"slots" in piece ? slotSizes(piece.slots) : []} />
        </div>
      ) : (
        <Typography
          as="div"
          className="flex items-center justify-center gap-2 p-4 text-xs uppercase tracking-[.16em] text-muted-foreground"
        >
          <CircleSlash className="size-3.5" /> Empty
        </Typography>
      )}
    </HunterPanel>
  );
}
