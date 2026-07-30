import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface GearSkillLineProps {
  skills: { name: string; level: number }[];
  bonuses: { name: string }[];
  className?: string;
}

/** The one-line "what this piece gives you" summary under a gear name. */
export function GearSkillLine({ skills, bonuses, className }: GearSkillLineProps) {
  if (!skills.length && !bonuses.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-1", className)}>
      {skills.map((skill) => (
        <Typography
          as="span"
          key={skill.name}
          className="text-[11px] text-muted-foreground"
        >
          <span className="text-foreground">{skill.name}</span> Lv {skill.level}
        </Typography>
      ))}
      {bonuses.map((bonus) => (
        <Typography as="span" key={bonus.name} className="text-[11px] text-primary">
          {bonus.name}
        </Typography>
      ))}
    </div>
  );
}
