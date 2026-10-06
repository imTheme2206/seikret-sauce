import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  DAMAGE_TYPES,
  formatMultiplier,
  isWeakPoint,
  partLabels,
  sortPartsBy,
  WEAK_POINT_THRESHOLD,
} from "../hitzone";
import type { DamageType, MonsterPart } from "../types";

type HitzoneTableProps = {
  parts: MonsterPart[];
  /** Id of the part currently targeted, if any. */
  selectedPartId: string | null;
  onSelectPart: (partId: string | null) => void;
};

/**
 * Per-part hitzones. The chosen damage type orders the rows (highest first)
 * and highlights weak points (>= 0.45) in its column.
 */
export const HitzoneTable = ({
  parts,
  selectedPartId,
  onSelectPart,
}: HitzoneTableProps) => {
  const [damageType, setDamageType] = useState<DamageType>("slash");
  const labels = useMemo(() => partLabels(parts), [parts]);
  const rows = useMemo(() => sortPartsBy(parts, damageType), [parts, damageType]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Typography as="div" className="text-xs font-medium text-muted-foreground">
          Sort and highlight by damage type
        </Typography>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={damageType}
          // Radix reports "" when the active item is clicked again; keep the current type.
          onValueChange={(next) => next && setDamageType(next as DamageType)}
          aria-label="Damage type"
          className="flex-wrap"
        >
          {DAMAGE_TYPES.map(({ type, label }) => (
            <ToggleGroupItem key={type} value={type} aria-label={label}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Part</TableHead>
            <TableHead className="text-right">HP</TableHead>
            {DAMAGE_TYPES.map(({ type, label }) => (
              <TableHead
                key={type}
                className={cn(
                  "text-right",
                  type === damageType && "text-primary",
                )}
                aria-sort={type === damageType ? "descending" : undefined}
              >
                {label}
              </TableHead>
            ))}
            <TableHead className="text-right">Target</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((part) => {
            const isSelected = part.id === selectedPartId;
            return (
              <TableRow
                key={part.id}
                data-state={isSelected ? "selected" : undefined}
              >
                <TableCell className="font-medium">{labels.get(part.id)}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {part.health ?? "-"}
                </TableCell>
                {DAMAGE_TYPES.map(({ type }) => {
                  const weak = type === damageType && isWeakPoint(part, type);
                  return (
                    <TableCell
                      key={type}
                      data-weak-point={weak ? "true" : undefined}
                      className={cn(
                        "text-right tabular-nums",
                        type === damageType && "bg-primary/5",
                        weak && "bg-primary/20 font-semibold text-primary",
                        !weak && part.multipliers[type] === 0 && "text-muted-foreground",
                      )}
                    >
                      {formatMultiplier(part.multipliers[type])}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    aria-pressed={isSelected}
                    aria-label={`Target ${labels.get(part.id)}`}
                    onClick={() => onSelectPart(isSelected ? null : part.id)}
                  >
                    {isSelected ? "Targeted" : "Target"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Typography className="text-xs text-muted-foreground">
        Highlighted cells are weak points: a multiplier of{" "}
        {formatMultiplier(WEAK_POINT_THRESHOLD)} or more for the selected damage type.
      </Typography>
    </div>
  );
};
