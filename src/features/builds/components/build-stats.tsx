import { Typography } from "@/components/ui/typography";
import { ELEMENTS, formatResistance } from "@/lib/mh-wilds";
import { Shield } from "lucide-react";
import { ELEMENT_ICONS } from "../config";
import type { HunterStatus } from "../hunter-status";
import { HunterSkills } from "./hunter-skills";

/**
 * Renders the shared Hunter Status model: defense, resistances, capped skills
 * and activated Set/Group Skills.
 */
export const BuildStats = ({
  status,
}: {
  status: HunterStatus;
}) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 border border-border bg-background/45 sm:grid-cols-[1.3fr_repeat(5,1fr)]">
        <div className="col-span-5 flex items-center gap-3 border-b border-border p-3 sm:col-span-1 sm:border-r sm:border-b-0">
          <Shield className="size-5 text-primary" />
          <div>
            <Typography
              as="div"
              className="text-[11px] uppercase tracking-[.2em] text-muted-foreground"
            >
              Defense
            </Typography>
            <Typography
              as="div"
              className="text-xl font-semibold tabular-nums text-foreground"
            >
              {status.defense}
            </Typography>
          </div>
        </div>
        {ELEMENTS.map(({ key, label, abbr, color }) => {
          const ElementIcon = ELEMENT_ICONS[key];
          return (
            <div
              key={key}
              className="grid place-items-center gap-0.5 border-r border-border p-2 last:border-r-0"
              title={`${label} resistance`}
            >
              <Typography
                as="span"
                className="flex items-center gap-1 text-[11px] font-bold tracking-widest"
                style={{ color }}
              >
                <ElementIcon className="size-3" style={{ color }} />
                {abbr}
              </Typography>
              <Typography as="span" className="text-base tabular-nums">
                {formatResistance(status.resistances[key])}
              </Typography>
            </div>
          );
        })}
      </div>

      <HunterSkills status={status} />
    </div>
  );
};
