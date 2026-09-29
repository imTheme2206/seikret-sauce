import { EmptyState } from "@/components/feedback/empty-state";
import { Loader2 } from "lucide-react";

/** Non-result states for the results panel: empty prompt, searching, no-results. */

export const ResultsEmptyState = () => {
  return (
    <EmptyState
      title="No loadouts yet"
      description="Select your required skills, then choose Find loadouts."
      compact
      className="flex-1 border-y-0"
    />
  );
};

export const ResultsSearchingState = () => {
  return (
    <div
      className="flex min-h-56 flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center"
      aria-busy="true"
      aria-label="Searching for optimal sets"
      role="status"
    >
      <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Finding loadouts…</p>
      <p className="text-xs text-muted-foreground">
        Checking equipment and decoration combinations.
      </p>
    </div>
  );
};

export const ResultsNoResultsState = () => {
  return (
    <EmptyState
      title="No matching loadouts"
      description="Try lowering one or more skill levels, or remove a requirement and search again."
      compact
      className="flex-1 border-y-0"
    />
  );
};

export const ResultsErrorState = ({ message }: { message: string }) => {
  return (
    <EmptyState
      title="Search failed"
      description={message}
      tone="error"
      compact
      className="flex-1 border-y-0"
    />
  );
};
