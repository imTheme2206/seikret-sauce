import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Typography } from "@/components/ui/typography";
import { EditorWeaponCard } from "@/features/builds/components/editor-weapon-card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";

type WeaponSelectorProps = {
  controller: LoadoutOptimizerController;
  /** Stack the weapon card in a single column, for narrow containers such as the drawer. */
  compact?: boolean;
  disabled?: boolean;
};

/**
 * The equipped weapon, reusing the Build Editor's weapon card (type, weapon,
 * Artian / Gogma Artian customization). A Gogma Artian's rolled Set/Group Bonus
 * each count as one Pre-owned Piece in the search (`initialSetCounts` /
 * `initialGroupCounts`) and the weapon is carried into a saved result. Other
 * weapons contribute no pieces. Collapsed it shows a one-line summary so the
 * skill pool keeps its room.
 */
export const WeaponSelector = ({
  controller: c,
  compact = false,
  disabled = false,
}: WeaponSelectorProps) => {
  const [open, setOpen] = useState(false);
  const name = c.weaponRow.weapon?.name;
  const { set, group } = c.weaponSkills;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="min-w-0">
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="group h-auto min-h-11 w-full justify-between gap-3 rounded-sm px-3 py-2 text-left font-normal whitespace-normal"
        >
          <span className="min-w-0 flex-1">
            <Typography
              as="span"
              className="block text-sm font-medium text-foreground"
            >
              Weapon
            </Typography>
            <Typography
              as="span"
              className="block break-words text-xs text-muted-foreground"
            >
              {name ?? "No weapon equipped"}
            </Typography>
            {(set || group) && (
              <span className="mt-1.5 flex flex-wrap gap-1.5">
                {set && <Badge variant="secondary">Set: {set}</Badge>}
                {group && <Badge variant="secondary">Group: {group}</Badge>}
              </span>
            )}
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        <Typography as="p" className="text-xs text-muted-foreground">
          A Gogma Artian&apos;s Set and Group Bonus each count as one piece
          toward that skill. Weapon skills are not counted toward your skill
          targets.
        </Typography>
        <div className={compact ? "max-h-[55dvh] overflow-y-auto" : undefined}>
          <EditorWeaponCard
            row={c.weaponRow}
            selection={c.weapon}
            setBonusOptions={c.weaponBonusOptions.set}
            groupBonusOptions={c.weaponBonusOptions.group}
            compact={compact}
            onKindChange={c.setWeaponKind}
            onSelect={c.setWeapon}
            onCustomize={c.setWeaponCustomization}
            onBonus={c.setWeaponBonus}
          />
        </div>
        {c.weaponProblem && (
          <Typography as="p" role="alert" className="text-xs text-destructive">
            {c.weaponProblem}
          </Typography>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
