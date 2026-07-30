/**
 * Controller for the builds hub: owns which feed is shown, the two list
 * mutations (share / discard) and the one error slot the page reports them in.
 * The hub components stay stateless (SRP + DIP), as in the optimizer.
 */

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { buildErrorMessage } from "../errors";
import { useBuildApi } from "./use-build-api";
import { useMyBuilds } from "./use-my-builds";
import { useSharedBuilds } from "./use-shared-builds";
import type { BuildSummary } from "../types";

export type BuildsView = "mine" | "shared";

export function useBuildsHub(view: BuildsView) {
  const { signInWithDiscord } = useAuth();
  const mine = useMyBuilds();
  const shared = useSharedBuilds(view === "shared");
  const { deleteBuild, patchBuild } = useBuildApi();
  const [actionError, setActionError] = useState<string | null>(null);

  const toggleShare = async (build: BuildSummary) => {
    setActionError(null);
    try {
      await patchBuild(build.id, build.revision, { isShared: !build.isShared });
    } catch (error) {
      setActionError(buildErrorMessage(error, "Could not update sharing."));
    }
  };

  const removeBuild = async (build: BuildSummary) => {
    setActionError(null);
    try {
      await deleteBuild(build.id);
    } catch (error) {
      setActionError(
        buildErrorMessage(error, "Could not discard the loadout."),
      );
    }
  };

  return {
    view,
    mine,
    shared,
    session: mine.session,
    actionError,
    signInWithDiscord,
    toggleShare,
    removeBuild,
  };
}

export type BuildsHubController = ReturnType<typeof useBuildsHub>;
