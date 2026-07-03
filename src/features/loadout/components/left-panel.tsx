import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";
import { RankSelector } from "./rank-selector";
import { SkillSearchBar } from "./skill-search-bar";
import { SelectedSkillsPanel } from "./selected-skills-panel";
import { SkillPool } from "./skill-pool";
import { WeaponSelector } from "./weapon-selector";

/**
 * Left configuration column: search/optimize, current selection, and the
 * browsable skill pool. Receives a single controller and routes its slices to
 * the leaf components.
 */
export function LeftPanel({ controller }: { controller: LoadoutOptimizerController }) {
  const c = controller;

  return (
    <aside className="flex flex-col gap-2.5 overflow-hidden border-r border-border p-3.5">
      <SkillSearchBar
        value={c.searchQuery}
        onChange={c.setSearchQuery}
        onOptimize={c.runSearch}
        canOptimize={c.selectedCount > 0 && !c.isSearching}
        isOptimizing={c.isSearching}
      />

      <RankSelector value={c.rank} onChange={c.setRank} disabled={c.isSearching} />

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
}
