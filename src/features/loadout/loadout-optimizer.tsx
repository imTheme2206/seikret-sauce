import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useSkillCatalog } from "@/features/skills/skill-catalog";
import { LeftPanel } from "./components/left-panel";
import { ResultsPanel } from "./components/results-panel";
import { useLoadoutOptimizer } from "./hooks/use-loadout-optimizer";
import { useSaveOptimizerResult } from "./hooks/use-save-optimizer-result";

/**
 * `/` route body: owns data fetching and the optimizer controller, then
 * composes the two-panel layout. The header/shell live in the root route.
 * Below `lg` the sidebar collapses into a Drawer, triggered from the results
 * panel, so narrow screens get the full-width results list by default.
 */
export const LoadoutOptimizer = () => {
  const { catalog, isLoading } = useSkillCatalog();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const controller = useLoadoutOptimizer({
    skills: catalog?.grouped,
    isLoadingSkills: isLoading,
  });
  const saveResult = useSaveOptimizerResult(controller.selectedList, controller.weapon);

  return (
    <div className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[440px_1fr]">
      <div className="hidden lg:contents">
        <LeftPanel controller={controller} />
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border p-2.5 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsFiltersOpen(true)}
          >
            <SlidersHorizontal className="size-4" />
            Skills & filters
          </Button>
        </div>

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

      <Drawer
        direction="left"
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
      >
        <DrawerContent className="flex w-[85vw] max-w-[440px] flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 border-b border-border">
            <DrawerTitle>Skills & filters</DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <LeftPanel controller={controller} className="border-r-0" />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
