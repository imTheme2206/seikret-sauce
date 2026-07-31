import { useSkillCatalog } from "@/features/skills/skill-catalog";
import { LeftPanel } from "./components/left-panel";
import { ResultsPanel } from "./components/results-panel";
import { useLoadoutOptimizer } from "./hooks/use-loadout-optimizer";
import { useSaveOptimizerResult } from "./hooks/use-save-optimizer-result";

/**
 * `/` route body: owns data fetching and the optimizer controller, then
 * composes the two-panel layout. The header/shell live in the root route.
 */
export function LoadoutOptimizer() {
  const { catalog, isLoading } = useSkillCatalog();

  const controller = useLoadoutOptimizer({
    skills: catalog?.grouped,
    isLoadingSkills: isLoading,
  });
  const saveResult = useSaveOptimizerResult(controller.selectedList, controller.weapon);

  return (
    <div className="grid h-full grid-cols-[440px_1fr] overflow-hidden">
      <LeftPanel controller={controller} />
      <ResultsPanel
        results={controller.results}
        status={controller.status}
        error={controller.error}
        expanded={controller.expanded}
        requestedNames={controller.requestedNames}
        onToggle={controller.toggleExpand}
        isSignedIn={saveResult.isSignedIn}
        savingIndex={saveResult.savingIndex}
        onSave={saveResult.saveResult}
      />
    </div>
  );
}
