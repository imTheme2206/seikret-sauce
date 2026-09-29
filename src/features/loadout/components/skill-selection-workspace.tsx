import { Button } from "@/components/ui/button";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";
import { SelectedSkillsPanel } from "./selected-skills-panel";
import { SkillPool } from "./skill-pool";
import { SkillSearchBar } from "./skill-search-bar";

export const SkillSelectionWorkspace = ({
  controller: c,
}: {
  controller: LoadoutOptimizerController;
}) => (
  <section
    aria-labelledby="skill-selection-heading"
    className="mb-6 grid gap-8 lg:h-[calc(100dvh-14rem)] lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_310px]"
  >
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            id="skill-selection-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Select skills
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the skills and levels your loadout needs.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SkillSearchBar value={c.searchQuery} onChange={c.setSearchQuery} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-card/30">
        <SkillPool
          pool={c.pool}
          activeTab={c.activeTab}
          onTabChange={c.setActiveTab}
          isSearchActive={c.isSearchActive}
          isLoading={c.isLoadingSkills}
          selected={c.selected}
          selectedCount={c.selectedCount}
          onAdd={c.addSkill}
          onLevelChange={c.setLevel}
          onRemove={c.removeSkill}
          onClearAll={c.clearAll}
          showSummary={false}
        />
      </div>
      {c.selectedCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 text-muted-foreground"
          onClick={c.clearAll}
        >
          Clear all
        </Button>
      )}
    </div>
    <SelectedSkillsPanel controller={c} />
  </section>
);
