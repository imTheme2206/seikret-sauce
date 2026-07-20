import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import TalismanSVG from "@/svg/TalismanSvg";
import { Trash2 } from "lucide-react";
import type { CustomTalisman } from "../types";
import type { SkillMeta } from "./talismans-tab";
import { SkillIcon, SlotSizeIcon } from "./talisman-icons";

interface TalismanCardProps {
  talisman: CustomTalisman;
  skillMetaById: Map<string, SkillMeta>;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

/** One saved custom talisman: name, its skills, and its decoration slots. */
export function TalismanCard({
  talisman,
  skillMetaById,
  onDelete,
  isDeleting,
}: TalismanCardProps) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="flex-row items-center gap-2 px-4">
        <span className="size-6 shrink-0 text-primary">
          <TalismanSVG color="currentColor" />
        </span>
        <CardTitle className="min-w-0 flex-1 truncate text-sm">
          {talisman.name}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isDeleting}
          onClick={() => onDelete(talisman.id)}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 px-4">
        <div className="flex flex-col gap-1.5">
          {talisman.skills.map((s) => {
            const meta = skillMetaById.get(s.skillId);
            return (
              <div key={s.skillId} className="flex items-center gap-2">
                <SkillIcon
                  icon={meta?.icon ?? null}
                  category={meta?.category ?? "armor"}
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
        {talisman.slots.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {(["weapon", "armor"] as const)
              .map((type) => ({
                type,
                slots: talisman.slots.filter((s) => s.type === type),
              }))
              .filter((group) => group.slots.length > 0)
              .map((group, gi) => (
                <div key={group.type} className="flex items-center gap-1.5">
                  {gi > 0 && <span className="text-border">|</span>}
                  <span className="capitalize">{group.type}</span>
                  {group.slots.map((slot, i) => (
                    <SlotSizeIcon key={i} size={slot.size} className="size-4" />
                  ))}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
