import { cn } from "@/lib/utils";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";
import { RankSelector } from "./rank-selector";
import { SelectedSkillsPanel } from "./selected-skills-panel";
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
        "flex h-full flex-col gap-2.5 overflow-hidden border-r border-border p-3.5",
        className,
      )}
    >
      <SkillSearchBar
        value={c.searchQuery}
        onChange={c.setSearchQuery}
        onOptimize={c.runSearch}
        canOptimize={c.selectedCount > 0 && !c.isSearching}
        isOptimizing={c.isSearching}
      />

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

      <SelectedSkillsPanel
        skills={c.selectedList}
        count={c.selectedCount}
        onLevelChange={c.setLevel}
        onRemove={c.removeSkill}
        onClearAll={c.clearAll}
      />

      <SkillPool
        pool={c.pool}
        activeTab={c.activeTab}
        onTabChange={c.setActiveTab}
        isSearchActive={c.isSearchActive}
        isLoading={c.isLoadingSkills}
        isSelected={(name) => Boolean(c.selected[name])}
        onAdd={c.addSkill}
      />
    </aside>
  );
};
