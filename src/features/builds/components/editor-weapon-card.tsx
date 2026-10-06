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
  ArtianCustomization,
  DecorationAssignment,
  EditorWeaponRow,
  EditorWeaponSelection,
  WeaponKind,
} from "../types";
import { ArtianCustomizationPanel } from "./artian-customization-panel";
import { DecorationSlotGrid } from "./decoration-slot-grid";
import { GearPicker } from "./gear-picker";
import { HunterPanel } from "./hunter-panel";
import { RarityPips } from "./rarity-pips";
import type { BonusOption } from "./weapon-bonus-row";

type EditorWeaponCardProps = {
  row: EditorWeaponRow;
  /** The draft's weapon selection, for a Gogma Artian's rolled bonuses. */
  selection: EditorWeaponSelection;
  setBonusOptions: BonusOption[];
  groupBonusOptions: BonusOption[];
  onKindChange: (kind: WeaponKind) => void;
  onSelect: (weaponId: string) => void;
  /** Omit to show the weapon's slots read-only (the optimizer does not seat jewels in the weapon). */
  onDecoration?: (assignment: DecorationAssignment) => void;
  /** Stack the weapon picker above its stats at any width, for narrow containers. */
  compact?: boolean;
  /** The forge page edits rolls; build editors apply saved rolls as presets. */
  customizationEditable?: boolean;
  /** Artian bases must enter the build through the saved weapon preset picker. */
  excludedWeaponIds?: string[];
  /** Saved preset name when the equipped build snapshot matches a preset. */
  selectedName?: string;
  onCustomize: (config: ArtianCustomization) => void;
  onBonus: (kind: "setBonusId" | "groupBonusId", bonusId: string | null) => void;
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

/** The weapon row: choose a weapon, then manage its build settings and decorations. */
export const EditorWeaponCard = ({
  row,
  selection,
  setBonusOptions,
  groupBonusOptions,
  onKindChange,
  onSelect,
  onDecoration,
  compact = false,
  customizationEditable = true,
  excludedWeaponIds = [],
  selectedName,
  onCustomize,
  onBonus,
}: EditorWeaponCardProps) => {
  const { weapon } = row;
  const excluded = new Set(excludedWeaponIds);
  const selectableGroups = row.groups
    .map((group) => ({
      ...group,
      options: group.options.filter(
        (option) =>
          !excluded.has(option.id) ||
          (option.id === weapon?.id && row.value === option.id),
      ),
    }))
    .filter((group) => group.options.length > 0);
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
          {selectedName ?? weapon?.name ?? `No ${kindLabel.toLowerCase()} equipped`}
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
    <HunterPanel
      className={cn(
        "grid",
        !compact && "md:grid-cols-[minmax(150px,.5fr)_minmax(300px,1.2fr)]",
      )}
    >
      <div
        className={cn(
          "min-w-0 space-y-3 border-b border-border p-4",
          !compact && "md:border-b-0 md:border-r",
          !compact && !weapon && "md:col-span-2 md:border-r-0",
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
            groups={selectableGroups}
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
        <div className="min-w-0 space-y-4 p-4 sm:p-5">
          {row.artian && customizationEditable && (
            <ArtianCustomizationPanel
              panel={row.artian}
              setBonusId={selection.setBonusId}
              groupBonusId={selection.groupBonusId}
              setBonusOptions={setBonusOptions}
              groupBonusOptions={groupBonusOptions}
              onChange={onCustomize}
              onBonus={onBonus}
            />
          )}
          <section aria-label="Weapon decoration slots">
            <Typography as="h3" className="mb-3 text-sm font-semibold text-foreground">
              Decoration slots
            </Typography>
            {onDecoration ? (
              <DecorationSlotGrid
                slots={row.slots}
                label="Weapon"
                onDecoration={onDecoration}
              />
            ) : (
              <Typography className="text-sm text-muted-foreground">
                {row.slots.length} available slots
              </Typography>
            )}
          </section>
        </div>
      )}
    </HunterPanel>
  );
};
