import useSWRInfinite from "swr/infinite";
import { useBuildApi } from "./use-build-api";
import { buildKeys } from "./keys";
import type { BuildSummary, SharedBuildPage } from "../types";

/**
 * Cursor-paginated feed of publicly shared builds.
 *
 * `enabled` is false on the "my builds" view so opening the hub does not fetch a
 * feed the hunter is not looking at.
 */
export function useSharedBuilds(enabled: boolean) {
  const { fetchSharedBuilds } = useBuildApi();

  const pages = useSWRInfinite<SharedBuildPage>(
    (index, previous: SharedBuildPage | null) => {
      if (!enabled) return null;
      if (previous && !previous.nextCursor) return null;
      return [buildKeys.shared, index === 0 ? "" : previous?.nextCursor ?? ""];
    },
    ([, cursor]: [string, string]) => fetchSharedBuilds(cursor || undefined),
    { revalidateFirstPage: false },
  );

  const builds: BuildSummary[] = pages.data?.flatMap((page) => page.items) ?? [];
  const lastPage = pages.data?.at(-1);

  return {
    builds,
    /** True until a page comes back without a next cursor. */
    hasMore: lastPage ? lastPage.nextCursor !== null : true,
    isLoadingFirstPage: !pages.data && pages.isLoading,
    isLoadingMore: pages.isValidating,
    error: pages.error,
    loadMore: () => void pages.setSize(pages.size + 1),
  };
}
