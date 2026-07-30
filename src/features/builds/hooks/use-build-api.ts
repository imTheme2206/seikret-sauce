import { mutate as mutateCache } from "swr";
import { useApi } from "@/hooks/use-api";
import { toBuildApiError } from "../errors";
import { buildKeyMatchers, buildKeys } from "./keys";
import type {
  BuildMetadataPatch,
  CreateBuildBody,
  SavedBuild,
  SharedBuildPage,
} from "../types";

/** How many shared builds one "Load more" page holds. */
const SHARED_PAGE_SIZE = 12;

/**
 * Write operations over builds, each responsible for invalidating the lists its
 * result would change. Reads live in the `use-*` fetch hooks.
 */
export function useBuildApi() {
  const { api } = useApi();

  const revalidateMine = () => mutateCache(buildKeyMatchers.anyMine);
  const revalidateShared = () => mutateCache(buildKeyMatchers.anyShared);
  const writeDetail = (build: SavedBuild) =>
    mutateCache(buildKeys.detail(build.id), build, { revalidate: false });

  const createBuild = async (
    body: CreateBuildBody,
    idempotencyKey = crypto.randomUUID(),
  ) => {
    try {
      const { data: build } = await api("/api/mh-wilds/builds")
        .method("post")
        .create()(body, { headers: { "Idempotency-Key": idempotencyKey } });
      await revalidateMine();
      return build;
    } catch (error) {
      throw toBuildApiError(error);
    }
  };

  const replaceBuild = async (
    id: string,
    revision: number,
    body: CreateBuildBody,
  ) => {
    try {
      const { data: build } = await api("/api/mh-wilds/builds/{id}")
        .method("put")
        .create({ revision: true })({ id, revision, ...body });
      await writeDetail(build);
      await revalidateMine();
      return build;
    } catch (error) {
      throw toBuildApiError(error);
    }
  };

  const patchBuild = async (
    id: string,
    revision: number,
    body: BuildMetadataPatch,
  ) => {
    try {
      const { data: build } = await api("/api/mh-wilds/builds/{id}")
        .method("patch")
        .create({ revision: true })({ id, revision, ...body });
      await writeDetail(build);
      await revalidateMine();
      // Sharing may have been toggled, which adds/removes it from the hub.
      await revalidateShared();
      return build;
    } catch (error) {
      throw toBuildApiError(error);
    }
  };

  const deleteBuild = async (id: string) => {
    try {
      await api("/api/mh-wilds/builds/{id}").method("delete").create()({ id });
      await revalidateMine();
    } catch (error) {
      throw toBuildApiError(error);
    }
  };

  const fetchSharedBuilds = async (cursor?: string): Promise<SharedBuildPage> => {
    try {
      return (
        await api("/api/mh-wilds/builds/shared")
          .method("get")
          .create()({ limit: SHARED_PAGE_SIZE, cursor })
      ).data;
    } catch (error) {
      throw toBuildApiError(error);
    }
  };

  return {
    createBuild,
    replaceBuild,
    patchBuild,
    deleteBuild,
    fetchSharedBuilds,
  };
}
