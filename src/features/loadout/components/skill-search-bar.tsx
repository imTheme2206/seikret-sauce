import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SkillSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onOptimize: () => void;
  canOptimize: boolean;
  isOptimizing: boolean;
}

/**
 * Unified search input + "Find Sets" action. Owns no state; the query and the
 * optimize handler are injected.
 */
export function SkillSearchBar({
  value,
  onChange,
  onOptimize,
  canOptimize,
  isOptimizing,
}: SkillSearchBarProps) {
  return (
    <div className="flex h-10 shrink-0 items-stretch overflow-hidden rounded-md border border-border bg-card">
      <div className="flex shrink-0 items-center pl-3 pr-2 text-muted-foreground">
        <Search className="size-3.5" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search skills…"
        className="h-full flex-1 rounded-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <Button
        type="button"
        onClick={onOptimize}
        disabled={!canOptimize}
        className="h-full shrink-0 rounded-none border-l border-border px-4 text-xs font-bold tracking-[0.06em] disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100"
      >
        {isOptimizing ? "Searching…" : "Find Sets"}
      </Button>
    </div>
  );
}
