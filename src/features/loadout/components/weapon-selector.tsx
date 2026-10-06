import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import type { WeaponSkills } from "../types";

type WeaponSelectorProps = {
  /** The Set/Group Skills the equipped weapon contributes. */
  value: WeaponSkills;
  onChange: (kind: keyof WeaponSkills, name: string | null) => void;
  /** Set/Group Skill names a weapon may carry. */
  options: { set: string[]; group: string[] };
  disabled?: boolean;
};

/** Sentinel for "none" — Radix Select forbids an empty-string item value. */
const NONE = "__none__";

/** One labelled Select for a single kind of weapon skill contribution. */
const SkillSelect = ({
  label,
  placeholder,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  options: string[];
  disabled?: boolean;
  onChange: (name: string | null) => void;
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Typography
        as="span"
        className="shrink-0 text-xs font-medium text-muted-foreground"
      >
        {label}
      </Typography>
      <Select
        value={value ?? NONE}
        onValueChange={(v) => onChange(v === NONE ? null : v)}
        disabled={disabled}
      >
        <SelectTrigger
          size="sm"
          aria-label={`${label} weapon skill`}
          className="h-9 min-w-0 flex-1 text-sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{placeholder}</SelectItem>
          {options.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

/**
 * Picks the Set and Group Skills the player's equipped weapon already provides —
 * its Pre-owned Piece Count. Feeds `initialSetCounts`/`initialGroupCounts` on
 * search. The two kinds are independent fields.
 */
export const WeaponSelector = ({
  value,
  onChange,
  options,
  disabled,
}: WeaponSelectorProps) => (
  <div className="grid min-w-0 grid-cols-1 items-center gap-3 min-[420px]:grid-cols-2 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
    <div className="min-[420px]:col-span-2 sm:col-span-1">
      <Typography as="span" className="block text-sm font-medium text-foreground">
        Weapon bonus
      </Typography>
      <Typography as="span" className="block text-xs text-muted-foreground">
        Counts as one piece toward that skill
      </Typography>
    </div>
    <SkillSelect
      label="Set"
      placeholder="No set skill"
      value={value.set}
      options={options.set}
      disabled={disabled}
      onChange={(name) => onChange("set", name)}
    />
    <SkillSelect
      label="Group"
      placeholder="No group skill"
      value={value.group}
      options={options.group}
      disabled={disabled}
      onChange={(name) => onChange("group", name)}
    />
  </div>
);
