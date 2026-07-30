/**
 * Controller for the builds hub: owns which feed is shown, the two list
 * mutations (share / discard) and the one error slot the page reports them in.
 * The hub components stay stateless (SRP + DIP), as in the optimizer.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
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

  useEffect(() => {
    const loadError = view === "mine" ? mine.error : shared.error;
    if (loadError) {
      toast({
        variant: "destructive",
        title: "Could not load equipment records",
        description: buildErrorMessage(
          loadError,
          "The Guild connection failed.",
        ),
      });
    }
  }, [mine.error, shared.error, view]);

  const toggleShare = async (build: BuildSummary) => {
    setActionError(null);
    try {
      await patchBuild(build.id, build.revision, { isShared: !build.isShared });
      toast({
        variant: "success",
        title: build.isShared ? "Sharing stopped" : "Loadout shared",
        description: build.isShared
          ? `${build.name} is now private.`
          : `${build.name} is now visible in the Gathering Hub.`,
      });
    } catch (error) {
      const message = buildErrorMessage(error, "Could not update sharing.");
      setActionError(message);
      toast({
        variant: "destructive",
        title: "Could not update sharing",
        description: message,
      });
    }
  };

  const removeBuild = async (build: BuildSummary) => {
    setActionError(null);
    try {
      await deleteBuild(build.id);
      toast({
        variant: "success",
        title: "Loadout deleted",
        description: `${build.name} was removed from your equipment box.`,
      });
      return true;
    } catch (error) {
      const message = buildErrorMessage(
        error,
        "Could not discard the loadout.",
      );
      setActionError(message);
      toast({
        variant: "destructive",
        title: "Could not delete loadout",
        description: message,
      });
      return false;
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
