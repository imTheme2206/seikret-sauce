/**
 * Reads the numbers MHDB states explicitly in a skill rank description
 * (https://wilds.mhdb.io/en/skills, `ranks[].description`). Used by the tests to
 * check the curated table in `skill-effects.ts` against MHDB's own words; a
 * description with no recognisable number yields an empty effect.
 *
 * Recognised shapes (all quoted from MHDB):
 *  "Attack +3" · "Attack +2% Bonus: +8" · "Attack +4 and affinity +3% while active."
 *  "Affinity +4%" · "Fire attack +10% Bonus: +50" · "Increases damage dealt by
 *  critical hits to 28%." · "Attacks that hit weak points gain affinity +5%, with
 *  an extra 3% on wounds." · "... have 20% increased affinity, with an extra 15% on wounds."
 */

import type { ElementKey, SkillEffect } from "./types";

const pct = (value: string): number => Number(value) / 100;

export const parseMhdbEffect = (description: string): SkillEffect => {
  const effect: SkillEffect = {};
  const text = description.trim();

  const element = text.match(
    /^(fire|water|thunder|ice|dragon) attack \+(\d+)(%)?(?:,? bonus: \+(\d+))?/i,
  );
  if (element) {
    if (element[3]) {
      effect.elementPct = pct(element[2]!);
      effect.elementFlat = Number(element[4]);
    } else {
      effect.elementFlat = Number(element[2]);
    }
    return effect;
  }

  const crit = text.match(/critical hits to (\d+)%/i);
  if (crit) {
    effect.critDamage = 1 + pct(crit[1]!);
    return effect;
  }

  const weak = text.match(
    /weak points (?:gain affinity \+|have )(\d+)%(?: increased affinity)?, with an extra (\d+)% on wounds/i,
  );
  if (weak) {
    effect.weakPointAffinity = pct(weak[1]!);
    effect.woundAffinity = pct(weak[2]!);
    return effect;
  }

  const attackPct = text.match(/attack \+(\d+)%/i);
  if (attackPct) effect.attackPct = pct(attackPct[1]!);
  // A bare "Attack +N" (not followed by "%" or another digit) is flat attack.
  const attackFlat = text.match(/attack \+(\d+)(?![\d%])/i);
  const bonus = text.match(/bonus: \+(\d+)/i);
  if (attackFlat) effect.attackFlat = Number(attackFlat[1]);
  else if (bonus && attackPct) effect.attackFlat = Number(bonus[1]);
  const affinity = text.match(/affinity \+(\d+)%/i);
  if (affinity) effect.affinity = pct(affinity[1]!);
  return effect;
};

/** The element a skill name like "Fire Attack" boosts, if it is an element-attack skill. */
export const elementOfAttackSkill = (skill: string): ElementKey | null => {
  const match = skill.match(/^(Fire|Water|Thunder|Ice|Dragon) Attack$/);
  return match ? (match[1]!.toLowerCase() as ElementKey) : null;
};
