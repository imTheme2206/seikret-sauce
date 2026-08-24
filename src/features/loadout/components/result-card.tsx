import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, LogIn, Save } from "lucide-react";
import type { LoadoutResult } from "../types";
import { statsSummary } from "../utils";
import { ArmorChip } from "./armor-chip";
import { DecorationList } from "./decoration-list";
import { DefenseStats } from "./defense-stats";
import { SkillBreakdown } from "./skill-breakdown";

type ResultCardProps = {
  result: LoadoutResult;
  index: number;
  isExpanded: boolean;
  requestedNames: Set<string>;
  onToggle: () => void;
  isSignedIn: boolean;
  isSaving: boolean;
  saveDisabled: boolean;
  onSave: () => Promise<void>;
};

/** A single optimised loadout, expandable to reveal decorations + skills. */
export const ResultCard = ({
  result,
  index,
  isExpanded,
  requestedNames,
  onToggle,
  isSignedIn,
  isSaving,
  saveDisabled,
  onSave,
}: ResultCardProps) => {
  const skillCount = Object.keys(result.skills).length;
  const setGroupSkills = { ...result.setSkills, ...result.groupSkills };
  const hasSetGroup = Object.keys(setGroupSkills).length > 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} asChild>
      <Card className="shrink-0 gap-0 overflow-hidden rounded-none border-x-0 border-t-0 border-b-border bg-transparent py-0 shadow-none first:border-t">
        <CollapsibleTrigger
          className={cn(
            "flex min-h-24 w-full items-center gap-3 px-1 py-3 text-left transition-colors",
            isExpanded ? "bg-foreground/[0.025]" : "hover:bg-foreground/[0.025]",
          )}
        >
          <div className="flex w-7 shrink-0 items-center justify-center">
            <Typography as="span" className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </Typography>
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
          <div className="flex flex-col gap-1">
            {statsSummary(skillCount, result.decoNames.length, result.defense)
              .split("·")
              .map((char, i) => (
                <Typography
                  as="div"
                  className="ml-1.5 shrink-0 whitespace-nowrap text-xs text-muted-foreground"
                  key={i}
                >
                  {char}
                </Typography>
              ))}
          </div>

          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-4 border-t border-border/70 px-10 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.1fr]">
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
            <div className="flex justify-end border-t border-border/70 pt-4">
              <Button
                type="button"
                size="sm"
                disabled={saveDisabled}
                onClick={() => void onSave()}
                className="rounded-sm shadow-none"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isSignedIn ? (
                  <Save className="size-4" />
                ) : (
                  <LogIn className="size-4" />
                )}
                {isSaving
                  ? "Saving…"
                  : isSignedIn
                    ? "Add to My Loadouts"
                    : "Sign in to save"}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
