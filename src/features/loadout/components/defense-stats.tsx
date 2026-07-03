import { cn } from "@/lib/utils";
import type { ElementalDefenses } from "../types";
import { SectionHeading } from "./section-heading";

interface DefenseStatsProps {
  defense: number;
  elementalDefenses: ElementalDefenses;
  freeSlots: number[];
}

const ELEMENTS: { key: keyof ElementalDefenses; label: string; color: string }[] = [
  { key: "fire", label: "Fire", color: "hsl(8,65%,55%)" },
  { key: "water", label: "Water", color: "hsl(205,55%,55%)" },
  { key: "thunder", label: "Thndr", color: "hsl(50,75%,55%)" },
  { key: "ice", label: "Ice", color: "hsl(190,45%,60%)" },
  { key: "dragon", label: "Drgn", color: "hsl(280,40%,62%)" },
];

/** Defense / elemental-defense / slot summary shown inside an expanded result. */
export function DefenseStats({ defense, elementalDefenses, freeSlots }: DefenseStatsProps) {
  return (
    <div>
      <SectionHeading>Defense &amp; Slots</SectionHeading>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[14px] font-bold tabular-nums text-foreground"
            title="Base defense over the 5 body pieces — excludes talisman, augments and floor bonuses, so it won't exactly match the in-game total."
          >
            {defense}
          </span>
          <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            Base Def
          </span>
        </div>

        <div className="flex items-center gap-2">
          {ELEMENTS.map(({ key, label, color }) => {
            const value = elementalDefenses[key];
            return (
              <div key={key} className="flex flex-col items-center leading-none">
                <span className="text-[8px] uppercase tracking-[0.08em]" style={{ color }}>
                  {label}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    value < 0 ? "text-[hsl(8,60%,58%)]" : "text-foreground/80",
                  )}
                >
                  {value > 0 ? `+${value}` : value}
                </span>
              </div>
            );
          })}
        </div>

        {freeSlots.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              Free
            </span>
            <div className="flex gap-1">
              {freeSlots.map((size, i) => (
                <span
                  key={`${size}:${i}`}
                  className="flex size-4 items-center justify-center rounded-[3px] bg-secondary text-[9px] font-bold tabular-nums text-primary"
                  title={`Open size-${size} decoration slot`}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
