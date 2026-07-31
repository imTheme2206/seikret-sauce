import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { X } from "lucide-react";
import { CATEGORY_CONFIG } from "../config";
import type { SelectedSkill } from "../types";
import { SkillLevelBlocks, StepButton } from "./skill-level-stepper";

type SelectedSkillRowProps = {
  skill: SelectedSkill;
  onLevelChange: (level: number) => void;
  onRemove: () => void;
};

/** One row in the "Selected Skills" panel. */
export const SelectedSkillRow = ({
  skill,
  onLevelChange,
  onRemove,
}: SelectedSkillRowProps) => {
  const { color } = CATEGORY_CONFIG[skill.category];
  const canDecrease = skill.level > 1;
  const canIncrease = skill.level < skill.maxLevel;

  return (
    <div className="group relative flex items-center gap-[9px] rounded-md border border-border bg-card px-3 py-2 transition-colors hover:border-primary/40">
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={`Remove ${skill.name}`}
        className="absolute left-0 right-1 top-1 z-10 size-[18px] rounded-[4px] text-[hsl(0,50%,48%)] opacity-0 transition-opacity hover:bg-secondary hover:text-[hsl(0,50%,48%)] group-hover:opacity-100 dark:hover:bg-secondary"
      >
        <X className="size-3" strokeWidth={2} />
      </Button>

      <StepButton
        label="−"
        disabled={!canDecrease}
        onClick={() => onLevelChange(skill.level - 1)}
      />

      <div className="flex size-[30px] shrink-0 items-center justify-center rounded-md bg-secondary">
        <SkillGlyph
          category={skill.category}
          icon={skill.icon}
          label={skill.name}
          className="size-3.5"
        />
      </div>
      <div className="min-w-0 flex-1">
        <Typography
          as="div"
          className="mb-[5px] truncate text-xs font-medium text-foreground"
        >
          {skill.name}
        </Typography>
        <SkillLevelBlocks
          level={skill.level}
          maxLevel={skill.maxLevel}
          color={color}
          onChange={onLevelChange}
        />
      </div>

      <StepButton
        label="+"
        disabled={!canIncrease}
        onClick={() => onLevelChange(skill.level + 1)}
      />
    </div>
  );
};
