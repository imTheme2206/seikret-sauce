import { Typography } from "@/components/ui/typography";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { ELEMENTS, formatResistance } from "@/lib/mh-wilds";
import { Shield, ShieldHalf, Sparkles, Swords } from "lucide-react";
import { ELEMENT_ICONS } from "../config";
import type { HunterStatus } from "../hunter-status";
import { PanelHeading } from "./panel-heading";

/**
 * Renders the shared Hunter Status model: defense, resistances, capped skills
 * and activated Set/Group Skills.
 */
export function BuildStats({
  status,
}: {
  status: HunterStatus;
}) {
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
                className="flex items-center gap-1 text-[9px] font-bold tracking-widest"
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

      <div>
        <PanelHeading icon={Sparkles}>Active skills</PanelHeading>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {status.skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center justify-between border-l-2 border-primary/50 bg-secondary/55 px-3 py-2"
            >
              <Typography as="span" className="flex items-center gap-2 text-sm">
                <SkillGlyph
                  icon={skill.icon}
                  category={skill.category}
                  label={skill.name}
                  className="size-4"
                />
                {skill.name}
              </Typography>
              <Typography
                as="span"
                className="text-sm font-bold tabular-nums text-primary"
              >
                Lv {skill.level}
              </Typography>
            </div>
          ))}
          {!status.skills.length && (
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

      {status.activeBonuses.length > 0 && (
        <div>
          <PanelHeading icon={Swords}>Active Set / Group Skills</PanelHeading>
          <div className="space-y-1.5">
            {status.activeBonuses.map((bonus) => (
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
