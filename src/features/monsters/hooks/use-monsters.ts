import useSWR from "swr";
import { toBuildApiError } from "@/features/builds/errors";
import { useApi } from "@/hooks/use-api";
import type { MonsterDetail, MonsterListItem } from "../types";

/** SWR keys for the monster catalog. */
export const monsterKeys = {
  list: "monsters/list",
  detail: (id: string) => `monsters/detail/${id}`,
} as const;

/** Patches change monster values, so a revisit may revalidate; only focus-refetching is off. */
const MONSTER_OPTIONS = { revalidateOnFocus: false } as const;

/** Every large monster, alphabetical (`GET /api/mh-wilds/monsters`). */
export const useMonsterList = () => {
  const { api } = useApi();

  const result = useSWR<MonsterListItem[]>(
    monsterKeys.list,
    async () => {
      try {
        return (await api("/api/mh-wilds/monsters").method("get").create()({}))
          .data;
      } catch (error) {
        throw toBuildApiError(error);
      }
    },
    MONSTER_OPTIONS,
  );

  return { ...result, monsters: result.data ?? [] };
};

/** One monster with its parts and weaknesses; idle while `id` is null. */
export const useMonster = (id: string | null) => {
  const { api } = useApi();

  const result = useSWR<MonsterDetail>(
    id ? monsterKeys.detail(id) : null,
    async () => {
      try {
        return (
          await api("/api/mh-wilds/monsters/{id}")
            .method("get")
            .create()({ id: id! })
        ).data;
      } catch (error) {
        throw toBuildApiError(error);
      }
    },
    MONSTER_OPTIONS,
  );

  return { ...result, monster: result.data };
};
