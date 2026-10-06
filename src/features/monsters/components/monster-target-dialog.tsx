import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { Crosshair, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { HitzoneTable } from "./hitzone-table";
import { MonsterOverview } from "./monster-overview";
import { MonsterPicker } from "./monster-picker";
import { useHuntTarget } from "../hooks/use-hunt-target";
import { useMonster, useMonsterList } from "../hooks/use-monsters";

/** Monster catalogue picker that keeps target selection inside the build flow. */
export const MonsterTargetDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
  const { target, selectMonster, selectPart } = useHuntTarget();
  const list = useMonsterList();
  const monsterId = list.monsters.some((item) => item.id === selectedMonsterId)
    ? selectedMonsterId
    : null;
  const { monster, isLoading, error } = useMonster(monsterId);

  useEffect(() => {
    if (open) setSelectedMonsterId(target?.monsterId ?? null);
  }, [open, target?.monsterId]);

  const commitPart = (partId: string | null) => {
    if (!partId || !monsterId) return;
    selectMonster(monsterId);
    selectPart(partId);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Crosshair className="size-4" />
        {target?.partId ? "Change target" : "Choose target"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-6xl flex-col gap-5 overflow-hidden p-5 sm:p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-display">Choose a target</DialogTitle>
            <DialogDescription>
              Pick a monster and one of its parts to calculate effective damage.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
            <MonsterPicker
              monsters={list.monsters}
              value={monsterId}
              isLoading={list.isLoading}
              onChange={setSelectedMonsterId}
            />

            {(list.error || error) && (
              <EmptyState
                tone="error"
                icon={TriangleAlert}
                title="Could not load monster data"
                description="The Guild archive is unreachable. Try again in a moment."
                compact
              />
            )}

            {!list.error && !monsterId && !list.isLoading && (
              <EmptyState
                icon={Crosshair}
                title="Choose a monster"
                description="Select a monster above to review its weaknesses and choose a part."
                compact
              />
            )}

            {monsterId && isLoading && <Skeleton className="h-72 w-full" />}

            {monster && (
              <>
                <MonsterOverview monster={monster} />
                <section className="rounded-sm border">
                  <div className="border-b p-4">
                    <Typography as="h3" className="font-display text-base font-semibold">
                      Hitzones
                    </Typography>
                    <Typography className="mt-1 text-sm text-muted-foreground">
                      Choose a part to use its damage multipliers in the build.
                    </Typography>
                  </div>
                  <div className="overflow-x-auto p-4">
                    <HitzoneTable
                      parts={monster.parts}
                      selectedPartId={
                        target?.monsterId === monsterId ? target.partId : null
                      }
                      onSelectPart={commitPart}
                    />
                  </div>
                </section>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
