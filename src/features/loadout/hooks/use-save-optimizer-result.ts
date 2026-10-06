import { useState } from "react";
import { useBuildApi } from "@/features/builds/hooks/use-build-api";
import { buildErrorMessage } from "@/features/builds/errors";
import type { ImportBuildBody } from "@/features/builds/types";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { resultName } from "../utils";
import type { EditorWeaponSelection } from "@/features/builds/types";
import type { LoadoutResult, SelectedSkill, WeaponSkills } from "../types";
import { toImportWeapon } from "../weapon";

/**
 * Saves an optimizer result via `POST /api/mh-wilds/builds/import`, carrying the
 * equipped weapon (catalog id, Artian configuration, rolled bonuses by name) into the
 * Build. `result` is the raw `LoadoutResult` sent through untouched — name→id resolution and
 * decoration packing are the backend's job now (see
 * `docs/adr/0001-result-type-mirrors-api-dto.md` and the retired
 * `optimizer-to-build.ts`, which used to do this on the client).
 */
export const useSaveOptimizerResult = (
  selected: SelectedSkill[],
  weapon: EditorWeaponSelection,
  weaponSkills: WeaponSkills,
  /** A weapon rule the API would reject (see `weaponProblem`); blocks saving with this message. */
  weaponProblem: string | null = null,
) => {
  const { session, signInWithDiscord } = useAuth();
  const { importBuild } = useBuildApi();
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const saveResult = async (result: LoadoutResult, index: number) => {
    if (!session) {
      await signInWithDiscord();
      return;
    }

    if (weaponProblem) {
      toast({
        variant: "destructive",
        title: "Check the weapon",
        description: weaponProblem,
      });
      return;
    }

    setSavingIndex(index);
    try {
      const body: ImportBuildBody = {
        result,
        weapon: toImportWeapon(weapon, weaponSkills),
        name: resultName(selected, index + 1),
        description: "Saved from a Seikret Sauce optimizer result.",
        isShared: false,
      };
      await importBuild(body);
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
    savingIndex,
    saveResult,
  };
};
