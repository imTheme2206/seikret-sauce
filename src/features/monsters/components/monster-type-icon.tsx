import { ElementIcon, SpecialEffectIcon } from "@/components/gear/stat-icons";
import { ELEMENTS, SPECIAL_EFFECTS, type SpecialEffectConfig } from "@/lib/mh-wilds";
import { Crosshair, Hammer, Sparkles, Swords, Zap } from "lucide-react";
import type { DamageType, MonsterWeakness } from "../types";

type MonsterTypeIconProps = {
  className?: string;
};

const PHYSICAL_ICONS = {
  slash: Swords,
  blunt: Hammer,
  pierce: Crosshair,
  stun: Zap,
} as const;

const SPECIAL_EFFECT_ALIASES: Record<string, string> = {
  blastblight: "blast",
};

export const weaknessSpecialEffect = (
  name: string,
): SpecialEffectConfig | undefined => {
  const key = SPECIAL_EFFECT_ALIASES[name.toLowerCase()] ?? name.toLowerCase();
  return SPECIAL_EFFECTS.find((entry) => entry.key === key);
};

/** Game element art for elemental damage, and weapon glyphs for physical types. */
export const DamageTypeIcon = ({
  type,
  className,
}: MonsterTypeIconProps & { type: DamageType }) => {
  const element = ELEMENTS.find((entry) => entry.key === type);
  if (element) return <ElementIcon element={element} className={className} />;

  const Icon = PHYSICAL_ICONS[type as keyof typeof PHYSICAL_ICONS] ?? Crosshair;
  return <Icon className={className ?? "size-4 shrink-0"} aria-hidden="true" />;
};

/** Icon for a weakness entry; text labels remain visible beside every glyph. */
export const WeaknessIcon = ({
  weakness,
  className,
}: MonsterTypeIconProps & { weakness: MonsterWeakness }) => {
  const specialEffect = weaknessSpecialEffect(weakness.name);
  if (specialEffect)
    return <SpecialEffectIcon effect={specialEffect} className={className} />;

  const Icon = weakness.kind === "status" ? Zap : Sparkles;
  return <Icon className={className ?? "size-3.5 shrink-0"} aria-hidden="true" />;
};
