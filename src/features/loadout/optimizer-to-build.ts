import { DRAFT_LIMITS } from "@/features/builds/config";
import type {
  Armor,
  CreateBuildBody,
  Decoration,
  PositionKey,
} from "@/features/builds/types";
import { EQUIPMENT_POSITIONS } from "@/lib/mh-wilds";
import type { LoadoutResult, SelectedSkill } from "./types";

interface OpenSlot {
  position: PositionKey;
  slotIndex: number;
  size: number;
}

function resultName(selected: SelectedSkill[], resultNumber: number) {
  const skills = selected.slice(0, 3).map(({ name }) => name).join(" + ");
  const suffix = selected.length > 3 ? " + more" : "";
  const name = skills
    ? `Optimized: ${skills}${suffix}`
    : `Optimizer Result ${resultNumber}`;
  return name.slice(0, DRAFT_LIMITS.name);
}

/**
 * Resolves the optimizer's compact, name-based result into the ID-based body
 * accepted by the saved-build endpoint.
 */
export function optimizerResultToBuild(
  result: LoadoutResult,
  resultNumber: number,
  selected: SelectedSkill[],
  armors: Armor[],
  decorations: Decoration[],
): CreateBuildBody {
  const composition: CreateBuildBody["composition"] = {
    head: null,
    chest: null,
    arms: null,
    waist: null,
    legs: null,
    talisman: null,
  };
  const openSlots: OpenSlot[] = [];

  for (const [index, position] of EQUIPMENT_POSITIONS.entries()) {
    const armorName = result.armorNames[index];
    if (!armorName) continue;

    const armor = armors.find(
      (candidate) =>
        candidate.name === armorName &&
        candidate.type === position &&
        (position === "talisman" ||
          candidate.rarity === result.rarities[index]),
    );
    if (!armor) {
      throw new Error(`“${armorName}” is missing from the current armor catalog.`);
    }

    if (position === "talisman") {
      composition.talisman = {
        source: "scraped",
        talismanId: armor.id,
        decorations: [],
      };
    } else {
      composition[position] = { armorId: armor.id, decorations: [] };
    }

    armor.slots.forEach((size, slotIndex) => {
      openSlots.push({ position, slotIndex, size });
    });
  }

  const resolvedDecorations = result.decoNames
    .map((name) => {
      const decoration = decorations.find(
        (candidate) => candidate.name === name && candidate.type === "armor",
      );
      if (!decoration) {
        throw new Error(`“${name}” is missing from the current decoration catalog.`);
      }
      return decoration;
    })
    .sort((left, right) => right.slotSize - left.slotSize);

  for (const decoration of resolvedDecorations) {
    const slot = openSlots
      .filter((candidate) => candidate.size >= decoration.slotSize)
      .sort((left, right) => left.size - right.size)[0];
    if (!slot) {
      throw new Error(`No equipment slot can hold “${decoration.name}”.`);
    }

    const piece = composition[slot.position];
    if (!piece) throw new Error("Optimizer result contains an empty decorated slot.");
    piece.decorations ??= [];
    piece.decorations.push({
      slotIndex: slot.slotIndex,
      decorationId: decoration.id,
    });
    openSlots.splice(openSlots.indexOf(slot), 1);
  }

  return {
    name: resultName(selected, resultNumber),
    description: "Saved from a Seikret Sauce optimizer result.",
    isShared: false,
    composition,
  };
}
