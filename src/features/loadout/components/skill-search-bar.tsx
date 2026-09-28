import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SkillSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Filters the visible skill catalog. */
export const SkillSearchBar = ({
  value,
  onChange,
}: SkillSearchBarProps) => {
  return (
    <div className="relative shrink-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search skills…"
        aria-label="Search skills"
        className="h-10 rounded-md border border-input bg-card/40 pl-9 pr-3 text-sm shadow-none focus-visible:border-primary focus-visible:ring-2 dark:bg-card/40"
      />
    </div>
  );
};
