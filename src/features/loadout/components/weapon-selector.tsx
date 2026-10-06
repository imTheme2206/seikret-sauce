import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";

type WeaponSelectorProps = {
  controller: LoadoutOptimizerController;
  disabled?: boolean;
};

const NONE = "__none__";

/** Starting Set/Group Skill pieces the optimizer should count from the weapon. */
export const WeaponSelector = ({
  controller: c,
  disabled = false,
}: WeaponSelectorProps) => (
  <section aria-label="Weapon skills" className="min-w-0 space-y-2">
    <div>
      <Typography as="h2" className="text-sm font-medium text-foreground">
        Weapon
      </Typography>
      <Typography as="p" className="mt-0.5 text-xs text-muted-foreground">
        Choose Set or Group Skills the weapon contributes as starting pieces.
      </Typography>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="min-w-0 space-y-1.5">
        <Typography as="span" className="text-xs text-muted-foreground">
          Set Skill
        </Typography>
        <Select
          value={c.weaponSkills.set ?? NONE}
          onValueChange={(value) => c.setWeaponSkill("set", value === NONE ? null : value)}
          disabled={disabled || c.weaponBonusOptions.set.length === 0}
        >
          <SelectTrigger aria-label="Weapon Set Skill" className="w-full">
            <SelectValue placeholder="No Set Skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>No Set Skill</SelectItem>
            {c.weaponBonusOptions.set.map((skill) => (
              <SelectItem key={skill.name} value={skill.name}>
                {skill.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="min-w-0 space-y-1.5">
        <Typography as="span" className="text-xs text-muted-foreground">
          Group Skill
        </Typography>
        <Select
          value={c.weaponSkills.group ?? NONE}
          onValueChange={(value) => c.setWeaponSkill("group", value === NONE ? null : value)}
          disabled={disabled || c.weaponBonusOptions.group.length === 0}
        >
          <SelectTrigger aria-label="Weapon Group Skill" className="w-full">
            <SelectValue placeholder="No Group Skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>No Group Skill</SelectItem>
            {c.weaponBonusOptions.group.map((skill) => (
              <SelectItem key={skill.name} value={skill.name}>
                {skill.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  </section>
);
