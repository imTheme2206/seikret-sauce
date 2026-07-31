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
export const RankSelector = ({ value, onChange, disabled }: RankSelectorProps) => {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <ToggleGroup
        type="single"
        value={value}
        // Radix allows toggling the active item off (empty value); keep a rank always selected.
        onValueChange={(v) => v && onChange(v as Rank)}
        disabled={disabled}
        className="flex-1 gap-1 rounded-md border border-border bg-card p-1"
      >
        {OPTIONS.map((opt) => (
          <ToggleGroupItem
            key={opt.rank}
            value={opt.rank}
            disabled={!opt.enabled}
            title={opt.enabled ? undefined : "Master Rank is not available yet"}
            className={cn(
              "h-auto min-w-0 rounded-[4px] px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground data-[state=on]:bg-secondary data-[state=on]:text-primary",
              !opt.enabled &&
                "cursor-not-allowed opacity-40 hover:text-muted-foreground",
            )}
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
