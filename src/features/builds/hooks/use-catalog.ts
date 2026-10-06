import useSWR from "swr";
import {
  useSkillCatalog,
  type SkillCatalog as SharedSkillCatalog,
} from "@/features/skills/skill-catalog";
import { useApi } from "@/hooks/use-api";
import { toBuildApiError } from "../errors";
import { buildKeys } from "./keys";
import type { Armor, ArtianRules, Decoration, Weapon } from "../types";

/** What the weapon picker and its Artian customization need; no armour or decoration data. */
export type WeaponCatalog = {
  weapons: Weapon[];
  /** Artian / Gogma Artian rules table; undefined until loaded. */
  artianRules: ArtianRules | undefined;
  skillCatalog: SharedSkillCatalog | undefined;
  isLoading: boolean;
  error: Error | null;
};

export type BuildCatalog = WeaponCatalog & {
  armors: Armor[];
  decorations: Decoration[];
};

/** Immutable reference data: never revalidated on focus, shared by all build screens. */
const CATALOG_OPTIONS = { revalidateOnFocus: false } as const;

/**
 * The weapon catalog, Artian rules and Skill Catalog (for bonus names): everything the weapon
 * picker needs, shared by the Build Editor and the Loadout Optimizer.
 */
export const useWeaponCatalog = (): WeaponCatalog => {
  const { api } = useApi();
  const {
    catalog: skillCatalog,
    isLoading: isLoadingSkills,
    error: skillsError,
  } = useSkillCatalog();

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

  const artianRules = useSWR<ArtianRules>(
    buildKeys.catalog("artian-rules"),
    async () => {
      try {
        return (
          await api("/api/mh-wilds/artian-rules").method("get").create()({})
        ).data;
      } catch (error) {
        throw toBuildApiError(error);
      }
    },
    CATALOG_OPTIONS,
  );

  return {
    weapons: weapons.data ?? [],
    artianRules: artianRules.data,
    skillCatalog,
    isLoading: weapons.isLoading || artianRules.isLoading || isLoadingSkills,
    error: weapons.error ?? artianRules.error ?? skillsError,
  };
};

/**
 * The armour / weapon / decoration catalogs the editor resolves draft ids against,
 * composed with the shared Skill Catalog module.
 */
export const useCatalog = (): BuildCatalog => {
  const { api } = useApi();
  const weaponCatalog = useWeaponCatalog();

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
    ...weaponCatalog,
    armors: armors.data ?? [],
    decorations: decorations.data ?? [],
    isLoading:
      armors.isLoading || decorations.isLoading || weaponCatalog.isLoading,
    error: armors.error ?? decorations.error ?? weaponCatalog.error,
  };
};
