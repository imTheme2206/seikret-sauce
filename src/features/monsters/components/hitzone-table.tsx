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
import { ELEMENTS } from "@/lib/mh-wilds";
import { cn } from "@/lib/utils";
import { Crosshair, Heart } from "lucide-react";
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
import { DamageTypeIcon } from "./monster-type-icon";

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
          {DAMAGE_TYPES.map(({ type, label }) => {
            const element = ELEMENTS.find((entry) => entry.key === type);
            return (
              <ToggleGroupItem key={type} value={type} aria-label={label}>
                <DamageTypeIcon type={type} className="size-4 shrink-0" />
                <span style={element ? { color: element.color } : undefined}>{label}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Part</TableHead>
            <TableHead className="text-right">
              <span className="inline-flex items-center justify-end gap-1.5">
                <Heart className="size-3.5 shrink-0" aria-hidden="true" />
                HP
              </span>
            </TableHead>
            {DAMAGE_TYPES.map(({ type, label }) => {
              const element = ELEMENTS.find((entry) => entry.key === type);
              return (
                <TableHead
                  key={type}
                  className={cn(
                    "text-right",
                    type === damageType && "text-primary",
                  )}
                  aria-sort={type === damageType ? "descending" : undefined}
                >
                  <span className="inline-flex items-center justify-end gap-1.5">
                    <DamageTypeIcon type={type} className="size-3.5 shrink-0" />
                    <span style={element ? { color: element.color } : undefined}>
                      {label}
                    </span>
                  </span>
                </TableHead>
              );
            })}
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
                    <Crosshair className="size-3.5" aria-hidden="true" />
                    {isSelected ? "Targeted" : "Target"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Typography className="text-xs text-muted-foreground">
        <Crosshair className="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />
        Highlighted cells are weak points: a multiplier of{" "}
        {formatMultiplier(WEAK_POINT_THRESHOLD)} or more for the selected damage type.
      </Typography>
    </div>
  );
};
