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
    <section aria-labelledby="results-heading" className="border-t border-border pt-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Typography id="results-heading" as="h2" className="text-2xl font-semibold tracking-tight text-foreground">
            Optimized loadouts
          </Typography>
          <Typography as="p" className="mt-1 text-sm text-muted-foreground">
            Compare equipment, decorations, and defenses.
          </Typography>
        </div>
        <Typography
          as="span"
          aria-live="polite"
          className={cn(
            "shrink-0 text-sm",
            hasResults ? "text-primary" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </Typography>
      </div>

      {hasResults ? (
        <div className="flex flex-col gap-2">
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
      ) : (
        <div className="flex min-h-56 flex-col overflow-hidden rounded-md border border-border bg-card/20">
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
    </section>
  );
};
