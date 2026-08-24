import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

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
      className="flex flex-1 flex-col gap-2 py-1"
      aria-busy="true"
      aria-label="Searching for optimal sets"
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="flex min-h-24 items-center gap-3 border-b border-border bg-transparent px-1 py-3"
        >
          <Skeleton className="h-3 w-7 shrink-0 rounded-sm" />
          <div className="flex flex-1 gap-1">
            {Array.from({ length: 6 }, (_, j) => (
              <Skeleton key={j} className="h-14 flex-1 rounded-sm" />
            ))}
          </div>
          <Skeleton className="size-3.5 shrink-0" />
        </div>
      ))}
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
