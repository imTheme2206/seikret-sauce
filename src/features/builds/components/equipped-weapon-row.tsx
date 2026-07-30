import { CircleSlash, Swords } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { GearSkillLine } from "./gear-skill-line";
import { HunterPanel } from "./hunter-panel";
import type { SnapshotWeapon } from "../types";

interface EquippedWeaponRowProps {
  weapon: SnapshotWeapon | null;
}

/**
 * Read-only counterpart of `WeaponBonusRow`, rendered from a saved snapshot.
 * A weapon contributes no piece or decorations (ADR-0012, backend) — only the
 * Set/Group Bonus names — so it reuses `GearSkillLine`'s bonus rendering with
 * an empty skill list rather than the armor-piece `EquippedGearRow` shape.
 */
export function EquippedWeaponRow({ weapon }: EquippedWeaponRowProps) {
  const bonuses = [weapon?.setBonus, weapon?.groupBonus].flatMap((bonus) =>
    bonus ? [{ name: bonus.name }] : [],
  );

  return (
    <HunterPanel className="grid min-h-28 sm:grid-cols-[145px_1fr]">
      <div className="flex items-center gap-3 border-b border-border bg-secondary/40 p-4 sm:border-b-0 sm:border-r">
        <div className="grid size-10 shrink-0 place-items-center border border-primary/30 bg-primary/[.08]">
          <Swords className="size-5 text-primary" />
        </div>
        <div>
          <Typography
            as="div"
            className="text-[9px] uppercase tracking-[.2em] text-muted-foreground"
          >
            Equipped
          </Typography>
          <Typography as="div" className="font-semibold">
            Weapon
          </Typography>
        </div>
      </div>

      {bonuses.length > 0 ? (
        <div className="p-4">
          <GearSkillLine skills={[]} bonuses={bonuses} />
        </div>
      ) : (
        <Typography
          as="div"
          className="flex items-center justify-center gap-2 p-4 text-xs uppercase tracking-[.16em] text-muted-foreground"
        >
          <CircleSlash className="size-3.5" /> No bonus contribution
        </Typography>
      )}
    </HunterPanel>
  );
}
