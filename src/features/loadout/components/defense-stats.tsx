import { SectionHeading } from "@/components/gear/section-heading";
import { Typography } from "@/components/ui/typography";
import {
  ELEMENTS,
  formatResistance,
  type ElementalDefenses,
} from "@/lib/mh-wilds";
import { cn } from "@/lib/utils";

type DefenseStatsProps = {
  defense: number;
  elementalDefenses: ElementalDefenses;
  freeSlots: number[];
};

/** Defense / elemental-defense / slot summary shown inside an expanded result. */
export const DefenseStats = ({ defense, elementalDefenses, freeSlots }: DefenseStatsProps) => {
  return (
    <div>
      <SectionHeading>Defense &amp; Slots</SectionHeading>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-1.5">
          <Typography
            as="span"
            className="text-sm font-bold tabular-nums text-foreground"
            title="Base defense over the 5 body pieces — excludes talisman, augments and floor bonuses, so it won't exactly match the in-game total."
          >
            {defense}
          </Typography>
          <Typography
            as="span"
            className="text-xs uppercase tracking-[0.1em] text-muted-foreground"
          >
            Base Def
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {ELEMENTS.map(({ key, label, abbr, color }) => {
            const value = elementalDefenses[key];
            return (
              <div key={key} className="flex flex-col items-center leading-none">
                <Typography
                  as="span"
                  className="text-xs uppercase tracking-[0.08em]"
                  style={{ color }}
                  title={`${label} resistance`}
                >
                  {abbr}
                </Typography>
                <Typography
                  as="span"
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    value < 0 ? "text-[hsl(8,60%,58%)]" : "text-foreground/80",
                  )}
                >
                  {formatResistance(value)}
                </Typography>
              </div>
            );
          })}
        </div>

        {freeSlots.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Typography
              as="span"
              className="text-xs uppercase tracking-[0.1em] text-muted-foreground"
            >
              Free
            </Typography>
            <div className="flex gap-1">
              {freeSlots.map((size, i) => (
                <Typography
                  as="span"
                  key={`${size}:${i}`}
                  className="flex size-4 items-center justify-center rounded-[3px] bg-secondary text-xs font-bold tabular-nums text-primary"
                  title={`Open size-${size} decoration slot`}
                >
                  {size}
                </Typography>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
