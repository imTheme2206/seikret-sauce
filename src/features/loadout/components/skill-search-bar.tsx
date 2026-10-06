import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

type SkillSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** Filters the visible skill catalog. `/` focuses it from anywhere; Esc clears it. */
export const SkillSearchBar = ({
  value,
  onChange,
}: SkillSearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const input = inputRef.current;
      // Desktop and drawer each mount a bar; only the visible one answers.
      if (event.key !== "/" || isTypingTarget(event.target) || !input?.offsetParent) return;
      event.preventDefault();
      input.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative shrink-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
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
