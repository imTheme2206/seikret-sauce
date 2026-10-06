import { DecorationSlotIcon } from "@/components/gear/decoration-slot-icon";
import { SlotIcon } from "@/components/gear/slot-icon";
import { Typography } from "@/components/ui/typography";
import { POSITION_LABELS, rarityColor } from "@/lib/mh-wilds";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import type { DecorationAssignment, EditorGearRow } from "../types";
import { slotSizes } from "../utils";
import { GearPicker } from "./gear-picker";
import { GearSkillLine } from "./gear-skill-line";
import { HunterPanel } from "./hunter-panel";
import { RarityPips } from "./rarity-pips";
import { SlotPips } from "./slot-pips";

type EditorGearRowProps = {
  row: EditorGearRow;
  onSelect: (value: string) => void;
  onDecoration: (assignment: DecorationAssignment) => void;
};

/** One editable position: pick the piece, then fill its decoration slots. */
export const EditorGearRowCard = ({
  row,
  onSelect,
  onDecoration,
}: EditorGearRowProps) => {
  const label = POSITION_LABELS[row.position];

  return (
    <HunterPanel className="grid md:grid-cols-[minmax(150px,.5fr)_minmax(300px,1.2fr)]">
      <GearPicker
        value={row.value}
        groups={row.groups}
        placeholder={`Select ${label.toLowerCase()} equipment`}
        emptyLabel="Leave empty"
        searchPlaceholder={`Search ${label.toLowerCase()} or skill…`}
        ariaLabel={`Select ${label} equipment`}
        renderIcon={(option) => (
          <SlotIcon
            position={row.position}
            color={rarityColor(option?.rarity ?? 0)}
            size={16}
          />
        )}
        onChange={onSelect}
        trigger={
          <button
            type="button"
            aria-label={`${row.name ? "Change" : "Browse"} ${label} equipment`}
            className={cn(
              "group flex min-h-24 w-full items-start gap-3 border-b border-border p-4 text-left outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:border-b-0 md:border-r",
              !row.name && "md:col-span-2 md:border-r-0",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-primary/25 bg-primary/[.08]">
              <SlotIcon
                position={row.position}
                color={rarityColor(row.rarity ?? 0)}
                size={22}
              />
            </span>
            <span className="min-w-0 flex-1">
              <Typography as="span" className="block text-xs text-muted-foreground">
                {label} equipment
              </Typography>
              <Typography
                as="span"
                className="mt-1 block break-words text-sm font-semibold leading-snug text-foreground"
              >
                {row.name || `No ${label.toLowerCase()} equipped`}
              </Typography>
              {row.rarity !== undefined && (
                <span className="mt-2 block">
                  <RarityPips value={row.rarity} />
                </span>
              )}
              {row.slots.length > 0 && (
                <span className="mt-2 block">
                  <SlotPips slots={slotSizes(row.slots)} />
                </span>
              )}
              <span className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                <Search className="size-3.5" aria-hidden="true" />
                {row.name ? "Change equipment" : "Browse equipment"}
              </span>
            </span>
          </button>
        }
      />

      {row.name && (
        <div className="min-w-0 space-y-4 p-4 sm:p-5">
          <section aria-label={`${label} skills`}>
            <Typography
              as="h3"
              className="text-sm font-semibold text-foreground"
            >
              Armor skills
            </Typography>
            {row.skills.length > 0 || row.bonuses.length > 0 ? (
              <GearSkillLine
                skills={row.skills}
                bonuses={row.bonuses}
                stacked
                className="mt-2"
              />
            ) : (
              <Typography className="mt-2 text-sm text-muted-foreground">
                No skills on this piece.
              </Typography>
            )}
          </section>

          {row.slots.length > 0 && (
            <section
              aria-label={`${label} decoration slots`}
              className="border-t border-border pt-4"
            >
              <Typography
                as="h3"
                className="mb-3 text-sm font-semibold text-foreground"
              >
                Decoration slots
              </Typography>
              <div className="grid gap-3 sm:grid-cols-3">
                {row.slots.map((slot) => {
                  const seated = slot.groups
                    .flatMap((group) => group.options)
                    .find((option) => option.id === slot.selectedId);
                  return (
                  <div key={slot.slotIndex} className="min-w-0 space-y-2">
                    <Typography
                      as="div"
                      className="flex items-center gap-2 text-base font-medium text-foreground"
                    >
                      <DecorationSlotIcon level={slot.size} jewel={seated?.jewel} size={25} decorative />
                      <span>
                        {slot.type === "armor" ? "Armor" : "Weapon"} · Lv {slot.size}
                      </span>
                    </Typography>
                    <GearPicker
                      value={slot.selectedId}
                      groups={slot.groups}
                      placeholder="Empty"
                      emptyLabel="Remove jewel"
                      searchPlaceholder="Search jewel or skill…"
                      ariaLabel={`${label} jewel slot ${slot.slotIndex + 1}`}
                      renderIcon={(option) => (
                        <DecorationSlotIcon
                          level={slot.size}
                          jewel={option?.jewel}
                          size={22}
                          decorative
                        />
                      )}
                      onChange={(decorationId) =>
                        onDecoration({ slotIndex: slot.slotIndex, decorationId })
                      }
                    />
                  </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </HunterPanel>
  );
};
