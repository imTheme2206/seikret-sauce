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
      <Typography as="span" className="text-xs font-medium text-muted-foreground">
        Quest rank
      </Typography>
      <ToggleGroup
        type="single"
        value={value}
        // Radix allows toggling the active item off (empty value); keep a rank always selected.
        onValueChange={(v) => v && onChange(v as Rank)}
        disabled={disabled}
        className="w-auto gap-0 border-b border-border"
      >
        {OPTIONS.map((opt) => (
          <ToggleGroupItem
            key={opt.rank}
            value={opt.rank}
            disabled={!opt.enabled}
            title={opt.enabled ? undefined : "Master Rank is not available yet"}
            className={cn(
              "relative h-7 min-w-0 rounded-none px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground data-[state=on]:after:absolute data-[state=on]:after:inset-x-0 data-[state=on]:after:-bottom-px data-[state=on]:after:h-px data-[state=on]:after:bg-primary",
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
