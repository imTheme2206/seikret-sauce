import { DecorationSlotIcon } from "@/components/gear/decoration-slot-icon";
import { Typography } from "@/components/ui/typography";

/** A piece's decoration slots using the existing level artwork. */
export const SlotPips = ({ slots }: { slots: number[] }) => {
  if (!slots.length) {
    return (
      <Typography as="span" className="text-xs text-muted-foreground">
        No slots
      </Typography>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      {slots.map((slot, index) => (
        <span key={`${slot}-${index}`} title={`Level ${slot} slot`}>
          <DecorationSlotIcon level={slot} size={24} />
        </span>
      ))}
    </span>
  );
};
