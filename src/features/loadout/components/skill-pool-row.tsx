import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { CATEGORY_CONFIG } from "../config";
import type { PoolSkill, SelectedSkill } from "../types";
import { SkillLevelControl } from "./skill-level-stepper";

type SkillPoolRowProps = {
  skill: PoolSkill;
  selectedSkill?: SelectedSkill;
  /** Show the category badge (used while searching across all categories). */
  showCategory: boolean;
  onAdd: () => void;
  onLevelChange: (level: number) => void;
  onRemove: () => void;
};

/** A row in the skill pool: click to add, then tune the level in place. */
export const SkillPoolRow = ({
  skill,
  selectedSkill,
  showCategory,
  onAdd,
  onLevelChange,
  onRemove,
}: SkillPoolRowProps) => {
  const config = CATEGORY_CONFIG[skill.category];

  return (
    <div
      className={cn(
        "group relative flex min-h-12 w-full flex-wrap items-center gap-x-3 gap-y-1 border-b border-l-2 border-b-border/70 px-4 py-1.5 text-left transition-colors last:border-b-0",
        selectedSkill
          ? "border-l-primary bg-primary/[0.06]"
          : "border-l-transparent hover:bg-accent/60",
      )}
    >
      {!selectedSkill && (
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add ${skill.name}, max level ${skill.maxLevel}`}
          className="absolute inset-0 z-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        />
      )}

      <div className="flex size-8 shrink-0 items-center justify-center [&_img]:size-6 [&_img]:object-contain">
        <SkillGlyph
          category={skill.category}
          icon={skill.icon}
          label=""
          className="size-6"
        />
      </div>

      {/* A selected row's level control drops to a second line before the name gets too narrow. */}
      <div className={cn("flex min-w-0 flex-1 flex-col", selectedSkill && "min-w-28 basis-28")}>
        <Typography as="span" className="truncate text-sm font-medium text-foreground">
          {skill.name}
        </Typography>
        {showCategory && (
          <Badge
            className="w-fit rounded-none border-0 bg-transparent p-0 text-[11px] font-normal"
            style={{ color: config.color }}
          >
            {config.label} skill
          </Badge>
        )}
      </div>

      {selectedSkill ? (
        <div className="relative z-20 ml-auto flex shrink-0 items-center gap-2">
          <SkillLevelControl
            skillName={skill.name}
            level={selectedSkill.level}
            maxLevel={selectedSkill.maxLevel}
            color={config.color}
            onChange={onLevelChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onRemove}
            aria-label={`Remove ${skill.name}`}
            title="Remove"
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div className="pointer-events-none flex shrink-0 items-center gap-3">
          <Typography as="span" className="text-xs tabular-nums text-muted-foreground">
            Max Lv {skill.maxLevel}
          </Typography>
          <span className="grid size-6 place-items-center rounded-sm border border-border text-muted-foreground transition-colors group-hover:border-primary/60 group-hover:text-primary">
            <Plus className="size-3.5" strokeWidth={2.25} />
          </span>
        </div>
      )}
    </div>
  );
};
