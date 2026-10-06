import { CircleSlash, Swords } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { GearSkillLine } from "./gear-skill-line";
import { HunterPanel } from "./hunter-panel";
import type { SnapshotWeapon } from "../types";

type EquippedWeaponRowProps = {
  weapon: SnapshotWeapon | null;
};

const WeaponBonusSummary = ({ weapon }: EquippedWeaponRowProps) => {
  const bonuses = [weapon?.setBonus, weapon?.groupBonus].flatMap((bonus) =>
    bonus ? [{ name: bonus.name }] : [],
  );

  return bonuses.length > 0 ? (
    <GearSkillLine skills={[]} bonuses={bonuses} />
  ) : (
    <Typography
      as="div"
      className="flex items-center gap-2 text-xs uppercase tracking-[.16em] text-muted-foreground"
    >
      <CircleSlash className="size-3.5" /> No bonus contribution
    </Typography>
  );
};

/**
 * Read-only counterpart of `WeaponBonusRow`, rendered from a saved snapshot.
 * A weapon contributes no piece or decorations (ADR-0012, backend) — only the
 * Set/Group Bonus names — so it reuses `GearSkillLine`'s bonus rendering with
 * an empty skill list rather than the armor-piece `EquippedGearRow` shape.
 */
export const EquippedWeaponRow = ({ weapon }: EquippedWeaponRowProps) => {
  return (
    <HunterPanel className="grid min-h-28 sm:grid-cols-[145px_1fr]">
      <div className="flex items-center gap-3 border-b border-border bg-secondary/40 p-4 sm:border-b-0 sm:border-r">
        <div className="grid size-10 shrink-0 place-items-center border border-primary/30 bg-primary/[.08]">
          <Swords className="size-5 text-primary" />
        </div>
        <div>
          <Typography
            as="div"
            className="text-[11px] uppercase tracking-[.2em] text-muted-foreground"
          >
            Equipped
          </Typography>
          <Typography as="div" className="font-semibold">
            Weapon
          </Typography>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 sm:justify-start">
        <WeaponBonusSummary weapon={weapon} />
      </div>
    </HunterPanel>
  );
};

/** Compact saved-weapon presentation used inside the expanded Build card. */
export const EquippedWeaponCell = ({ weapon }: EquippedWeaponRowProps) => {
  return (
    <div className="flex min-h-24 gap-3 bg-card p-3 sm:col-span-2">
      <div className="grid size-9 shrink-0 place-items-center border border-primary/25 bg-primary/[.06]">
        <Swords className="size-[18px] text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <Typography
          as="div"
          className="text-[11px] uppercase tracking-[.18em] text-muted-foreground"
        >
          Equipped
        </Typography>
        <Typography as="div" className="mt-0.5 text-sm font-medium">
          Weapon
        </Typography>
        <div className="mt-2">
          <WeaponBonusSummary weapon={weapon} />
        </div>
      </div>
    </div>
  );
};
