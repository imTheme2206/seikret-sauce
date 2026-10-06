import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useWeaponCatalog } from "@/features/builds/hooks/use-catalog";
import { useSkillCatalog } from "@/features/skills/skill-catalog";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LeftPanel } from "./components/left-panel";
import { OptimizerSettings } from "./components/optimizer-settings";
import { ResultsPanel } from "./components/results-panel";
import { SkillSelectionWorkspace } from "./components/skill-selection-workspace";
import { useLoadoutOptimizer } from "./hooks/use-loadout-optimizer";
import { useSaveOptimizerResult } from "./hooks/use-save-optimizer-result";

/** The controller remains the sole owner of optimizer state and search behavior. */
export const LoadoutOptimizer = () => {
  const { catalog, isLoading } = useSkillCatalog();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const weaponCatalog = useWeaponCatalog();
  const controller = useLoadoutOptimizer({
    skills: catalog?.grouped,
    isLoadingSkills: isLoading,
    weaponCatalog,
  });
  const saveResult = useSaveOptimizerResult(
    controller.selectedList,
    controller.weapon,
    controller.weaponSkills,
    controller.weaponProblem,
  );
  const resultsRef = useRef<HTMLDivElement>(null);
  const previousStatus = useRef(controller.status);

  useEffect(() => {
    if (controller.status === "searching") setIsFiltersOpen(false);

    if (
      previousStatus.current === "searching" &&
      (controller.status === "success" ||
        controller.status === "empty" ||
        controller.status === "error")
    ) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      resultsRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    previousStatus.current = controller.status;
  }, [controller.status]);

  return (
    <main className="h-full overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <div className="hidden lg:block">
          <OptimizerSettings controller={controller} />
          <SkillSelectionWorkspace controller={controller} />
        </div>

        <div className="mb-5 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-between"
            onClick={() => setIsFiltersOpen(true)}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" /> Skills &amp; filters
            </span>
            <span className="text-xs text-muted-foreground">
              {controller.selectedCount} selected
            </span>
          </Button>
        </div>

        <div
          ref={resultsRef}
          className="min-h-[calc(100dvh-4rem)] scroll-mt-5"
        >
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
            onRetry={controller.runSearch}
            onChooseSkills={() => setIsFiltersOpen(true)}
          />
        </div>
      </div>

      <Drawer
        direction="left"
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
      >
        <DrawerContent className="flex w-[min(92vw,440px)] flex-col overflow-hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Skills &amp; filters</DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <LeftPanel controller={controller} className="border-r-0" />
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
};
