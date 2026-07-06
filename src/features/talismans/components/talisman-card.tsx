import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import type { CustomTalisman } from "../types";

interface TalismanCardProps {
  talisman: CustomTalisman;
  skillNamesById: Map<string, string>;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

/** One saved custom talisman: name, its skills, and its decoration slots. */
export function TalismanCard({
  talisman,
  skillNamesById,
  onDelete,
  isDeleting,
}: TalismanCardProps) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="flex-row items-center justify-between gap-2 px-4">
        <CardTitle className="text-sm">{talisman.name}</CardTitle>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isDeleting}
          onClick={() => onDelete(talisman.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4">
        <div className="flex flex-wrap gap-1.5">
          {talisman.skills.map((s) => (
            <Badge key={s.skillId} variant="secondary">
              {skillNamesById.get(s.skillId) ?? s.skillId} Lv.{s.level}
            </Badge>
          ))}
        </div>
        {talisman.slots.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {talisman.slots.map((slot, i) => (
              <Badge key={i} variant="outline">
                {slot.type} Lv.{slot.size}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
