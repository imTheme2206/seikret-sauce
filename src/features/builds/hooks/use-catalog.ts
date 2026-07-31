import useSWR from "swr";
import {
  useSkillCatalog,
  type SkillCatalog as SharedSkillCatalog,
} from "@/features/skills/skill-catalog";
import { useApi } from "@/hooks/use-api";
import { toBuildApiError } from "../errors";
import { buildKeys } from "./keys";
import type { Armor, Decoration } from "../types";

export type BuildCatalog = {
  armors: Armor[];
  decorations: Decoration[];
  skillCatalog: SharedSkillCatalog | undefined;
  isLoading: boolean;
  error: Error | null;
};

/** Immutable reference data: never revalidated on focus, shared by all build screens. */
const CATALOG_OPTIONS = { revalidateOnFocus: false } as const;

/**
 * The armour / decoration catalogs the editor resolves draft ids against,
 * composed with the shared Skill Catalog module.
 */
export const useCatalog = (): BuildCatalog => {
  const { api } = useApi();
  const {
    catalog: skillCatalog,
    isLoading: isLoadingSkills,
    error: skillsError,
  } = useSkillCatalog();

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

  return {
    armors: armors.data ?? [],
    decorations: decorations.data ?? [],
    skillCatalog,
    isLoading: armors.isLoading || decorations.isLoading || isLoadingSkills,
    error: armors.error ?? decorations.error ?? skillsError,
  };
};
