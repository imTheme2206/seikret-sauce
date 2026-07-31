import useSWR from "swr";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { toBuildApiError } from "../errors";
import { buildKeys } from "./keys";
import type { BuildSummary } from "../types";

/** The signed-in hunter's saved builds. Fetches nothing while signed out. */
export const useMyBuilds = () => {
  const { session, isLoading: authLoading } = useAuth();
  const { api } = useApi();
  const key = session ? buildKeys.mine(session.user.id) : null;

  const result = useSWR<BuildSummary[]>(
    key,
    async () => {
      try {
        return (await api("/api/mh-wilds/builds").method("get").create()({})).data;
      } catch (error) {
        throw toBuildApiError(error);
      }
    },
    { revalidateOnFocus: false },
  );

  return {
    ...result,
    builds: result.data ?? [],
    authLoading,
    session,
    cacheKey: key,
  };
};
