import { Button } from "@/components/ui/button";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { Loader2, Search, X } from "lucide-react";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";

export const SelectedSkillsPanel = ({
  controller: c,
}: {
  controller: LoadoutOptimizerController;
}) => (
  <aside aria-label="Selected skills" className="flex min-w-0 flex-col">
    <div className="mb-4 flex items-baseline justify-between gap-2">
      <h2 className="text-lg font-semibold">Selected skills</h2>
      {c.isSearching ? (
        <span
          role="status"
          className="flex items-center gap-1.5 text-sm text-primary"
        >
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Searching…
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">
          {c.selectedCount} selected
        </span>
      )}
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border bg-card/30">
      {c.selectedList.length === 0 ? (
        <p className="px-4 py-5 text-sm leading-6 text-muted-foreground">
          Choose skills from the list to set your requirements.
        </p>
      ) : (
        c.selectedList.map((skill) => (
          <div
            key={skill.name}
            className="flex min-h-12 items-center gap-3 border-b border-border/70 px-3 last:border-b-0"
          >
            <SkillGlyph
              category={skill.category}
              icon={skill.icon}
              label={skill.name}
              className="size-5 shrink-0"
            />
            <span className="min-w-0 flex-1 truncate text-sm">
              {skill.name}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              Lv {skill.level}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${skill.name}`}
              onClick={() => c.removeSkill(skill.name)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))
      )}
    </div>
    <Button
      type="button"
      size="lg"
      className="mt-5 h-11 w-full"
      onClick={c.runSearch}
      disabled={c.selectedCount === 0 || c.isSearching}
    >
      {c.isSearching ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Search className="size-4" />
      )}
      {c.isSearching ? "Finding loadouts…" : "Find loadouts"}
    </Button>
  </aside>
);
