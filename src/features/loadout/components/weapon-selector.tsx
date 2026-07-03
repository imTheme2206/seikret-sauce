import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WeaponSkills } from "../types";

interface WeaponSelectorProps {
  /** The Set/Group Skills the equipped weapon contributes. */
  value: WeaponSkills;
  onChange: (kind: keyof WeaponSkills, name: string | null) => void;
  /** Set/Group Skill names a weapon may carry. */
  options: { set: string[]; group: string[] };
  disabled?: boolean;
}

/** Sentinel for "none" — Radix Select forbids an empty-string item value. */
const NONE = "__none__";

/** One labelled Select for a single kind of weapon skill contribution. */
function SkillSelect({
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
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 shrink-0 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <Select
        value={value ?? NONE}
        onValueChange={(v) => onChange(v === NONE ? null : v)}
        disabled={disabled}
      >
        <SelectTrigger size="sm" className="h-7 flex-1 text-[11px]">
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
}

/**
 * Picks the Set and Group Skills the player's equipped weapon already provides —
 * its Pre-owned Piece Count. Feeds `initialSetCounts`/`initialGroupCounts` on
 * search. The two kinds are independent fields.
 */
export function WeaponSelector({
  value,
  onChange,
  options,
  disabled,
}: WeaponSelectorProps) {
  // Skill names shown in the collapsed header so the selection stays visible.
  const summary = [value.set, value.group].filter(Boolean).join(", ");

  return (
    <Accordion
      type="single"
      collapsible
      className="shrink-0 rounded-md border border-border bg-card px-3"
    >
      <AccordionItem value="weapon" className="border-b-0">
        <AccordionTrigger className="group items-center gap-2 py-2 text-[11px] font-medium text-muted-foreground hover:no-underline">
          <span className="shrink-0">Weapon Setting</span>
          {summary && (
            <span className="min-w-0 flex-1 truncate text-right font-normal text-foreground/80 group-data-[state=open]:hidden">
              {summary}
            </span>
          )}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1.5 pb-3">
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
