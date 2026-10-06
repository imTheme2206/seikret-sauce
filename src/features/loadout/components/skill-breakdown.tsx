import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/gear/section-heading";

type SkillBreakdownProps = {
  skills: Record<string, number>;
  /** Activated set/group skills → activation count. Omitted when none activated. */
  setGroupSkills?: Record<string, number>;
  /** Names the user explicitly requested — marked with a diamond and the accent colour. */
  requestedNames: Set<string>;
};

/** Requested skills get a shape, not just a colour, so the cue survives without colour vision. */
const RequestedMark = ({ isRequested }: { isRequested: boolean }) => (
  <span className="mr-2 grid w-2 shrink-0 place-items-center" aria-hidden={!isRequested}>
    {isRequested && (
      <>
        <span className="size-1.5 rotate-45 bg-primary" />
        <span className="sr-only">Requested: </span>
      </>
    )}
  </span>
);

/** "All skills" column inside an expanded result. */
export const SkillBreakdown = ({ skills, setGroupSkills, requestedNames }: SkillBreakdownProps) => {
  return (
    <div>
      <SectionHeading>All skills</SectionHeading>
      {Object.entries(skills).map(([name, level]) => {
        const isRequested = requestedNames.has(name);
        return (
          <div
            key={name}
            className="flex items-center border-b border-border/70 py-1.5"
          >
            <RequestedMark isRequested={isRequested} />
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
          <SectionHeading>Set &amp; group skills</SectionHeading>
          {Object.entries(setGroupSkills).map(([name, count]) => {
            const isRequested = requestedNames.has(name);
            return (
              <div
                key={name}
                className="flex items-center border-b border-border/70 py-1.5"
              >
                <RequestedMark isRequested={isRequested} />
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
