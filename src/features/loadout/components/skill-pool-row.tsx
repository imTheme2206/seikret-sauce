import { Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "../config";
import { TypeIcon } from "../icons";
import type { PoolSkill } from "../types";

interface SkillPoolRowProps {
  skill: PoolSkill;
  isSelected: boolean;
  /** Show the category badge (used while searching across all categories). */
  showCategory: boolean;
  onAdd: () => void;
}

/** A clickable row in the skill pool used to add a skill to the selection. */
export function SkillPoolRow({
  skill,
  isSelected,
  showCategory,
  onAdd,
}: SkillPoolRowProps) {
  const config = CATEGORY_CONFIG[skill.category];

  return (
    <button
      type="button"
      onClick={onAdd}
      className="relative flex min-h-[46px] w-full items-center gap-2.5 border-b border-border px-3 py-2 text-left transition-colors hover:bg-secondary/40"
    >
      {isSelected && (
        <div className="pointer-events-none absolute inset-0 bg-[hsl(36,25%,9%)]" />
      )}

      <div className="relative flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary">
        <TypeIcon
          category={skill.category}
          color={config.color}
          icon={skill.icon}
        />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-[13px]",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {skill.name}
        </span>
        {showCategory && (
          <Badge
            className="rounded-[3px] border-transparent px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.08em]"
            style={{ color: config.color, background: config.badgeBg }}
          >
            {config.label}
          </Badge>
        )}
      </div>

      <span className="relative shrink-0 whitespace-nowrap text-[10px] text-muted-foreground">
        Lv {skill.maxLevel}
      </span>

      {isSelected ? (
        <div className="relative flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-primary">
          <Check
            className="size-2.5 text-primary-foreground"
            strokeWidth={2.5}
          />
        </div>
      ) : (
        <div className="relative flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-border text-muted-foreground">
          <Plus className="size-2.5" strokeWidth={2} />
        </div>
      )}
    </button>
  );
}
