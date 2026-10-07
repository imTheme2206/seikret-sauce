import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { Swords } from "lucide-react";
import type { EditorWeaponSelection, SkillCatalog } from "../types";
import { HunterPanel } from "./hunter-panel";

/** Sentinel for "none" — Radix Select forbids an empty-string item value. */
const NONE = "__none__";

export type BonusOption = SkillCatalog["bonuses"][number];

type WeaponBonusRowProps = {
  value: EditorWeaponSelection;
  setBonusOptions: BonusOption[];
  groupBonusOptions: BonusOption[];
  onChange: (
    kind: "setBonusId" | "groupBonusId",
    bonusId: string | null,
  ) => void;
};

/** One labelled Select for a single kind of weapon bonus contribution, by id. */
export const BonusSelect = ({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  options: BonusOption[];
  onChange: (bonusId: string | null) => void;
}) => {
  return (
    <label className="block">
      <Typography
        as="span"
        className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </Typography>
      <Select
        value={value ?? NONE}
        onValueChange={(v) => onChange(v === NONE ? null : v)}
      >
        <SelectTrigger className="w-full rounded-none bg-background/70">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{placeholder}</SelectItem>
          {options.map((bonus) => (
            <SelectItem key={bonus.id} value={bonus.id}>
              {bonus.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
};

/**
 * Editable bonus-only weapon row. A Gogma Artian's rolled bonuses now live in
 * its customization panel (backend ADR-0014); this row only remains for a
 * bonus-only selection with no catalog weapon (a legacy saved build or an
 * optimizer import), so it can still be read and cleared. It selects catalog
 * bonuses by id (the composition's currency) instead of by name (the
 * optimizer's `WeaponSkills` currency).
 */
export const WeaponBonusRow = ({
  value,
  setBonusOptions,
  groupBonusOptions,
  onChange,
}: WeaponBonusRowProps) => {
  return (
    <HunterPanel className="grid md:grid-cols-[150px_minmax(220px,.8fr)_minmax(300px,1.2fr)]">
      <div className="flex items-center gap-3 border-b border-border bg-secondary/40 p-4 md:border-b-0 md:border-r">
        <div className="grid size-10 shrink-0 place-items-center border border-primary/30 bg-primary/[.08]">
          <Swords className="size-5 text-primary" />
        </div>
        <div>
          <Typography
            as="div"
            className="text-[11px] uppercase tracking-[.2em] text-muted-foreground"
          >
            Equip
          </Typography>
          <Typography as="div" className="font-semibold">
            Weapon bonuses
          </Typography>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 md:col-span-2">
        <BonusSelect
          label="Set Bonus"
          placeholder="No set bonus"
          value={value.setBonusId}
          options={setBonusOptions}
          onChange={(bonusId) => onChange("setBonusId", bonusId)}
        />
        <BonusSelect
          label="Group Bonus"
          placeholder="No group bonus"
          value={value.groupBonusId}
          options={groupBonusOptions}
          onChange={(bonusId) => onChange("groupBonusId", bonusId)}
        />
      </div>
    </HunterPanel>
  );
};
