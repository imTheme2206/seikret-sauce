import useSWR from "swr";
import { useApi } from "@/hooks/use-api";
import { toBuildApiError } from "../errors";
import { buildKeys } from "./keys";
import type { SavedBuild } from "../types";

/** One saved build by id — public builds included, hence no auth gate. */
export const useSavedBuild = (id: string | undefined) => {
  const { api } = useApi();

  const result = useSWR<SavedBuild>(
    id ? buildKeys.detail(id) : null,
    async () => {
      try {
        return (
          await api("/api/mh-wilds/builds/{id}").method("get").create()({ id: id! })
        ).data;
      } catch (error) {
        throw toBuildApiError(error);
      }
    },
    { revalidateOnFocus: false },
  );

  return { ...result, build: result.data };
};
