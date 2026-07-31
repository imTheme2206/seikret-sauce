import type {
  SkillCatalog,
  SkillCategory,
} from "@/features/skills/skill-catalog";
import type { ElementalDefenses } from "@/lib/mh-wilds";
import { calculateBuild } from "./calculator";
import type { ActivatedBonus, BuildSnapshot } from "./types";

export interface HunterStatusSkill {
  name: string;
  level: number;
  icon: string | null;
  category: SkillCategory;
}

export interface HunterStatus {
  defense: number;
  resistances: ElementalDefenses;
  skills: HunterStatusSkill[];
  activeBonuses: ActivatedBonus[];
}

/** Complete display model shared by the live editor and saved Build view. */
export function createHunterStatus(
  snapshot: BuildSnapshot,
  catalog?: SkillCatalog,
): HunterStatus {
  const totals = calculateBuild(snapshot);

  return {
    defense: totals.defense,
    resistances: totals.resistances,
    skills: Object.entries(totals.skills).map(([name, level]) => {
      const definition = catalog?.byName.get(name);
      return {
        name,
        level,
        icon: definition?.icon ?? null,
        category: definition?.category ?? "armor",
      };
    }),
    activeBonuses: totals.activeBonuses,
  };
}
