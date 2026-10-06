import { useMemo } from "react";
import useSWR from "swr";
import { useApi } from "@/hooks/use-api";
import type { paths } from "@/vendor/openapi";

type JsonResponse<
  Path extends keyof paths,
  Method extends keyof paths[Path],
> = paths[Path][Method] extends {
  responses: { 200: { content: { "application/json": infer Response } } };
}
  ? Response
  : never;

export type SkillCatalogResponse = JsonResponse<
  "/api/mh-wilds/skills",
  "get"
>;
export type SkillCategory = "armor" | "weapon" | "set" | "group";

export type CatalogSkill = {
  id: string;
  name: string;
  cleanName: string;
  type: SkillCategory;
  category: SkillCategory;
  maxLevel: number;
  isSetSkill: boolean;
  isGroupSkill: boolean;
  requiredPieces: number | null;
  effectName: string | null;
  icon: string | null;
};

export type GroupedSkills = {
  armorSkills: CatalogSkill[];
  weaponSkills: CatalogSkill[];
  setSkills: CatalogSkill[];
  groupSkills: CatalogSkill[];
};

export type SkillCatalog = {
  response: SkillCatalogResponse;
  grouped: GroupedSkills;
  byId: ReadonlyMap<string, CatalogSkill>;
  byName: ReadonlyMap<string, CatalogSkill>;
  bonuses: {
    set: SkillCatalogResponse["bonuses"];
    group: SkillCatalogResponse["bonuses"];
  };
};

const SKILL_CATALOG_KEY = "catalog/skills";
const SKILL_CATALOG_OPTIONS = { revalidateOnFocus: false } as const;

export const createSkillCatalog = (
  response: SkillCatalogResponse,
): SkillCatalog => {
  const regularSkills: CatalogSkill[] = response.skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    cleanName: skill.name.toLocaleLowerCase(),
    type: skill.kind,
    category: skill.kind,
    maxLevel: skill.maxLevel,
    isSetSkill: false,
    isGroupSkill: false,
    requiredPieces: null,
    effectName: null,
    icon: skill.icon,
  }));

  const bonuses: CatalogSkill[] = response.bonuses.map((bonus) => {
    const first = [...bonus.thresholds].sort(
      (a, b) => a.piecesRequired - b.piecesRequired,
    )[0];
    return {
      id: bonus.id,
      name: bonus.name,
      cleanName: bonus.name.toLocaleLowerCase(),
      type: bonus.kind,
      category: bonus.kind,
      maxLevel: Math.max(
        ...bonus.thresholds.map((threshold) => threshold.level),
        1,
      ),
      isSetSkill: bonus.kind === "set",
      isGroupSkill: bonus.kind === "group",
      requiredPieces: first?.piecesRequired ?? null,
      effectName: first?.effectName ?? null,
      icon: bonus.icon,
    };
  });

  const allSkills = [...regularSkills, ...bonuses];

  return {
    response,
    grouped: {
      armorSkills: regularSkills.filter(
        (skill) => skill.category === "armor",
      ),
      weaponSkills: regularSkills.filter(
        (skill) => skill.category === "weapon",
      ),
      setSkills: bonuses.filter((skill) => skill.category === "set"),
      groupSkills: bonuses.filter((skill) => skill.category === "group"),
    },
    byId: new Map(allSkills.map((skill) => [skill.id, skill])),
    byName: new Map(allSkills.map((skill) => [skill.name, skill])),
    bonuses: {
      set: response.bonuses.filter((bonus) => bonus.kind === "set"),
      group: response.bonuses.filter((bonus) => bonus.kind === "group"),
    },
  };
};

// SWR hands every consumer the same response object, so project it once and
// share the result — skill lines render once per row in long pickers.
const projections = new WeakMap<SkillCatalogResponse, SkillCatalog>();
const catalogFor = (response: SkillCatalogResponse): SkillCatalog => {
  let catalog = projections.get(response);
  if (!catalog) {
    catalog = createSkillCatalog(response);
    projections.set(response, catalog);
  }
  return catalog;
};

/** One fetch and one projection seam for every consumer of the Skill Catalog. */
export const useSkillCatalog = () => {
  const { api } = useApi();
  const { data, isLoading, error } = useSWR<SkillCatalogResponse>(
    SKILL_CATALOG_KEY,
    async () =>
      (await api("/api/mh-wilds/skills").method("get").create()({})).data,
    SKILL_CATALOG_OPTIONS,
  );
  const catalog = useMemo(() => (data ? catalogFor(data) : undefined), [data]);

  return {
    catalog,
    isLoading,
    error:
      error instanceof Error ? error : error ? new Error(String(error)) : null,
  };
};
