import useSWR from "node_modules/swr/dist/index";
import { useApi } from "./use-api";

type SkillsResponse = {
  id: string;
  name: string;
  cleanName: string;
  type: string;
  maxLevel: number;
  isSetSkill: boolean;
  isGroupSkill: boolean;
  requiredPieces: number | null;
  effectName: string | null;
}[];

export type GroupedSkills = {
  armorSkills: SkillsResponse[];
  weaponSkills: SkillsResponse[];
  setSkills: SkillsResponse[];
  groupSkills: SkillsResponse[];
};

export const useGetSkills = () => {
  const { api } = useApi();

  const { data, isLoading } = useSWR(
    ["get-skills"],
    async () => {
      const resp = await api("/api/mh-wilds/skills").method("get").create()({});

      return {
        armorSkills: resp.data.filter((s) => s.type === "armor"),
        weaponSkills: resp.data.filter((s) => s.type === "weapon"),
        groupSkills: resp.data.filter((s) => s.isGroupSkill),
        setSkills: resp.data.filter((s) => s.isSetSkill),
      };
    },
    {
      revalidateOnFocus: false,
    },
  );

  return {
    data,
    isLoading,
  };
};
