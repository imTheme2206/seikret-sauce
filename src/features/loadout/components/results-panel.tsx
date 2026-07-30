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

interface ResultsPanelProps {
  results: LoadoutResult[];
  status: SearchStatus;
  error: SearchError | null;
  expanded: Set<number>;
  requestedNames: Set<string>;
  onToggle: (index: number) => void;
  isSignedIn: boolean;
  isCatalogLoading: boolean;
  savingIndex: number | null;
  onSave: (result: LoadoutResult, index: number) => Promise<void>;
}

/** Right-hand panel: header subtitle + the list of optimised loadouts. */
export function ResultsPanel({
  results,
  status,
  error,
  expanded,
  requestedNames,
  onToggle,
  isSignedIn,
  isCatalogLoading,
  savingIndex,
  onSave,
}: ResultsPanelProps) {
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
    <main className="flex flex-col overflow-hidden bg-[hsl(24,15%,7%)]">
      <div className="flex shrink-0 items-baseline gap-2 border-b border-border px-[18px] py-[11px]">
        <Typography
          as="span"
          className="text-xs font-semibold tracking-[0.12em] text-muted-foreground"
        >
          RESULTS
        </Typography>
        <Typography
          as="div"
          className={cn("text-xs", hasResults ? "text-primary" : "text-muted-foreground")}
        >
          {subtitle}
        </Typography>
      </div>

      {hasResults ? (
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-2 px-4 py-3">
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
                saveDisabled={isCatalogLoading || savingIndex !== null}
                onSave={() => onSave(result, index)}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden px-4 py-3">
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
}
