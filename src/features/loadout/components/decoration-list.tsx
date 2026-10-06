import { DecorationSlotIcon } from "@/components/gear/decoration-slot-icon";
import { SectionHeading } from "@/components/gear/section-heading";
import { Typography } from "@/components/ui/typography";
import { decorationColor } from "@/lib/decoration-sprite";

type DecorationListProps = {
  decorations: string[];
};

/** API decoration names end with their size, e.g. "Adapt Jewel 1". */
const jewelLevel = (name: string) => Number(/(\d)$/.exec(name)?.[1] ?? 1);

/** "Decorations" column inside an expanded result: each jewel in its in-game colour, duplicates counted. */
export const DecorationList = ({ decorations }: DecorationListProps) => {
  const counts = new Map<string, number>();
  for (const name of decorations) counts.set(name, (counts.get(name) ?? 0) + 1);

  return (
    <div>
      <SectionHeading>Decorations</SectionHeading>
      {counts.size === 0 ? (
        <Typography className="text-xs text-muted-foreground">No decorations needed.</Typography>
      ) : (
        <ul className="space-y-1">
          {[...counts].map(([name, count]) => {
            const level = jewelLevel(name);
            return (
              <li key={name} className="flex items-center gap-2">
                <DecorationSlotIcon
                  level={level}
                  jewel={{ level, color: decorationColor(name) }}
                  size={20}
                  decorative
                />
                <Typography as="span" className="min-w-0 flex-1 truncate text-xs text-foreground/85">
                  {name}
                </Typography>
                {count > 1 && (
                  <Typography as="span" className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    ×{count}
                  </Typography>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
