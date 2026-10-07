import { Typography } from "@/components/ui/typography";
import { SkillBonusSelect } from "@/features/skills/skill-bonus-select";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";

type WeaponSelectorProps = {
  controller: LoadoutOptimizerController;
  disabled?: boolean;
};

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
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0 space-y-1.5">
        <Typography as="div" className="text-xs text-muted-foreground">
          Set Skill
        </Typography>
        <SkillBonusSelect
          label="Weapon Set Skill"
          placeholder="No Set Skill"
          category="set"
          value={c.weaponSkills.set}
          options={c.weaponBonusOptions.set.map((skill) => ({
            value: skill.name,
            label: skill.name,
            icon: skill.icon,
          }))}
          onChange={(value) => c.setWeaponSkill("set", value)}
          disabled={disabled || c.weaponBonusOptions.set.length === 0}
        />
      </div>
      <div className="min-w-0 space-y-1.5">
        <Typography as="div" className="text-xs text-muted-foreground">
          Group Skill
        </Typography>
        <SkillBonusSelect
          label="Weapon Group Skill"
          placeholder="No Group Skill"
          category="group"
          value={c.weaponSkills.group}
          options={c.weaponBonusOptions.group.map((skill) => ({
            value: skill.name,
            label: skill.name,
            icon: skill.icon,
          }))}
          onChange={(value) => c.setWeaponSkill("group", value)}
          disabled={disabled || c.weaponBonusOptions.group.length === 0}
        />
      </div>
    </div>
  </section>
);
