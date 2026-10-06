import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Search, Swords } from "lucide-react";
import { WEAPON_KINDS, weaponKindConfig } from "../config";
import type {
  DecorationAssignment,
  EditorWeaponRow,
  Weapon,
  WeaponKind,
} from "../types";
import {
  formatAffinity,
  formatDamage,
  formatSpecial,
  titleCase,
} from "../weapon-rows";
import { DecorationSlotGrid } from "./decoration-slot-grid";
import { GearPicker } from "./gear-picker";
import { GearSkillLine } from "./gear-skill-line";
import { HunterPanel } from "./hunter-panel";
import { RarityPips } from "./rarity-pips";
import { SharpnessBar } from "./sharpness-bar";
import { SlotPips } from "./slot-pips";

type EditorWeaponCardProps = {
  row: EditorWeaponRow;
  onKindChange: (kind: WeaponKind) => void;
  onSelect: (weaponId: string) => void;
  onDecoration: (assignment: DecorationAssignment) => void;
};

const WeaponImage = ({
  kind,
  className,
}: {
  kind: WeaponKind;
  className?: string;
}) => {
  const config = weaponKindConfig(kind);
  return (
    <img
      src={config.image}
      alt=""
      aria-hidden="true"
      className={cn("size-6 object-contain", className)}
    />
  );
};

type StatProps = {
  label: string;
  children: React.ReactNode;
};

const Stat = ({ label, children }: StatProps) => (
  <div className="min-w-0">
    <Typography as="dt" className="text-xs text-muted-foreground">
      {label}
    </Typography>
    <Typography as="dd" className="mt-0.5 text-sm font-medium tabular-nums">
      {children}
    </Typography>
  </div>
);

type WeaponStatsProps = {
  weapon: Weapon;
  slots: EditorWeaponRow["slots"];
  onDecoration: (assignment: DecorationAssignment) => void;
};

const WeaponStats = ({ weapon, slots, onDecoration }: WeaponStatsProps) => (
  <div className="min-w-0 space-y-4 p-4 sm:p-5">
    <section aria-label="Weapon stats">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Stat label="Raw (display)">{formatDamage(weapon)}</Stat>
        <Stat label="Affinity">{formatAffinity(weapon.affinity)}</Stat>
        <Stat label="Element / status">
          {weapon.specials.length > 0
            ? weapon.specials.map(formatSpecial).join(", ")
            : "None"}
        </Stat>
        {weapon.elderseal && (
          <Stat label="Elderseal">{titleCase(weapon.elderseal)}</Stat>
        )}
        {weapon.defenseBonus > 0 && (
          <Stat label="Defense bonus">+{weapon.defenseBonus}</Stat>
        )}
        {weapon.series && <Stat label="Series">{weapon.series}</Stat>}
      </dl>
    </section>

    {weapon.sharpness && (
      <section aria-label="Sharpness" className="space-y-1.5">
        <Typography as="h3" className="text-sm font-semibold text-foreground">
          Sharpness
        </Typography>
        <SharpnessBar sharpness={weapon.sharpness} />
      </section>
    )}

    <section
      aria-label="Weapon decoration slots"
      className="border-t border-border pt-4"
    >
      <Typography
        as="h3"
        className="mb-3 text-sm font-semibold text-foreground"
      >
        Decoration slots
      </Typography>
      {slots.length > 0 ? (
        <DecorationSlotGrid
          slots={slots}
          label="Weapon"
          onDecoration={onDecoration}
        />
      ) : (
        <SlotPips slots={weapon.slots} />
      )}
    </section>

    <section aria-label="Weapon skills" className="border-t border-border pt-4">
      <Typography as="h3" className="text-sm font-semibold text-foreground">
        Weapon skills
      </Typography>
      {weapon.skills.length > 0 ? (
        <GearSkillLine
          skills={weapon.skills}
          bonuses={[]}
          stacked
          className="mt-2"
        />
      ) : (
        <Typography className="mt-2 text-sm text-muted-foreground">
          No skills on this weapon.
        </Typography>
      )}
    </section>
  </div>
);

/** The weapon row: pick a weapon type, then a weapon of that type, and see its base stats. */
export const EditorWeaponCard = ({
  row,
  onKindChange,
  onSelect,
  onDecoration,
}: EditorWeaponCardProps) => {
  const { weapon } = row;
  const kindLabel = row.kind ? weaponKindConfig(row.kind).label : "weapon";

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      aria-label={`${weapon ? "Change" : "Browse"} ${kindLabel.toLowerCase()}`}
      className="h-auto min-h-20 w-full items-start justify-start gap-3 whitespace-normal rounded-sm border border-border/70 p-3 text-left font-normal hover:bg-accent/60"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-primary/25 bg-primary/[.08]">
        {row.kind ? (
          <WeaponImage kind={row.kind} className="size-7" />
        ) : (
          <Swords className="size-5 text-primary" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <Typography
          as="span"
          className="block break-words text-sm font-semibold leading-snug text-foreground"
        >
          {weapon?.name ?? `No ${kindLabel.toLowerCase()} equipped`}
        </Typography>
        {weapon && (
          <span className="mt-1.5 block">
            <RarityPips value={weapon.rarity} />
          </span>
        )}
        <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
          <Search className="size-3.5" aria-hidden="true" />
          {weapon ? "Change weapon" : "Browse weapons"}
        </span>
      </span>
    </Button>
  );

  return (
    <HunterPanel className="grid md:grid-cols-[minmax(150px,.5fr)_minmax(300px,1.2fr)]">
      <div
        className={cn(
          "min-w-0 space-y-3 border-b border-border p-4 md:border-b-0 md:border-r",
          !weapon && "md:col-span-2 md:border-r-0",
        )}
      >
        <div>
          <Typography
            as="div"
            className="mb-1.5 text-xs text-muted-foreground"
          >
            Weapon type
          </Typography>
          <Select
            value={row.kind ?? ""}
            onValueChange={(value) => onKindChange(value as WeaponKind)}
          >
            <SelectTrigger
              aria-label="Weapon type"
              className="w-full rounded-none bg-background/70"
            >
              <SelectValue placeholder="Choose a weapon type" />
            </SelectTrigger>
            <SelectContent>
              {WEAPON_KINDS.map((config) => (
                <SelectItem key={config.kind} value={config.kind}>
                  <WeaponImage kind={config.kind} className="size-4" />
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {row.kind ? (
          <GearPicker
            value={row.value}
            groups={row.groups}
            placeholder={`Select ${kindLabel.toLowerCase()}`}
            emptyLabel="Unequip weapon"
            searchPlaceholder={`Search ${kindLabel.toLowerCase()}, skill or element…`}
            ariaLabel={`Select ${kindLabel}`}
            renderIcon={() => <WeaponImage kind={row.kind!} />}
            onChange={onSelect}
            trigger={trigger}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled
            className="h-auto min-h-20 w-full justify-start rounded-sm p-3 text-left"
          >
            <Swords className="size-5" aria-hidden="true" />
            Choose a weapon type first
          </Button>
        )}
      </div>

      {weapon && (
        <WeaponStats
          weapon={weapon}
          slots={row.slots}
          onDecoration={onDecoration}
        />
      )}
    </HunterPanel>
  );
};
