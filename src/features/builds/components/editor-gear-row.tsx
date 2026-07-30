import { CircleCheck, Gem } from "lucide-react";
import { SlotIcon } from "@/components/gear/slot-icon";
import { Typography } from "@/components/ui/typography";
import { POSITION_LABELS, rarityColor } from "@/lib/mh-wilds";
import { slotSizes } from "../utils";
import { GearPicker } from "./gear-picker";
import { GearSkillLine } from "./gear-skill-line";
import { HunterPanel } from "./hunter-panel";
import { PositionBadge } from "./position-badge";
import { RarityPips } from "./rarity-pips";
import { SlotPips } from "./slot-pips";
import type { DecorationAssignment, EditorGearRow } from "../types";

interface EditorGearRowProps {
  row: EditorGearRow;
  onSelect: (value: string) => void;
  onDecoration: (assignment: DecorationAssignment) => void;
}

/** One editable position: pick the piece, then fill its decoration slots. */
export function EditorGearRowCard({
  row,
  onSelect,
  onDecoration,
}: EditorGearRowProps) {
  const label = POSITION_LABELS[row.position];

  return (
    <HunterPanel className="grid md:grid-cols-[150px_minmax(220px,.8fr)_minmax(300px,1.2fr)]">
      <PositionBadge position={row.position} caption="Equip" rarity={row.rarity} />

      <div className="border-b border-border p-4 md:border-b-0 md:border-r">
        <GearPicker
          value={row.value}
          groups={row.groups}
          placeholder={`Choose ${label.toLowerCase()}…`}
          emptyLabel="Leave empty"
          searchPlaceholder={`Search ${label.toLowerCase()} or skill…`}
          ariaLabel={`Choose ${label}`}
          renderIcon={(option) => (
            <SlotIcon
              position={row.position}
              color={rarityColor(option?.rarity ?? 0)}
              size={16}
            />
          )}
          onChange={onSelect}
        />
        {row.name && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Typography as="div" className="truncate text-sm font-medium">
                {row.name}
              </Typography>
              {row.rarity !== undefined && <RarityPips value={row.rarity} />}
            </div>
            <SlotPips slots={slotSizes(row.slots)} />
          </div>
        )}
      </div>

      <div className="p-4">
        {row.name ? (
          <>
            <GearSkillLine
              skills={row.skills}
              bonuses={row.bonuses}
              className="mb-3"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              {row.slots.map((slot) => (
                <div key={slot.slotIndex}>
                  <Typography
                    as="span"
                    className="mb-1 flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground"
                  >
                    <Gem className="size-3 text-primary/70" />
                    {slot.type} · Lv {slot.size}
                  </Typography>
                  <GearPicker
                    value={slot.selectedId}
                    groups={slot.groups}
                    placeholder="Empty"
                    emptyLabel="Remove jewel"
                    searchPlaceholder="Search jewel or skill…"
                    ariaLabel={`${label} jewel slot ${slot.slotIndex + 1}`}
                    renderIcon={() => (
                      <Gem className="size-3.5 shrink-0 text-primary/70" />
                    )}
                    onChange={(decorationId) =>
                      onDecoration({ slotIndex: slot.slotIndex, decorationId })
                    }
                  />
                </div>
              ))}
            </div>
            {!row.slots.length && (
              <Typography
                as="div"
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <CircleCheck className="size-3.5 text-primary" /> No decoration
                slots on this piece.
              </Typography>
            )}
          </>
        ) : (
          <Typography
            as="div"
            className="flex h-full min-h-16 items-center justify-center gap-2 text-xs uppercase tracking-[.16em] text-muted-foreground"
          >
            <Gem className="size-3.5" /> Select equipment to inspect its slots
          </Typography>
        )}
      </div>
    </HunterPanel>
  );
}
