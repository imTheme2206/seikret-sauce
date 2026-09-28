import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
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
    <div className="flex shrink-0 items-center justify-between gap-4">
      <Typography as="span" className="text-sm font-medium text-foreground">
        Quest rank
      </Typography>
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
            title={opt.enabled ? undefined : "Master Rank is not available yet"}
            className={cn(
              "h-9 min-w-0 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=on]:border-primary/70 data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
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
