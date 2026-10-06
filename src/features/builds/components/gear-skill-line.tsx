import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type GearSkillLineProps = {
  skills: { name: string; level: number }[];
  bonuses: { name: string }[];
  className?: string;
  stacked?: boolean;
};

/** Shared skill and bonus summary, stacked in the item search dialog. */
export const GearSkillLine = ({
  skills,
  bonuses,
  className,
  stacked = false,
}: GearSkillLineProps) => {
  if (!skills.length && !bonuses.length) return null;

  return (
    <div
      className={cn(
        "flex gap-y-1",
        stacked ? "flex-col" : "flex-wrap gap-x-4",
        className,
      )}
    >
      {skills.map((skill) => (
        <Typography
          as="span"
          key={skill.name}
          className={cn(
            "text-muted-foreground",
            stacked ? "text-base leading-relaxed" : "text-[11px]",
          )}
        >
          <span className="text-foreground">{skill.name}</span> Lv {skill.level}
        </Typography>
      ))}
      {bonuses.map((bonus) => (
        <Typography
          as="span"
          key={bonus.name}
          className={cn(
            "text-primary",
            stacked ? "text-base leading-relaxed" : "text-[11px]",
          )}
        >
          {bonus.name}
        </Typography>
      ))}
    </div>
  );
};
