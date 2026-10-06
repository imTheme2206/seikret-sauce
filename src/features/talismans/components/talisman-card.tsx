import { DecorationSlotIcon } from "@/components/gear/decoration-slot-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { CATEGORY_CONFIG } from "@/features/loadout/config";
import type { CatalogSkill } from "@/features/skills/skill-catalog";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { SlotIcon } from "@/components/gear/slot-icon";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CustomTalisman, TalismanSlot } from "../types";

type TalismanCardProps = {
  talisman: CustomTalisman;
  skillMetaById: ReadonlyMap<string, CatalogSkill> | undefined;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

/** One saved custom talisman: name, its skills with level gauges, and its decoration slots. */
export const TalismanCard = ({
  talisman,
  skillMetaById,
  onDelete,
  isDeleting,
}: TalismanCardProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <Card className="min-w-0 gap-0 rounded-sm border-border bg-card py-0 shadow-none transition-colors hover:border-gold/60">
      <CardHeader className="flex-row items-center gap-3 border-b border-border px-4 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-sm border border-primary/25 bg-primary/[.06]" aria-hidden="true">
          <SlotIcon position="talisman" color="var(--primary)" size={18} />
        </span>
        <Typography as="h3" className="min-w-0 flex-1 truncate text-sm font-semibold" title={talisman.name}>
          {talisman.name}
        </Typography>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          aria-label={`Delete ${talisman.name}`}
          title="Delete talisman"
          disabled={isDeleting}
          onClick={() => setIsConfirmingDelete(true)}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </CardHeader>

      <CardContent className="flex min-h-36 flex-col gap-3 p-4">
        <ul className="flex flex-col gap-2.5" aria-label="Skills">
          {talisman.skills.map((skill) => {
            const meta = skillMetaById?.get(skill.skillId);
            const maxLevel = meta?.maxLevel ?? skill.level;
            return (
              <li key={skill.skillId} className="flex items-center gap-2">
                <SkillGlyph
                  icon={meta?.icon ?? null}
                  category={meta?.category ?? "armor"}
                  label=""
                  className="size-5"
                />
                <Typography as="span" className="min-w-0 flex-1 truncate text-sm">
                  {meta?.name ?? "Unknown skill"}
                </Typography>
                <LevelGauge
                  level={skill.level}
                  maxLevel={maxLevel}
                  color={CATEGORY_CONFIG[meta?.category ?? "armor"].color}
                />
                <Typography as="span" className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  Lv {skill.level}
                </Typography>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto border-t border-border pt-3">
          <SlotSummary slots={talisman.slots} />
        </div>
      </CardContent>

      <Dialog
        open={isConfirmingDelete}
        onOpenChange={(open) => {
          if (!isDeleting) setIsConfirmingDelete(open);
        }}
      >
        <DialogContent className="rounded-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{talisman.name}”?</DialogTitle>
            <DialogDescription>
              This permanently removes the talisman from your equipment box and
              can&apos;t be undone. Saved loadouts that use it will show it as
              missing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setIsConfirmingDelete(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => onDelete(talisman.id)}
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

/** Read-only version of the optimizer's level gauge. */
const LevelGauge = ({ level, maxLevel, color }: { level: number; maxLevel: number; color: string }) => (
  <span className="flex shrink-0 items-center gap-[3px]" aria-hidden="true">
    {Array.from({ length: maxLevel }, (_, i) => (
      <span
        key={i}
        className={i < level ? "h-1.5 w-2 rounded-[1px]" : "h-1.5 w-2 rounded-[1px] bg-level-empty"}
        style={i < level ? { background: color } : undefined}
      />
    ))}
  </span>
);

/** Decoration slots as in-game sockets, weapon slots first and labelled by type. */
const SlotSummary = ({ slots }: { slots: TalismanSlot[] }) => {
  if (slots.length === 0) {
    return <Typography className="text-xs text-muted-foreground">No decoration slots</Typography>;
  }

  const groups = (["weapon", "armor"] as const)
    .map((type) => ({ type, slots: slots.filter((slot) => slot.type === type) }))
    .filter((group) => group.slots.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {groups.map((group) => (
        <div key={group.type} className="flex items-center gap-1.5">
          <Typography as="span" className="text-xs text-muted-foreground">
            {group.type === "weapon" ? "Weapon" : "Armor"}
          </Typography>
          {group.slots.map((slot, i) => (
            <span key={i} title={`Level ${slot.size} ${group.type} slot`}>
              <DecorationSlotIcon level={slot.size} size={20} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
