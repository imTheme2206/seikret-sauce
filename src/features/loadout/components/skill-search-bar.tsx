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
      <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search skills…"
        aria-label="Search skills"
        className="h-10 rounded-none border-0 border-b border-border bg-transparent pl-7 pr-0 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0 dark:bg-transparent"
      />
    </div>
  );
};
