import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";
import { RankSelector } from "./rank-selector";
import { SkillPool } from "./skill-pool";
import { SkillSearchBar } from "./skill-search-bar";
import { WeaponSelector } from "./weapon-selector";

type LeftPanelProps = {
  controller: LoadoutOptimizerController;
  className?: string;
};

export const LeftPanel = ({ controller, className }: LeftPanelProps) => {
  const c = controller;

  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden border-r border-border bg-card/20",
        className,
      )}
    >
      <div className="shrink-0 border-b border-border px-5 pb-4 pt-5">
        <Typography as="h2" className="text-base font-semibold text-foreground">
          Build requirements
        </Typography>
        <Typography as="p" className="mt-1 text-xs text-muted-foreground">
          Choose the skills and levels your loadout needs.
        </Typography>
      </div>

      <div className="shrink-0 space-y-4 border-b border-border px-5 py-4">
        <RankSelector
          value={c.rank}
          onChange={c.setRank}
          disabled={c.isSearching}
        />

        <WeaponSelector
          value={c.weapon}
          onChange={c.setWeaponSkill}
          options={c.weaponOptions}
          disabled={c.isSearching}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4">
        <SkillSearchBar value={c.searchQuery} onChange={c.setSearchQuery} />

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
        />
      </div>

      <div className="shrink-0 border-t border-border bg-background/40 px-5 py-4">
        <Button
          type="button"
          onClick={c.runSearch}
          disabled={c.selectedCount === 0 || c.isSearching}
          className="h-11 w-full rounded-sm text-sm font-semibold shadow-none disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100"
        >
          {c.isSearching && <Loader2 className="size-4 animate-spin" />}
          {c.isSearching ? "Finding loadouts…" : "Find loadouts"}
          {!c.isSearching && c.selectedCount > 0 && (
            <span className="font-normal opacity-70">· {c.selectedCount} skills</span>
          )}
        </Button>
      </div>
    </aside>
  );
};
