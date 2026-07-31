import { Typography } from "@/components/ui/typography";
import { ELEMENTS, formatResistance } from "@/lib/mh-wilds";
import { Diamond, Shield, ShieldHalf, Sparkles, Swords } from "lucide-react";
import { calculateBuild } from "../calculator";
import { ELEMENT_ICONS } from "../config";
import type { BuildSnapshot } from "../types";
import { PanelHeading } from "./panel-heading";

/**
 * Live totals for a snapshot: defense, resistances, capped skills and any
 * activated set/group bonuses. Uses the same element colours as the optimizer's
 * result panel so identical numbers look identical in both places.
 */
export function BuildStats({
  snapshot,
  skillIcons = {},
}: {
  snapshot: BuildSnapshot;
  skillIcons?: Record<string, string | null>;
}) {
  const totals = calculateBuild(snapshot);
  const skills = Object.entries(totals.skills);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 border border-border bg-background/45 sm:grid-cols-[1.3fr_repeat(5,1fr)]">
        <div className="col-span-5 flex items-center gap-3 border-b border-border p-3 sm:col-span-1 sm:border-r sm:border-b-0">
          <Shield className="size-5 text-primary" />
          <div>
            <Typography
              as="div"
              className="text-[9px] uppercase tracking-[.2em] text-muted-foreground"
            >
              Defense
            </Typography>
            <Typography
              as="div"
              className="text-xl font-semibold tabular-nums text-foreground"
            >
              {totals.defense}
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
                className="flex items-center gap-1 text-[9px] font-bold tracking-widest"
                style={{ color }}
              >
                <ElementIcon className="size-3" style={{ color }} />
                {abbr}
              </Typography>
              <Typography as="span" className="text-base tabular-nums">
                {formatResistance(totals.resistances[key])}
              </Typography>
            </div>
          );
        })}
      </div>

      <div>
        <PanelHeading icon={Sparkles}>Active skills</PanelHeading>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {skills.map(([name, level]) => (
            <div
              key={name}
              className="flex items-center justify-between border-l-2 border-primary/50 bg-secondary/55 px-3 py-2"
            >
              <Typography as="span" className="flex items-center gap-2 text-sm">
                {skillIcons[name] ? (
                  <img
                    src={`/images/icons/${skillIcons[name]}.png`}
                    alt={name}
                    className="size-4 shrink-0 object-contain"
                  />
                ) : (
                  <Diamond className="size-3 shrink-0 text-primary/60" />
                )}
                {name}
              </Typography>
              <Typography
                as="span"
                className="text-sm font-bold tabular-nums text-primary"
              >
                Lv {level}
              </Typography>
            </div>
          ))}
          {!skills.length && (
            <Typography
              as="div"
              className="col-span-2 flex flex-col items-center gap-2 py-5 text-center text-sm text-muted-foreground"
            >
              <ShieldHalf className="size-5 text-primary/50" />
              Equip gear to reveal its skills.
            </Typography>
          )}
        </div>
      </div>

      {totals.activeBonuses.length > 0 && (
        <div>
          <PanelHeading icon={Swords}>Active Set / Group Skills</PanelHeading>
          <div className="space-y-1.5">
            {totals.activeBonuses.map((bonus) => (
              <div
                key={bonus.name}
                className="flex items-center justify-between border border-primary/20 bg-primary/[.06] px-3 py-2"
              >
                <div>
                  <Typography as="div" className="text-sm font-medium">
                    {bonus.name}
                  </Typography>
                  <Typography
                    as="div"
                    className="text-[11px] text-muted-foreground"
                  >
                    {bonus.pieces}/{bonus.piecesRequired} pieces · {bonus.kind}
                  </Typography>
                </div>
                <Typography
                  as="div"
                  className="text-right text-xs font-semibold text-primary"
                >
                  {bonus.effectName} Lv {bonus.level}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
