import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { shortArmorName } from "@/features/loadout/utils";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, CircleSlash } from "lucide-react";
import { useState } from "react";
import type { GearOption, GearOptionGroup } from "../types";
import { GearSkillLine } from "./gear-skill-line";
import { SlotPips } from "./slot-pips";

type GearPickerProps = {
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
  /** Optional full-area trigger for equipment rows. */
  trigger?: React.ReactElement;
};

const findOption = (
  groups: GearOptionGroup[],
  id: string,
): GearOption | null => {
  if (!id) return null;
  for (const group of groups) {
    const match = group.options.find((option) => option.id === id);
    if (match) return match;
  }
  return null;
};

export const GearPicker = ({
  value,
  groups,
  placeholder,
  emptyLabel,
  searchPlaceholder,
  renderIcon,
  onChange,
  ariaLabel,
  className,
  trigger,
}: GearPickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const selected = findOption(groups, value);
  const hasOptions = groups.some((group) => group.options.length > 0);
  const rarities = Array.from(
    new Set(
      groups.flatMap((group) =>
        group.options.flatMap((option) =>
          option.rarity === undefined ? [] : [option.rarity],
        ),
      ),
    ),
  );
  const visibleGroups =
    rarityFilter === "all"
      ? groups
      : groups
          .map((group) => ({
            ...group,
            options: group.options.filter(
              (option) => option.rarity === Number(rarityFilter),
            ),
          }))
          .filter((group) => group.options.length > 0);

  const resetFilters = () => {
    setSearchTerm("");
    setRarityFilter("all");
  };

  const choose = (next: string) => {
    onChange(next);
    resetFilters();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetFilters();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
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
        )}
      </DialogTrigger>

      <DialogContent
        className="grid h-[min(85dvh,860px)] max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-4xl"
      >
        <DialogHeader className="border-b border-border px-5 py-5 pr-12 text-left sm:px-6">
          <DialogTitle>Item Search</DialogTitle>
          <DialogDescription>
            {ariaLabel ?? placeholder}
          </DialogDescription>
        </DialogHeader>
        <Command
          className="min-h-0 rounded-none bg-transparent [&_[data-slot=command-input-wrapper]]:h-10"
          filter={(itemValue, search, keywords) => {
            const haystack = [itemValue, ...(keywords ?? [])]
              .join(" ")
              .toLowerCase();
            return haystack.includes(search.toLowerCase().trim()) ? 1 : 0;
          }}
        >
          <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:px-6">
            <div className="min-w-0 flex-1 rounded-sm border border-input bg-background/60">
              <CommandInput
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="h-10"
              />
            </div>
            {rarities.length > 0 && (
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Rarity
                </span>
                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger
                    aria-label="Filter by rarity"
                    className="h-10 min-w-36 flex-1 sm:w-40"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All rarities</SelectItem>
                    {rarities.map((rarity) => (
                      <SelectItem key={rarity} value={String(rarity)}>
                        Rarity {rarity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <CommandList className="min-h-0 max-h-none flex-1 px-4 pb-4 sm:px-6">
            <CommandEmpty>Nothing matches that search.</CommandEmpty>

            <CommandGroup>
              <CommandItem
                value={emptyLabel}
                onSelect={() => choose("")}
                className="mb-2 min-h-12 border border-border/70 px-4"
              >
                <CircleSlash className="size-3.5 text-muted-foreground" />
                <span className="flex-1 text-muted-foreground">
                  {emptyLabel}
                </span>
                {!selected && <Check className="size-3.5 text-primary" />}
              </CommandItem>
            </CommandGroup>

            {!hasOptions && !searchTerm && (
              <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                No equipment options available for this slot.
              </p>
            )}

            {visibleGroups.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    keywords={[option.name, ...(option.keywords ?? [])]}
                    onSelect={() => choose(option.id)}
                    className="mb-2 items-start gap-3 border border-border/70 bg-card/30 px-3 py-3 last:mb-0 data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/10 sm:gap-4 sm:px-4"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-background/60">
                      {renderIcon?.(option) ?? null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground sm:text-base">
                        {option.name}
                      </span>
                      {option.summary && (
                        <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
                          {option.summary}
                        </span>
                      )}
                      <div className="mt-1.5">
                        <GearSkillLine
                          skills={option.skills ?? []}
                          bonuses={option.bonuses ?? []}
                          stacked
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {option.slots !== undefined && (
                        <SlotPips slots={option.slots} />
                      )}
                      {option.id === value && (
                        <Check className="size-4 text-primary" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
