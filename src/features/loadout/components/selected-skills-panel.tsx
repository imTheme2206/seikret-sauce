import { Button } from "@/components/ui/button";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { ListPlus, Loader2, Search, X } from "lucide-react";
import { CATEGORY_CONFIG } from "../config";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";
import { SkillLevelControl } from "./skill-level-stepper";

const SEARCH_HINT_ID = "find-loadouts-hint";

export const SelectedSkillsPanel = ({
  controller: c,
}: {
  controller: LoadoutOptimizerController;
}) => (
  <aside
    aria-labelledby="selected-skills-heading"
    className="frame-corners flex min-w-0 flex-col rounded-sm border border-border bg-card"
  >
    <div className="flex min-h-14 items-center justify-between gap-2 border-b border-border px-4">
      <div className="flex items-baseline gap-2">
        <h2 id="selected-skills-heading" className="font-display text-base font-semibold tracking-wide">
          Requirements
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {c.selectedCount} selected
        </span>
      </div>
      {c.selectedCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={c.clearAll}
          disabled={c.isSearching}
        >
          Clear all
        </Button>
      )}
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto">
      {c.selectedList.length === 0 ? (
        <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
          <ListPlus className="size-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted-foreground">
            Pick skills from the list to set what this loadout must have.
          </p>
          <p className="text-xs text-muted-foreground">
            Press <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] text-foreground">/</kbd> to search skills
          </p>
        </div>
      ) : (
        <ul>
          {c.selectedList.map((skill) => (
            <li
              key={skill.name}
              className="border-b border-border/70 px-4 py-2.5 last:border-b-0"
            >
              <div className="flex items-center gap-2.5">
                <SkillGlyph
                  category={skill.category}
                  icon={skill.icon}
                  label=""
                  className="size-5 shrink-0"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {skill.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${skill.name}`}
                  title="Remove"
                  onClick={() => c.removeSkill(skill.name)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
              <SkillLevelControl
                className="mt-1.5 pl-7"
                skillName={skill.name}
                level={skill.level}
                maxLevel={skill.maxLevel}
                color={CATEGORY_CONFIG[skill.category].color}
                onChange={(level) => c.setLevel(skill.name, level)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="border-t border-border p-4">
      <Button
        type="button"
        size="lg"
        className="h-11 w-full font-semibold"
        onClick={c.runSearch}
        disabled={c.selectedCount === 0 || c.isSearching}
        aria-describedby={c.selectedCount === 0 ? SEARCH_HINT_ID : undefined}
      >
        {c.isSearching ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Search className="size-4" />
        )}
        {c.isSearching ? "Finding loadouts…" : "Find loadouts"}
      </Button>
      {c.selectedCount === 0 && (
        <p id={SEARCH_HINT_ID} className="mt-2 text-center text-xs text-muted-foreground">
          Add at least one skill to search.
        </p>
      )}
    </div>
  </aside>
);
