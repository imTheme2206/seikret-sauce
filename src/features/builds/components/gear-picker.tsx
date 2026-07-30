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
import { Typography } from "@/components/ui/typography";
import { shortArmorName } from "@/features/loadout/utils";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, CircleSlash } from "lucide-react";
import { useState } from "react";
import type { GearOption, GearOptionGroup } from "../types";

interface GearPickerProps {
  value: string;
  groups: GearOptionGroup[];
  /** Trigger text while nothing is equipped. */
  placeholder: string;
  /** Label of the "unequip" choice at the top of the list. */
  emptyLabel: string;
  searchPlaceholder: string;
  /** Glyph for an option — the position glyph for armour, a jewel for decorations. */
  renderIcon?: (option: GearOption | null) => React.ReactNode;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

function findOption(groups: GearOptionGroup[], id: string): GearOption | null {
  if (!id) return null;
  for (const group of groups) {
    const match = group.options.find((option) => option.id === id);
    if (match) return match;
  }
  return null;
}

export function GearPicker({
  value,
  groups,
  placeholder,
  emptyLabel,
  searchPlaceholder,
  renderIcon,
  onChange,
  ariaLabel,
  className,
}: GearPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = findOption(groups, value);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-none border border-input bg-background/70 px-3 text-left text-sm outline-none transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            className,
          )}
        >
          {renderIcon?.(selected) ?? null}
          <Typography
            as="span"
            className={cn(
              "min-w-0 flex-1 truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {shortArmorName(selected?.name ?? placeholder)}
          </Typography>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-72 rounded-none p-0"
      >
        <Command
          filter={(itemValue, search, keywords) => {
            const haystack = [itemValue, ...(keywords ?? [])]
              .join(" ")
              .toLowerCase();
            return haystack.includes(search.toLowerCase().trim()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} className="h-10" />
          <CommandList className="max-h-72">
            <CommandEmpty>Nothing matches that search.</CommandEmpty>

            <CommandGroup>
              <CommandItem value={emptyLabel} onSelect={() => choose("")}>
                <CircleSlash className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-muted-foreground">
                  {emptyLabel}
                </span>
                {!selected && <Check className="size-3.5 text-primary" />}
              </CommandItem>
            </CommandGroup>

            {groups.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    keywords={[option.name, ...(option.keywords ?? [])]}
                    onSelect={() => choose(option.id)}
                  >
                    {renderIcon?.(option) ?? null}
                    <span className="min-w-0 flex-1 truncate">
                      {shortArmorName(option.name)}
                    </span>
                    {option.id === value && (
                      <Check className="size-3.5 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
