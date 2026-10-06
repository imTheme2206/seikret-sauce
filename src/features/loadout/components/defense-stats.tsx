import { DecorationSlotIcon } from "@/components/gear/decoration-slot-icon";
import { SectionHeading } from "@/components/gear/section-heading";
import { DefenseIcon, ElementIcon } from "@/components/gear/stat-icons";
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
      <SectionHeading>Defense &amp; slots</SectionHeading>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div
          className="flex items-center gap-2"
          title="Base defense over the 5 body pieces — excludes talisman, augments and floor bonuses, so it won't exactly match the in-game total."
        >
          <DefenseIcon className="size-6" />
          <Typography as="span" className="text-sm font-bold tabular-nums text-foreground">
            {defense}
          </Typography>
          <Typography as="span" className="text-xs text-muted-foreground">
            Base defense
          </Typography>
        </div>

        <ul className="flex items-center gap-3" aria-label="Elemental resistances">
          {ELEMENTS.map((element) => {
            const value = elementalDefenses[element.key];
            return (
              <li
                key={element.key}
                className="flex items-center gap-1"
                title={`${element.label} resistance`}
              >
                <ElementIcon element={element} label={element.label} className="size-5" />
                <Typography
                  as="span"
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    value < 0 ? "text-destructive" : "text-foreground/80",
                  )}
                >
                  {formatResistance(value)}
                </Typography>
              </li>
            );
          })}
        </ul>

        {freeSlots.length > 0 && (
          <div className="flex items-center gap-2">
            <Typography as="span" className="text-xs text-muted-foreground">
              Free slots
            </Typography>
            <div className="flex flex-wrap gap-0.5">
              {freeSlots.map((size, i) => (
                <span key={`${size}:${i}`} title={`Open level ${size} decoration slot`}>
                  <DecorationSlotIcon level={size} size={20} />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
