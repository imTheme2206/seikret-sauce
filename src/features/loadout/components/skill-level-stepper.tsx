import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

type SkillLevelBlocksProps = {
  /** Skill name, used to give each block an accessible name. */
  skillName: string;
  level: number;
  maxLevel: number;
  color: string;
  onChange: (level: number) => void;
};

/**
 * The clickable level blocks for one skill — the in-game skill gauge.
 * Each bar is thin, but its button spans a 24px-tall hit area.
 * The decrement/increment controls live in {@link StepButton} so callers can
 * position them independently (e.g. flanking the row).
 */
export const SkillLevelBlocks = ({
  skillName,
  level,
  maxLevel,
  color,
  onChange,
}: SkillLevelBlocksProps) => {
  const interactive = maxLevel > 1;

  return (
    <div className="flex items-center" role="group" aria-label={`${skillName} level`}>
      {Array.from({ length: maxLevel }, (_, i) => {
        const filled = i < level;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Set ${skillName} to level ${i + 1}`}
            aria-pressed={i + 1 === level}
            disabled={!interactive}
            onClick={() => onChange(i + 1)}
            className={cn(
              "group/block flex h-6 shrink-0 items-center px-[1.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring",
              interactive ? "cursor-pointer" : "cursor-default",
            )}
          >
            <span
              className={cn(
                "h-2 rounded-[1px] transition-colors",
                maxLevel > 5 ? "w-[9px]" : "w-3",
                !filled && "bg-level-empty",
                interactive && !filled && "group-hover/block:bg-muted-foreground/50",
              )}
              style={filled ? { background: color } : undefined}
            />
          </button>
        );
      })}
    </div>
  );
};

type StepButtonProps = {
  direction: "decrease" | "increase";
  skillName: string;
  disabled: boolean;
  onClick: () => void;
};

export const StepButton = ({
  direction,
  skillName,
  disabled,
  onClick,
}: StepButtonProps) => {
  const Icon = direction === "decrease" ? Minus : Plus;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-xs"
      disabled={disabled}
      onClick={onClick}
      aria-label={`${direction === "decrease" ? "Decrease" : "Increase"} ${skillName} level`}
      className="rounded-sm bg-transparent shadow-none hover:border-primary/60 disabled:opacity-30 dark:bg-transparent"
    >
      <Icon className="size-3" strokeWidth={2.25} />
    </Button>
  );
};

type SkillLevelControlProps = {
  skillName: string;
  level: number;
  maxLevel: number;
  color: string;
  onChange: (level: number) => void;
  className?: string;
};

/** − gauge + with a numeric readout: the full level editor for one selected skill. */
export const SkillLevelControl = ({
  skillName,
  level,
  maxLevel,
  color,
  onChange,
  className,
}: SkillLevelControlProps) => (
  <div className={cn("flex items-center gap-1.5", className)}>
    <StepButton
      direction="decrease"
      skillName={skillName}
      disabled={level <= 1}
      onClick={() => onChange(level - 1)}
    />
    <SkillLevelBlocks
      skillName={skillName}
      level={level}
      maxLevel={maxLevel}
      color={color}
      onChange={onChange}
    />
    <StepButton
      direction="increase"
      skillName={skillName}
      disabled={level >= maxLevel}
      onClick={() => onChange(level + 1)}
    />
    <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
      {level}/{maxLevel}
    </span>
  </div>
);
