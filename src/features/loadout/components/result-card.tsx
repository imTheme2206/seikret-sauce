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
      <Card className="gap-0 overflow-hidden rounded-md border border-border bg-card/30 py-0 shadow-none">
        <CollapsibleTrigger
          className={cn(
            "flex min-h-28 w-full flex-wrap items-center gap-4 px-4 py-4 text-left transition-colors md:flex-nowrap md:px-5",
            isExpanded ? "bg-primary/[0.045]" : "hover:bg-foreground/[0.035]",
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/60">
            <Typography as="span" className="text-xs font-semibold tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </Typography>
          </div>

          <div className="order-3 flex min-w-0 w-full flex-1 gap-1 overflow-hidden md:order-none">
            {result.armorNames.map((piece, slotIndex) => (
              <ArmorChip
                key={`${piece}:${slotIndex}`}
                piece={piece}
                slotIndex={slotIndex}
                rarity={result.rarities[slotIndex]}
              />
            ))}
          </div>
          <div className="ml-auto flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground md:ml-0 md:w-36 md:flex-col md:gap-1">
            <span>{skillCount} skills</span>
            <span>{result.decoNames.length} decorations</span>
            <span><strong className="font-semibold tabular-nums text-foreground">{result.defense}</strong> base defense</span>
          </div>

          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-5 border-t border-border px-5 py-5 md:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
                className="shadow-none"
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
