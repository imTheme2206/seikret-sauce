import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ResultCard } from "./result-card";
import {
  ResultsEmptyState,
  ResultsErrorState,
  ResultsNoResultsState,
  ResultsSearchingState,
} from "./results-states";
import type { LoadoutResult, SearchError, SearchStatus } from "../types";

type ResultsPanelProps = {
  results: LoadoutResult[];
  status: SearchStatus;
  error: SearchError | null;
  expanded: Set<number>;
  requestedNames: Set<string>;
  onToggle: (index: number) => void;
  isSignedIn: boolean;
  savingIndex: number | null;
  onSave: (result: LoadoutResult, index: number) => Promise<void>;
};

/** Right-hand panel: search status and the list of optimised loadouts. */
export const ResultsPanel = ({
  results,
  status,
  error,
  expanded,
  requestedNames,
  onToggle,
  isSignedIn,
  savingIndex,
  onSave,
}: ResultsPanelProps) => {
  const hasResults = status === "success";

  const subtitle =
    status === "searching"
      ? "Searching…"
      : status === "success"
        ? `${results.length} sets found`
        : status === "empty"
          ? "No matching sets"
          : status === "error"
            ? "Search failed"
            : "Select skills to begin";

  return (
    <main className="flex flex-col overflow-hidden bg-background">
      <div className="flex min-h-[73px] shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <Typography as="h1" className="text-base font-semibold text-foreground">
            Optimized loadouts
          </Typography>
          <Typography as="p" className="mt-1 text-xs text-muted-foreground">
            Compare equipment, decorations, and defenses.
          </Typography>
        </div>
        <Typography
          as="span"
          className={cn(
            "shrink-0 text-xs",
            hasResults ? "text-primary" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </Typography>
      </div>

      {hasResults ? (
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col px-6 py-3">
            {results.map((result, index) => (
              <ResultCard
                key={index}
                result={result}
                index={index}
                isExpanded={expanded.has(index)}
                requestedNames={requestedNames}
                onToggle={() => onToggle(index)}
                isSignedIn={isSignedIn}
                isSaving={savingIndex === index}
                saveDisabled={savingIndex !== null}
                onSave={() => onSave(result, index)}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden px-6 py-3">
          {status === "idle" && <ResultsEmptyState />}
          {status === "searching" && <ResultsSearchingState />}
          {status === "empty" && <ResultsNoResultsState />}
          {status === "error" && (
            <ResultsErrorState
              message={error?.message ?? "Something went wrong. Please try again."}
            />
          )}
        </div>
      )}
    </main>
  );
};
