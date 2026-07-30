import { useState } from "react";
import { useBuildApi } from "@/features/builds/hooks/use-build-api";
import { useCatalog } from "@/features/builds/hooks/use-catalog";
import { buildErrorMessage } from "@/features/builds/errors";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { optimizerResultToBuild } from "../optimizer-to-build";
import type { LoadoutResult, SelectedSkill } from "../types";

export function useSaveOptimizerResult(selected: SelectedSkill[]) {
  const { session, signInWithDiscord } = useAuth();
  const catalog = useCatalog();
  const { createBuild } = useBuildApi();
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const saveResult = async (result: LoadoutResult, index: number) => {
    if (!session) {
      await signInWithDiscord();
      return;
    }
    if (catalog.isLoading) return;
    if (catalog.error) {
      toast({
        variant: "destructive",
        title: "Could not prepare loadout",
        description: "The equipment catalog is unavailable. Try again shortly.",
      });
      return;
    }

    setSavingIndex(index);
    try {
      const body = optimizerResultToBuild(
        result,
        index + 1,
        selected,
        catalog.armors,
        catalog.decorations,
      );
      await createBuild(body);
      toast({
        variant: "success",
        title: "Optimizer result saved",
        description: `${body.name} was added to My Loadouts.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not save optimizer result",
        description: buildErrorMessage(
          error,
          error instanceof Error
            ? error.message
            : "The loadout could not be saved.",
        ),
      });
    } finally {
      setSavingIndex(null);
    }
  };

  return {
    isSignedIn: Boolean(session),
    isCatalogLoading: catalog.isLoading,
    savingIndex,
    saveResult,
  };
}
