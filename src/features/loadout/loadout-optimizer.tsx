import { useGetSkills } from "@/hooks/use-get-skills";
import { LeftPanel } from "./components/left-panel";
import { ResultsPanel } from "./components/results-panel";
import { useLoadoutOptimizer } from "./hooks/use-loadout-optimizer";
import type { GroupedSkills } from "./types";

/**
 * `/` route body: owns data fetching and the optimizer controller, then
 * composes the two-panel layout. The header/shell live in the root route.
 */
export function LoadoutOptimizer() {
  const { data, isLoading } = useGetSkills();

  const controller = useLoadoutOptimizer({
    skills: data as unknown as GroupedSkills | undefined,
    isLoadingSkills: isLoading,
  });

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
      />
    </div>
  );
}
