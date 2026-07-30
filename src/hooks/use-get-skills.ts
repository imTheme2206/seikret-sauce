import useSWR from "swr";
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
  icon: string | null;
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

      const skills = resp.data.skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        cleanName: skill.name.toLocaleLowerCase(),
        type: skill.kind,
        maxLevel: skill.maxLevel,
        isSetSkill: false,
        isGroupSkill: false,
        requiredPieces: null,
        effectName: null,
        icon: skill.icon,
      }));
      const bonuses = resp.data.bonuses.map((bonus) => {
        const first = [...bonus.thresholds].sort(
          (a, b) => a.piecesRequired - b.piecesRequired,
        )[0];
        return {
          id: bonus.id,
          name: bonus.name,
          cleanName: bonus.name.toLocaleLowerCase(),
          type: bonus.kind,
          maxLevel: Math.max(...bonus.thresholds.map((threshold) => threshold.level), 1),
          isSetSkill: bonus.kind === "set",
          isGroupSkill: bonus.kind === "group",
          requiredPieces: first?.piecesRequired ?? null,
          effectName: first?.effectName ?? null,
          icon: bonus.icon,
        };
      });

      return {
        armorSkills: skills.filter((skill) => skill.type === "armor"),
        weaponSkills: skills.filter((skill) => skill.type === "weapon"),
        groupSkills: bonuses.filter((skill) => skill.isGroupSkill),
        setSkills: bonuses.filter((skill) => skill.isSetSkill),
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
