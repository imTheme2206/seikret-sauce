import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { CATEGORY_CONFIG } from "../config";
import type { PoolSkill, SelectedSkill } from "../types";
import { SkillLevelBlocks, StepButton } from "./skill-level-stepper";

type SkillPoolRowProps = {
  skill: PoolSkill;
  selectedSkill?: SelectedSkill;
  /** Show the category badge (used while searching across all categories). */
  showCategory: boolean;
  onAdd: () => void;
  onLevelChange: (level: number) => void;
  onRemove: () => void;
};

/** A clickable row in the skill pool used to add a skill to the selection. */
export const SkillPoolRow = ({
  skill,
  selectedSkill,
  showCategory,
  onAdd,
  onLevelChange,
  onRemove,
}: SkillPoolRowProps) => {
  const config = CATEGORY_CONFIG[skill.category];
  const isSelected = Boolean(selectedSkill);
  const canDecrease = Boolean(selectedSkill && selectedSkill.level > 1);
  const canIncrease = Boolean(
    selectedSkill && selectedSkill.level < selectedSkill.maxLevel,
  );

  return (
    <div
      className={cn(
        "group relative flex min-h-[46px] w-full items-center gap-3 border-b border-border/70 px-4 py-2 text-left transition-colors last:border-b-0",
        isSelected
          ? "bg-primary/[0.045]"
          : "hover:bg-foreground/[0.035]",
      )}
    >
      {!isSelected && (
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add ${skill.name}`}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}

      <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden [&_img]:size-5 [&_img]:object-contain">
        <SkillGlyph
          category={skill.category}
          icon={skill.icon}
          label={skill.name}
          className="size-5"
        />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          as="span"
          className="truncate text-sm font-medium text-foreground"
        >
          {skill.name}
        </Typography>
        {showCategory && (
          <Badge
            className="w-fit rounded-none border-0 bg-transparent p-0 text-[10px] font-normal"
            style={{ color: config.color }}
          >
            {config.label}
          </Badge>
        )}
        {selectedSkill && (
          <div className="flex items-center gap-2">
            <SkillLevelBlocks
              level={selectedSkill.level}
              maxLevel={selectedSkill.maxLevel}
              color={config.color}
              onChange={onLevelChange}
            />
            <Typography
              as="span"
              className="text-[10px] tabular-nums text-muted-foreground"
            >
              {selectedSkill.level}/{selectedSkill.maxLevel}
            </Typography>
          </div>
        )}
      </div>

      {selectedSkill ? (
        <div className="relative z-20 flex shrink-0 items-center gap-1">
          <StepButton
            label="−"
            disabled={!canDecrease}
            onClick={() => onLevelChange(selectedSkill.level - 1)}
          />
          <StepButton
            label="+"
            disabled={!canIncrease}
            onClick={() => onLevelChange(selectedSkill.level + 1)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={`Remove ${skill.name}`}
            className="ml-0.5 size-6 rounded-none text-muted-foreground hover:bg-transparent hover:text-destructive"
          >
            <X className="size-3.5" strokeWidth={2} />
          </Button>
        </div>
      ) : (
        <div className="pointer-events-none relative flex shrink-0 items-center gap-2">
          <Typography
            as="span"
            className="whitespace-nowrap text-xs text-muted-foreground"
          >
            Lv {skill.maxLevel}
          </Typography>
          <div className="flex size-5 items-center justify-center text-muted-foreground transition-colors group-hover:text-primary">
            <Plus className="size-2.5" strokeWidth={2} />
          </div>
        </div>
      )}
    </div>
  );
};
