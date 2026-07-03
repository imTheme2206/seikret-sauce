import { Skeleton } from "@/components/ui/skeleton";

/** Non-result states for the results panel: empty prompt, searching, no-results. */

export function ResultsEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-5 py-[60px] text-center">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="22" stroke="var(--border)" strokeWidth="1.5" />
        <polygon
          points="26,12 28.5,20 37,20 30.5,25 33,33 26,28 19,33 21.5,25 15,20 23.5,20"
          fill="var(--secondary)"
          stroke="var(--border)"
          strokeWidth="1"
        />
      </svg>
      <p className="max-w-[270px] text-[13px] leading-[1.7] text-muted-foreground">
        Add skills from the left panel, then click{" "}
        <span className="font-semibold text-primary">Find Sets</span> to discover optimal armor
        loadouts
      </p>
    </div>
  );
}

export function ResultsSearchingState() {
  return (
    <div
      className="flex flex-1 flex-col gap-2 py-1"
      aria-busy="true"
      aria-label="Searching for optimal sets"
    >
      <p className="px-1 pb-1 text-center text-[13px] text-muted-foreground">
        Searching for optimal sets…
      </p>
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="flex min-h-20 items-center gap-2.5 rounded-md border border-border bg-card px-3 py-[9px]"
        >
          <Skeleton className="size-[26px] shrink-0 rounded-[4px]" />
          <div className="flex flex-1 gap-1">
            {Array.from({ length: 6 }, (_, j) => (
              <Skeleton key={j} className="h-14 flex-1 rounded-md" />
            ))}
          </div>
          <Skeleton className="size-3.5 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ResultsNoResultsState() {
  return (
    <div className="flex flex-1 items-center justify-center p-[60px] text-center text-[13px] text-muted-foreground">
      No matching sets found. Try adjusting skill levels or requirements.
    </div>
  );
}

export function ResultsErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-5 py-[60px] text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="hsl(8,60%,52%)" strokeWidth="1.5" />
        <path d="M12 7.5v5.5" stroke="hsl(8,60%,52%)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16.25" r="0.9" fill="hsl(8,60%,52%)" />
      </svg>
      <p className="max-w-[300px] text-[13px] leading-[1.7] text-[hsl(8,55%,62%)]">{message}</p>
    </div>
  );
}
