import { SpecialEffectIcon } from "@/components/gear/stat-icons";
import { StatField } from "@/components/ui/stat-field";
import { Typography } from "@/components/ui/typography";
import { SPECIAL_EFFECTS } from "@/lib/mh-wilds";
import { cn } from "@/lib/utils";
import type { Weapon } from "../types";
import {
  formatAffinity,
  formatDamage,
  formatSpecial,
  titleCase,
} from "../weapon-rows";
import { GearSkillLine } from "./gear-skill-line";
import { SharpnessBar } from "./sharpness-bar";

type WeaponStatusDetailProps = {
  weapon: Weapon;
  className?: string;
  /** Saved weapon cards already show the weapon's name in their header. */
  showName?: boolean;
  /** Saved weapon cards show explicit empty values for ranged and elementless weapons. */
  showEmptyValues?: boolean;
  /** The saved weapon box includes skills; Hunter Status lists them in build totals. */
  showSkills?: boolean;
  bonuses?: { name: string; kind?: "set" | "group" }[];
  sharpnessBonus?: number;
};

const WeaponSpecial = ({ special }: { special: Weapon["specials"][number] }) => {
  const effect = SPECIAL_EFFECTS.find(
    (entry) => entry.key === special.name.toLowerCase(),
  );

  return (
    <span className="inline-flex items-center gap-1.5">
      {effect && <SpecialEffectIcon effect={effect} />}
      <span style={effect ? { color: effect.color } : undefined}>
        {effect ? `${effect.label} ` : ""}{formatSpecial(special)}
      </span>
    </span>
  );
};

/** Weapon facts shared by Hunter Status, forge previews, and the saved weapon box. */
export const WeaponStatusDetail = ({
  weapon,
  className,
  showName = true,
  showEmptyValues = false,
  showSkills = false,
  bonuses = [],
  sharpnessBonus = 0,
}: WeaponStatusDetailProps) => (
  <section aria-label="Weapon stats" className={cn("space-y-3", className)}>
    {showName && (
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Typography as="h3" className="font-display text-base font-semibold">
          {weapon.name}
        </Typography>
        {weapon.series && (
          <Typography className="text-xs text-muted-foreground">
            {weapon.series}
          </Typography>
        )}
      </div>
    )}
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
      <StatField label="Attack" valueClassName="font-semibold tabular-nums">
        {formatDamage(weapon)}
      </StatField>
      <StatField label="Affinity" valueClassName="font-semibold tabular-nums">
        {formatAffinity(weapon.affinity)}
      </StatField>
      {weapon.elderseal && (
        <StatField label="Elderseal">{titleCase(weapon.elderseal)}</StatField>
      )}
      {(weapon.specials.length > 0 || showEmptyValues) && (
        <StatField
          label="Element / status"
          className="col-span-2 sm:col-span-3"
          valueClassName="flex flex-wrap items-center gap-x-3 gap-y-1 font-medium"
        >
          {weapon.specials.length
            ? weapon.specials.map((special, index) => (
                <WeaponSpecial key={`${special.kind}-${special.name}-${index}`} special={special} />
              ))
            : "None"}
        </StatField>
      )}
      {weapon.defenseBonus > 0 && (
        <StatField label="Defense bonus">+{weapon.defenseBonus}</StatField>
      )}
    </dl>
    {(weapon.sharpness || showEmptyValues) && (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Typography as="h4" className="text-xs text-muted-foreground">
            Sharpness
          </Typography>
          {sharpnessBonus > 0 && (
            <Typography className="text-xs text-primary">
              +{sharpnessBonus} from reinforcement
            </Typography>
          )}
        </div>
        {weapon.sharpness ? (
          <SharpnessBar sharpness={weapon.sharpness} />
        ) : (
          <Typography className="text-xs text-muted-foreground">
            Not applicable
          </Typography>
        )}
      </div>
    )}
    {showSkills && (
      <div className="space-y-2">
        <Typography as="h4" className="text-xs font-medium">
          Skills &amp; bonuses
        </Typography>
        {weapon.skills.length > 0 || bonuses.length > 0 ? (
          <GearSkillLine skills={weapon.skills} bonuses={bonuses} stacked />
        ) : (
          <Typography className="text-xs text-muted-foreground">
            No weapon skills or bonuses
          </Typography>
        )}
      </div>
    )}
  </section>
);
