import useSWR from "swr";
import {
  useSkillCatalog,
  type SkillCatalog as SharedSkillCatalog,
} from "@/features/skills/skill-catalog";
import { useApi } from "@/hooks/use-api";
import { toBuildApiError } from "../errors";
import { buildKeys } from "./keys";
import type { Armor, Decoration, Weapon } from "../types";

export type BuildCatalog = {
  armors: Armor[];
  decorations: Decoration[];
  weapons: Weapon[];
  skillCatalog: SharedSkillCatalog | undefined;
  isLoading: boolean;
  error: Error | null;
};

/** Immutable reference data: never revalidated on focus, shared by all build screens. */
const CATALOG_OPTIONS = { revalidateOnFocus: false } as const;

/**
 * The armour / weapon / decoration catalogs the editor resolves draft ids against,
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

  const weapons = useSWR<Weapon[]>(
    buildKeys.catalog("weapons"),
    async () => {
      try {
        return (await api("/api/mh-wilds/weapons").method("get").create()({}))
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
    weapons: weapons.data ?? [],
    skillCatalog,
    isLoading:
      armors.isLoading ||
      decorations.isLoading ||
      weapons.isLoading ||
      isLoadingSkills,
    error: armors.error ?? decorations.error ?? weapons.error ?? skillsError,
  };
};
