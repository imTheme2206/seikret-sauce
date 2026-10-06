import { Typography } from "@/components/ui/typography";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { useSkillCatalog } from "@/features/skills/skill-catalog";
import { cn } from "@/lib/utils";

type GearSkillLineProps = {
  skills: { name: string; level: number }[];
  bonuses: { name: string; kind?: "set" | "group" }[];
  className?: string;
  stacked?: boolean;
};

/**
 * Shared skill and bonus summary — each line led by its in-game skill icon,
 * with Set/Group bonuses marked by their own glyph. Stacked in the item
 * search dialog and the editor rows.
 */
export const GearSkillLine = ({
  skills,
  bonuses,
  className,
  stacked = false,
}: GearSkillLineProps) => {
  const { catalog } = useSkillCatalog();
  if (!skills.length && !bonuses.length) return null;

  const textSize = stacked ? "text-sm leading-relaxed" : "text-[11px]";
  const iconSize = stacked ? "size-5" : "size-3.5";

  return (
    <div
      className={cn(
        "flex gap-y-1",
        stacked ? "flex-col" : "flex-wrap gap-x-4",
        className,
      )}
    >
      {skills.map((skill) => {
        const entry = catalog?.byName.get(skill.name);
        return (
          <Typography
            as="span"
            key={skill.name}
            className={cn("flex items-center gap-1.5 text-muted-foreground", textSize)}
          >
            <SkillGlyph
              category={entry?.category ?? "armor"}
              icon={entry?.icon ?? null}
              label=""
              className={iconSize}
            />
            <span className="text-foreground">{skill.name}</span>
            <span className="tabular-nums">Lv {skill.level}</span>
          </Typography>
        );
      })}
      {bonuses.map((bonus) => {
        const entry = catalog?.byName.get(bonus.name);
        const kind = bonus.kind ?? (entry?.isGroupSkill ? "group" : "set");
        return (
          <Typography
            as="span"
            key={bonus.name}
            className={cn("flex items-center gap-1.5 text-primary", textSize)}
          >
            <SkillGlyph
              category={kind}
              icon={entry?.icon ?? null}
              label=""
              className={iconSize}
            />
            {bonus.name}
            <span className="rounded-sm border border-primary/30 px-1 text-[10px] font-medium uppercase tracking-wide">
              {kind === "group" ? "Group" : "Set"}
            </span>
          </Typography>
        );
      })}
    </div>
  );
};
