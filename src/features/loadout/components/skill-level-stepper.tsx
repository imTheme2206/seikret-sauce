import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SkillLevelBlocksProps = {
  level: number;
  maxLevel: number;
  color: string;
  onChange: (level: number) => void;
};

/**
 * The clickable level blocks for one skill.
 * The decrement/increment controls live in {@link StepButton} so callers can
 * position them independently (e.g. flanking the row).
 */
export const SkillLevelBlocks = ({
  level,
  maxLevel,
  color,
  onChange,
}: SkillLevelBlocksProps) => {
  const interactive = maxLevel > 1;

  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: maxLevel }, (_, i) => {
        const filled = i < level;
        return (
          <button
            key={i}
            type="button"
            title={`Set to ${i + 1}`}
            disabled={!interactive}
            onClick={() => onChange(i + 1)}
            className={cn(
              "h-[7px] shrink-0 rounded-[2px] transition-colors",
              maxLevel > 5 ? "w-[9px]" : "w-[11px]",
              interactive ? "cursor-pointer" : "cursor-default",
            )}
            style={{ background: filled ? color : "hsl(30,10%,18%)" }}
          />
        );
      })}
    </div>
  );
};

export const StepButton = ({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "size-6 shrink-0 rounded-none border border-border bg-transparent text-sm leading-none shadow-none transition-colors hover:border-primary/50 hover:bg-transparent",
        disabled
          ? "cursor-default text-muted-foreground disabled:opacity-30"
          : "cursor-pointer text-foreground",
      )}
    >
      {label}
    </Button>
  );
};
