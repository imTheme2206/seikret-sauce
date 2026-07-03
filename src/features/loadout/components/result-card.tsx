import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { statsSummary } from "../utils";
import { ArmorChip } from "./armor-chip";
import { DecorationList } from "./decoration-list";
import { DefenseStats } from "./defense-stats";
import { SkillBreakdown } from "./skill-breakdown";
import type { LoadoutResult } from "../types";

interface ResultCardProps {
  result: LoadoutResult;
  index: number;
  isExpanded: boolean;
  requestedNames: Set<string>;
  onToggle: () => void;
}

/** A single optimised loadout, expandable to reveal decorations + skills. */
export function ResultCard({
  result,
  index,
  isExpanded,
  requestedNames,
  onToggle,
}: ResultCardProps) {
  const skillCount = Object.keys(result.skills).length;
  const setGroupSkills = { ...result.setSkills, ...result.groupSkills };
  const hasSetGroup = Object.keys(setGroupSkills).length > 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} asChild>
      <Card className="shrink-0 gap-0 overflow-hidden rounded-md border-border py-0 shadow-none">
        <CollapsibleTrigger
          className={cn(
            "flex min-h-20 w-full items-center gap-2.5 px-3 py-[9px] text-left transition-colors",
            isExpanded ? "bg-[hsl(24,12%,11%)]" : "hover:bg-[hsl(24,12%,11%)]",
          )}
        >
          <div className="flex size-[26px] shrink-0 items-center justify-center rounded-[4px] bg-secondary">
            <span className="font-serif text-[10px] font-bold text-primary">{index + 1}</span>
          </div>

          <div className="flex min-w-0 flex-1 gap-1 overflow-hidden">
            {result.armorNames.map((piece, slotIndex) => (
              <ArmorChip
                key={`${piece}:${slotIndex}`}
                piece={piece}
                slotIndex={slotIndex}
                rarity={result.rarities[slotIndex]}
              />
            ))}
          </div>

          <span className="ml-1.5 shrink-0 whitespace-nowrap text-[10px] text-muted-foreground">
            {statsSummary(skillCount, result.decoNames.length, result.defense)}
          </span>

          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-3.5 py-3">
            <div className="grid grid-cols-[1fr_1.1fr] gap-4">
              <DecorationList decorations={result.decoNames} />
              <SkillBreakdown
                skills={result.skills}
                setGroupSkills={hasSetGroup ? setGroupSkills : undefined}
                requestedNames={requestedNames}
              />
            </div>
            <DefenseStats
              defense={result.defense}
              elementalDefenses={result.elementalDefenses}
              freeSlots={result.freeSlots}
            />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
