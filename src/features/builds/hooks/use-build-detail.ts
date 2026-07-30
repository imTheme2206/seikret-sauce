/**
 * Controller for a build permalink: loads the record, decides whether the
 * viewer owns it, and duplicates it into their own equipment box.
 */

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { draftFromBuild } from "../draft";
import { buildErrorMessage } from "../errors";
import { toCreateBody } from "../utils";
import { useBuildApi } from "./use-build-api";
import { useMyBuilds } from "./use-my-builds";
import { useSavedBuild } from "./use-saved-build";

export function useBuildDetail(buildId: string) {
  const navigate = useNavigate();
  const { build, isLoading, error } = useSavedBuild(buildId);
  const mine = useMyBuilds();
  const { createBuild } = useBuildApi();
  const [message, setMessage] = useState<string | null>(null);

  const duplicate = async () => {
    if (!build) return;
    const draft = draftFromBuild(build);
    setMessage(null);
    try {
      const copy = await createBuild({
        ...toCreateBody(draft),
        name: `${draft.name} — Copy`,
        isShared: false,
      });
      await navigate({
        to: "/builds/$buildId/edit",
        params: { buildId: copy.id },
      });
    } catch (error) {
      setMessage(
        buildErrorMessage(error, "Could not duplicate this loadout."),
      );
    }
  };

  return {
    build,
    isLoading,
    error,
    isOwner: mine.builds.some((item) => item.id === buildId),
    message,
    duplicate,
  };
}

export type BuildDetailController = ReturnType<typeof useBuildDetail>;
