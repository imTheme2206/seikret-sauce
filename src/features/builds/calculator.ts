import type { BuildSnapshot, BuildTotals } from "./types";

const ELEMENTS = ["fire", "water", "thunder", "ice", "dragon"] as const;

function add(target: Record<string, number>, name: string, level: number) {
  target[name] = (target[name] ?? 0) + level;
}

/**
 * Pure projection from the backend-owned snapshot to display totals.
 * The backend deliberately stores facts, not aggregates, so both the editor and
 * public permalink use this same calculation.
 */
export function calculateBuild(snapshot: BuildSnapshot): BuildTotals {
  const rawSkills: Record<string, number> = {};
  const bonusCounts: Record<string, number> = {};
  const resistances = { fire: 0, water: 0, thunder: 0, ice: 0, dragon: 0 };
  let defense = 0;

  for (const piece of Object.values(snapshot.positions)) {
    if (!piece) continue;

    for (const skill of piece.skills) add(rawSkills, skill.name, skill.level);
    for (const decoration of piece.decorations) {
      for (const skill of decoration.skills)
        add(rawSkills, skill.name, skill.level);
    }
    for (const bonus of piece.bonuses)
      add(bonusCounts, bonus.name, 1);

    if ("defense" in piece) {
      defense += piece.defense;
      for (const element of ELEMENTS)
        resistances[element] += piece.resistances[element];
    }
  }

  const activeBonuses = Object.entries(snapshot.bonusDefinitions)
    .flatMap(([name, definition]) => {
      const pieces = bonusCounts[name] ?? 0;
      const active = [...definition.thresholds]
        .sort((a, b) => a.piecesRequired - b.piecesRequired)
        .filter((threshold) => threshold.piecesRequired <= pieces)
        .at(-1);
      if (!active) return [];
      add(rawSkills, active.effectName, active.level);
      return [{
        name,
        kind: definition.kind,
        pieces,
        piecesRequired: active.piecesRequired,
        effectName: active.effectName,
        level: active.level,
      }];
    })
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));

  const skills = Object.fromEntries(
    Object.entries(rawSkills)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, level]) => [
        name,
        Math.min(level, snapshot.skillDefinitions[name] ?? level),
      ]),
  );

  return {
    skills,
    rawSkills,
    bonusCounts,
    activeBonuses,
    defense,
    resistances,
  };
}
