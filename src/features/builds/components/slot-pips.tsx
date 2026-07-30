import { Typography } from "@/components/ui/typography";

/** A piece's decoration slots as rotated level badges. */
export function SlotPips({ slots }: { slots: number[] }) {
  if (!slots.length) {
    return (
      <Typography as="span" className="text-xs text-muted-foreground">
        No slots
      </Typography>
    );
  }

  return (
    <span className="flex gap-1">
      {slots.map((slot, index) => (
        <span
          key={`${slot}-${index}`}
          className="grid size-5 rotate-45 place-items-center border border-primary/45 bg-primary/10"
          title={`Level ${slot} slot`}
        >
          <Typography
            as="span"
            className="-rotate-45 text-[10px] font-bold text-primary"
          >
            {slot}
          </Typography>
        </span>
      ))}
    </span>
  );
}
