import useSWR from "swr";
import { useApi } from "@/hooks/use-api";
import { toBuildApiError } from "../errors";
import { buildKeys } from "./keys";
import type { Armor, Decoration, SkillCatalog } from "../types";

export interface BuildCatalog {
  armors: Armor[];
  decorations: Decoration[];
  skills: SkillCatalog | undefined;
  isLoading: boolean;
  error: Error | null;
}

/** Immutable reference data: never revalidated on focus, shared by all build screens. */
const CATALOG_OPTIONS = { revalidateOnFocus: false } as const;

/**
 * The armour / decoration / skill catalogs the editor resolves draft ids against.
 *
 * These are the raw catalogs, deliberately separate from `useGetSkills` — that
 * hook projects the same skills endpoint into the optimizer's grouped shape,
 * whereas the editor needs skill and bonus definitions verbatim to build a
 * snapshot.
 */
export function useCatalog(): BuildCatalog {
  const { api } = useApi();

  const armors = useSWR<Armor[]>(
    buildKeys.catalog("armors"),
    async () => {
      try {
        return (await api("/api/mh-wilds/armors").method("get").create()({})).data;
      } catch (error) {
        throw toBuildApiError(error);
      }
    },
    CATALOG_OPTIONS,
  );

  const decorations = useSWR<Decoration[]>(
    buildKeys.catalog("decorations"),
    async () => {
      try {
        return (await api("/api/mh-wilds/decorations").method("get").create()({}))
          .data;
      } catch (error) {
        throw toBuildApiError(error);
      }
    },
    CATALOG_OPTIONS,
  );

  const skills = useSWR<SkillCatalog>(
    buildKeys.catalog("skills"),
    async () => {
      try {
        return (await api("/api/mh-wilds/skills").method("get").create()({})).data;
      } catch (error) {
        throw toBuildApiError(error);
      }
    },
    CATALOG_OPTIONS,
  );

  return {
    armors: armors.data ?? [],
    decorations: decorations.data ?? [],
    skills: skills.data,
    isLoading: armors.isLoading || decorations.isLoading || skills.isLoading,
    error: armors.error ?? decorations.error ?? skills.error ?? null,
  };
}
