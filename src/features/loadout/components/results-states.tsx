import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Loader2, Search, SearchX, SlidersHorizontal, TriangleAlert } from "lucide-react";

/** Non-result states for the results panel: empty prompt, searching, no-results, error. */

type ResultsEmptyStateProps = {
  /** Opens the skills drawer on small screens, where the skill list is hidden. */
  onChooseSkills?: () => void;
};

export const ResultsEmptyState = ({ onChooseSkills }: ResultsEmptyStateProps) => {
  return (
    <EmptyState
      icon={Search}
      title="No loadouts yet"
      description="Add the skills your hunt needs, set their levels, then choose Find loadouts."
      compact
      className="flex-1"
      action={
        onChooseSkills && (
          <Button type="button" variant="outline" onClick={onChooseSkills} className="lg:hidden">
            <SlidersHorizontal className="size-4" />
            Choose skills
          </Button>
        )
      }
    />
  );
};

export const ResultsSearchingState = () => {
  return (
    <div
      className="flex min-h-56 flex-1 flex-col items-center justify-center gap-3 rounded-sm border border-border px-6 py-10 text-center"
      aria-busy="true"
      aria-label="Searching for optimal sets"
      role="status"
    >
      <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Finding loadouts…</p>
      <p className="text-xs text-muted-foreground">
        Checking equipment and decoration combinations. This can take up to 20 seconds.
      </p>
    </div>
  );
};

export const ResultsNoResultsState = () => {
  return (
    <EmptyState
      icon={SearchX}
      title="No matching loadouts"
      description="No armor combination reaches every requested level. Lower one or more skill levels, or remove a requirement and search again."
      compact
      className="flex-1"
    />
  );
};

type ResultsErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export const ResultsErrorState = ({ message, onRetry }: ResultsErrorStateProps) => {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="Search failed"
      description={message}
      tone="error"
      compact
      className="flex-1"
      action={
        onRetry && (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
};
