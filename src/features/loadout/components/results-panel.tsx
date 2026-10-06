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
  /** Re-runs the last search; offered on recoverable errors. */
  onRetry: () => void;
  /** Opens the skills drawer on small screens. */
  onChooseSkills: () => void;
};

/** Search status and the list of optimised loadouts below the skill workspace. */
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
  onRetry,
  onChooseSkills,
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
          <Typography id="results-heading" as="h2" className="font-display text-2xl font-semibold tracking-wide text-foreground">
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
            "shrink-0 text-sm tabular-nums",
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
        <div className="flex min-h-56 flex-col">
          {status === "idle" && <ResultsEmptyState onChooseSkills={onChooseSkills} />}
          {status === "searching" && <ResultsSearchingState />}
          {status === "empty" && <ResultsNoResultsState />}
          {status === "error" && (
            <ResultsErrorState
              message={error?.message ?? "Something went wrong. Please try again."}
              // Validation errors need different input, not another attempt.
              onRetry={error?.kind === "validation" ? undefined : onRetry}
            />
          )}
        </div>
      )}
    </section>
  );
};
