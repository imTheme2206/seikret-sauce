import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import type { MonsterWeakness } from "../types";
import { weaknessSpecialEffect, WeaknessIcon } from "./monster-type-icon";

type WeaknessListProps = {
  weaknesses: MonsterWeakness[];
};

const GROUPS: { kind: MonsterWeakness["kind"]; label: string }[] = [
  { kind: "element", label: "Elements" },
  { kind: "status", label: "Status" },
  { kind: "effect", label: "Effects" },
];

const titleCase = (value: string): string =>
  value.replace(/^./, (first) => first.toUpperCase());

/** A monster's weaknesses grouped by kind, with the level of each and any condition noted. */
export const WeaknessList = ({ weaknesses }: WeaknessListProps) => {
  if (weaknesses.length === 0) {
    return (
      <Typography className="text-sm text-muted-foreground">
        No recorded weaknesses.
      </Typography>
    );
  }

  const conditional = weaknesses.filter((weakness) => weakness.condition);

  return (
    <div className="flex flex-col gap-3">
      {GROUPS.map(({ kind, label }) => {
        const items = weaknesses
          .filter((weakness) => weakness.kind === kind)
          .sort((a, b) => b.level - a.level);
        if (items.length === 0) return null;
        return (
          <div key={kind} className="flex flex-wrap items-center gap-2">
            <Typography
              as="span"
              className="w-16 text-xs font-medium text-muted-foreground"
            >
              {label}
            </Typography>
            {items.map((weakness) => {
              const specialEffect = weaknessSpecialEffect(weakness.name);
              return (
                <Badge
                  key={`${weakness.kind}-${weakness.name}`}
                  variant="outline"
                  aria-label={`${titleCase(weakness.name)}, weakness level ${weakness.level}${weakness.condition ? ` (${weakness.condition})` : ""}`}
                  style={
                    specialEffect
                      ? {
                          color: specialEffect.color,
                          borderColor: specialEffect.color,
                        }
                      : undefined
                  }
                  className="gap-1.5"
                >
                  <WeaknessIcon weakness={weakness} className="size-3.5 shrink-0" />
                  <span>{titleCase(weakness.name)}</span>
                  <Typography as="span" className="opacity-70">
                    {"+".repeat(Math.max(1, weakness.level))}
                    {weakness.condition ? "*" : ""}
                  </Typography>
                </Badge>
              );
            })}
          </div>
        );
      })}
      {conditional.map((weakness) => (
        <Typography
          key={`note-${weakness.kind}-${weakness.name}`}
          className="text-xs text-muted-foreground"
        >
          * {titleCase(weakness.name)}: {weakness.condition}
        </Typography>
      ))}
    </div>
  );
};
