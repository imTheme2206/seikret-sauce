import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { Rank } from "../types";

type RankSelectorProps = {
  value: Rank;
  onChange: (rank: Rank) => void;
  disabled?: boolean;
};

/** Selectable ranks. Master is shown but disabled until the content is available. */
const OPTIONS: { rank: Rank; label: string; enabled: boolean }[] = [
  { rank: "high", label: "High Rank", enabled: true },
  { rank: "master", label: "Master Rank", enabled: false },
];

/** Segmented rank picker that feeds the search request's `rank` field. */
export const RankSelector = ({
  value,
  onChange,
  disabled,
}: RankSelectorProps) => {
  return (
    <div role="group" aria-label="Hunter rank" className="flex shrink-0 items-center justify-start gap-4">
      <ToggleGroup
        type="single"
        value={value}
        // Radix allows toggling the active item off (empty value); keep a rank always selected.
        onValueChange={(v) => v && onChange(v as Rank)}
        disabled={disabled}
        className="w-auto gap-2 border-0"
      >
        {OPTIONS.map((opt) => (
          <ToggleGroupItem
            key={opt.rank}
            value={opt.rank}
            disabled={!opt.enabled}
            aria-label={opt.enabled ? opt.label : `${opt.label}, coming soon`}
            className={cn(
              "h-9 min-w-0 gap-2 rounded-sm border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=on]:border-primary/70 data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
              !opt.enabled &&
                "cursor-not-allowed border-dashed hover:text-muted-foreground disabled:opacity-100",
            )}
          >
            {opt.label}
            {!opt.enabled && (
              <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Soon
              </span>
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
