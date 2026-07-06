import { Typography } from "@/components/ui/typography";
import { SectionHeading } from "./section-heading";

interface DecorationListProps {
  decorations: string[];
}

/** "Decorations" column inside an expanded result. */
export function DecorationList({ decorations }: DecorationListProps) {
  return (
    <div>
      <SectionHeading>Decorations</SectionHeading>
      {decorations.map((deco, i) => (
        <div key={`${deco}:${i}`} className="flex items-start gap-1.5 py-[3px]">
          <div className="mt-[5px] size-1 shrink-0 rounded-[1px] bg-[hsl(195,40%,40%)]" />
          <Typography
            as="span"
            className="text-xs leading-normal text-foreground/[0.78]"
          >
            {deco}
          </Typography>
        </div>
      ))}
    </div>
  );
}
