import { useGetSkills } from "@/hooks/use-get-skills";
import { AppHeader } from "./components/app-header";
import { LeftPanel } from "./components/left-panel";
import { ResultsPanel } from "./components/results-panel";
import { useLoadoutOptimizer } from "./hooks/use-loadout-optimizer";
import type { GroupedSkills } from "./types";

/**
 * Top-level feature screen. Owns data fetching and the optimizer controller,
 * then composes the header + two-panel body. Layout only — every interactive
 * concern lives in a dedicated child (SRP).
 */
export function LoadoutOptimizer() {
  const { data, isLoading } = useGetSkills();

  const controller = useLoadoutOptimizer({
    skills: data as unknown as GroupedSkills | undefined,
    isLoadingSkills: isLoading,
  });

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      <div className="grid flex-1 grid-cols-[440px_1fr] overflow-hidden">
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
    </div>
  );
}
