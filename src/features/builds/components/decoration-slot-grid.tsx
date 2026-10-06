import { DecorationSlotIcon } from "@/components/gear/decoration-slot-icon";
import { Typography } from "@/components/ui/typography";
import type { DecorationAssignment, EditorSlot } from "../types";
import { GearPicker } from "./gear-picker";

type DecorationSlotGridProps = {
  slots: EditorSlot[];
  /** Used in each picker's accessible name, e.g. "Head" or "Weapon". */
  label: string;
  onDecoration: (assignment: DecorationAssignment) => void;
};

/** One jewel picker per decoration slot; each only offers jewels that fit its size and type. */
export const DecorationSlotGrid = ({
  slots,
  label,
  onDecoration,
}: DecorationSlotGridProps) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {slots.map((slot) => {
      const seated = slot.groups
        .flatMap((group) => group.options)
        .find((option) => option.id === slot.selectedId);
      return (
        <div key={slot.slotIndex} className="min-w-0 space-y-2">
          <Typography
            as="div"
            className="flex items-center gap-2 text-base font-medium text-foreground"
          >
            <DecorationSlotIcon
              level={slot.size}
              jewel={seated?.jewel}
              size={25}
              decorative
            />
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
);
