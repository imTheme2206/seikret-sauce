import { Typography } from "@/components/ui/typography";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { ShieldHalf, Sparkles, Swords } from "lucide-react";
import type { HunterStatus } from "../hunter-status";
import { PanelHeading } from "./panel-heading";

/** Regular and activated Set/Group Skill bars shared by every Build surface. */
export const HunterSkills = ({ status }: { status: HunterStatus }) => {
  const skillsByLevel = [...status.skills].sort(
    (left, right) =>
      right.level - left.level || left.name.localeCompare(right.name),
  );

  return (
    <>
      <div>
        <PanelHeading icon={Sparkles}>Active skills</PanelHeading>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {skillsByLevel.map((skill) => (
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
    </>
  );
};
