import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import TalismanSVG from "@/svg/TalismanSvg";
import { Loader2, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CatalogSkill } from "@/features/skills/skill-catalog";
import type { CustomTalisman } from "../types";
import { SlotSizeIcon, SlotTypeIcon } from "./talisman-icons";

type TalismanCardProps = {
  talisman: CustomTalisman;
  skillMetaById: ReadonlyMap<string, CatalogSkill> | undefined;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

/** One saved custom talisman: name, its skills, and its decoration slots. */
export const TalismanCard = ({
  talisman,
  skillMetaById,
  onDelete,
  isDeleting,
}: TalismanCardProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <Card className="gap-0 rounded-sm border-border py-0 shadow-none transition-colors hover:border-primary/40">
      <CardHeader className="flex-row items-center gap-3 border-b border-border bg-secondary/25 p-4">
        <span className="size-7 shrink-0 text-primary">
          <TalismanSVG color="currentColor" />
        </span>
        <CardTitle className="min-w-0 flex-1 truncate text-sm">
          {talisman.name}
        </CardTitle>
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
          <Trash2 />
        </Button>
      </CardHeader>
      <CardContent className="flex min-h-40 flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          {talisman.skills.map((s) => {
            const meta = skillMetaById?.get(s.skillId);
            return (
              <div key={s.skillId} className="flex items-center gap-2">
                <SkillGlyph
                  icon={meta?.icon ?? null}
                  category={meta?.category ?? "armor"}
                  label={meta?.name ?? s.skillId}
                  className="size-4"
                />
                <Typography
                  as="span"
                  className="min-w-0 flex-1 truncate text-sm"
                >
                  {meta?.name ?? s.skillId}
                </Typography>
                <Typography
                  as="span"
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  Lv.{s.level}
                </Typography>
              </div>
            );
          })}
        </div>
        <div className="mt-auto border-t border-border pt-3">
          {talisman.slots.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              {(["weapon", "armor"] as const)
                .map((type) => ({
                  type,
                  slots: talisman.slots.filter((s) => s.type === type),
                }))
                .filter((group) => group.slots.length > 0)
                .map((group, gi) => (
                  <div key={group.type} className="flex items-center gap-1.5">
                    {gi > 0 && <span className="mr-1 text-border">|</span>}
                    <SlotTypeIcon type={group.type} className="size-4" />
                    <span className="sr-only capitalize">
                      {group.type} slots
                    </span>
                    {group.slots.map((slot, i) => (
                      <SlotSizeIcon
                        key={i}
                        size={slot.size}
                        className="size-4"
                      />
                    ))}
                  </div>
                ))}
            </div>
          ) : (
            <Typography className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" />
              No decoration slots
            </Typography>
          )}
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
              This removes the talisman from your equipment box. Loadouts that
              reference it may no longer resolve correctly.
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
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {isDeleting ? "Deleting…" : "Delete talisman"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
