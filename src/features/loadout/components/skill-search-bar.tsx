import { Search } from "lucide-react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { useHotkeys } from "@/hooks/use-hotkeys";

type SkillSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Filters the visible skill catalog. `/` focuses it from anywhere; Esc clears it. */
export const SkillSearchBar = ({
  value,
  onChange,
}: SkillSearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys([
    {
      key: "/",
      // Desktop and drawer each mount a bar; only the visible one answers.
      enabled: () => Boolean(inputRef.current?.offsetParent),
      handler: () => inputRef.current?.focus(),
    },
    {
      key: "Escape",
      target: inputRef,
      allowWhileTyping: true,
      enabled: () => Boolean(value),
      handler: () => onChange(""),
    },
  ]);

  return (
    <div className="relative shrink-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search skills"
        aria-label="Search skills"
        aria-keyshortcuts="/"
        className="h-10 rounded-sm border border-input bg-card pl-9 pr-9 text-sm shadow-none focus-visible:border-primary focus-visible:ring-2 dark:bg-card [&::-webkit-search-cancel-button]:hidden"
      />
      {!value && (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm border border-border px-1.5 font-mono text-[11px] text-muted-foreground">
          /
        </kbd>
      )}
    </div>
  );
};
