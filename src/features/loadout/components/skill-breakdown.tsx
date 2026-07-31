import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/gear/section-heading";

type SkillBreakdownProps = {
  skills: Record<string, number>;
  /** Activated set/group skills → activation count. Omitted when none activated. */
  setGroupSkills?: Record<string, number>;
  /** Names the user explicitly requested — highlighted in the accent colour. */
  requestedNames: Set<string>;
};

/** "All Skills" column inside an expanded result. */
export const SkillBreakdown = ({ skills, setGroupSkills, requestedNames }: SkillBreakdownProps) => {
  return (
    <div>
      <SectionHeading>All Skills</SectionHeading>
      {Object.entries(skills).map(([name, level]) => {
        const isRequested = requestedNames.has(name);
        return (
          <div
            key={name}
            className="flex items-center border-b border-[hsl(30,10%,11%)] py-[3px]"
          >
            <Typography
              as="span"
              className={cn(
                "min-w-0 flex-1 truncate text-xs",
                isRequested ? "text-primary" : "text-foreground/75",
              )}
            >
              {name}
            </Typography>
            <Typography
              as="span"
              className={cn(
                "ml-1.5 shrink-0 text-xs font-bold tabular-nums",
                isRequested ? "text-primary" : "text-muted-foreground",
              )}
            >
              {level}
            </Typography>
          </div>
        );
      })}

      {setGroupSkills && Object.keys(setGroupSkills).length > 0 && (
        <div className="mt-2">
          <SectionHeading>Set &amp; Group</SectionHeading>
          {Object.entries(setGroupSkills).map(([name, count]) => {
            const isRequested = requestedNames.has(name);
            return (
              <div
                key={name}
                className="flex items-center border-b border-[hsl(30,10%,11%)] py-[3px]"
              >
                <Typography
                  as="span"
                  className={cn(
                    "min-w-0 flex-1 truncate text-xs",
                    isRequested ? "text-primary" : "text-foreground/75",
                  )}
                >
                  {name}
                </Typography>
                <Typography
                  as="span"
                  className="ml-1.5 shrink-0 text-xs tabular-nums text-muted-foreground"
                >
                  ×{count}
                </Typography>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
