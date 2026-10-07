import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import type { SkillCategory } from "@/features/skills/skill-catalog";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export type SkillBonusOption = {
  value: string;
  label: string;
  icon: string | null;
};

type SkillBonusSelectProps = {
  label: string;
  placeholder: string;
  value: string | null;
  options: SkillBonusOption[];
  category: Extract<SkillCategory, "set" | "group">;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  className?: string;
};

/** Searchable Set/Group skill picker shared by optimizer and build editors. */
export const SkillBonusSelect = ({
  label,
  placeholder,
  value,
  options,
  category,
  onChange,
  disabled = false,
  className,
}: SkillBonusSelectProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const select = (next: string) => {
    onChange(next === "__none__" ? null : next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full min-w-0 items-center gap-2 rounded-sm border border-input bg-background/70 px-3 text-left text-sm outline-none transition-colors hover:border-primary/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          {selected ? (
            <SkillGlyph
              icon={selected.icon}
              category={category}
              label=""
              className="size-5"
            />
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,360px)] p-0">
        {/* Plain substring matching keeps search results relevant and predictable. */}
        <Command
          filter={(itemValue, search) =>
            itemValue.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())
              ? 1
              : 0
          }
        >
          <CommandInput placeholder={`Search ${category} skills`} />
          <CommandList className="max-h-72">
            <CommandEmpty>No skill matches that search.</CommandEmpty>
            <CommandGroup heading={`${category === "set" ? "Set" : "Group"} skills`}>
              <CommandItem
                value={`${placeholder} none clear`}
                onSelect={() => select("__none__")}
              >
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {placeholder}
                </span>
                {!selected && (
                  <Check className="size-3.5 text-primary" aria-hidden="true" />
                )}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => select(option.value)}
                >
                  <SkillGlyph
                    icon={option.icon}
                    category={category}
                    label=""
                    className="size-5"
                  />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.value === value && (
                    <Check className="size-3.5 text-primary" aria-hidden="true" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
