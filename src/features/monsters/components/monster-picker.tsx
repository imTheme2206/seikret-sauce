import { Button } from "@/components/ui/button";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { MonsterListItem } from "../types";
import { MonsterIcon } from "./monster-icon";

type MonsterPickerProps = {
  monsters: MonsterListItem[];
  /** Selected monster id, or null while none is chosen. */
  value: string | null;
  isLoading?: boolean;
  onChange: (monsterId: string) => void;
};

const speciesLabel = (species: string): string =>
  species.replace(/-/g, " ").replace(/^./, (first) => first.toUpperCase());

/** Searchable target-monster picker. */
export const MonsterPicker = ({
  monsters,
  value,
  isLoading = false,
  onChange,
}: MonsterPickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = monsters.find((monster) => monster.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Target monster"
          disabled={isLoading}
          className="h-12 w-full justify-between gap-3 sm:w-80"
        >
          {selected ? (
            <>
              <MonsterIcon monster={selected} size="sm" />
              <Typography as="span" className="flex-1 truncate text-left">
                {selected.name}
              </Typography>
            </>
          ) : (
            <Typography
              as="span"
              className="flex-1 truncate text-left text-muted-foreground"
            >
              {isLoading ? "Loading monsters..." : "Choose a target monster"}
            </Typography>
          )}
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-72 p-0">
        <Command
          filter={(itemValue, search, keywords) =>
            [itemValue, ...(keywords ?? [])]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase().trim())
              ? 1
              : 0
          }
        >
          <CommandInput placeholder="Search monsters" />
          <CommandList>
            <CommandEmpty>No monster matches that search.</CommandEmpty>
            <CommandGroup>
              {monsters.map((monster) => (
                <CommandItem
                  key={monster.id}
                  value={monster.id}
                  keywords={[monster.name, monster.species]}
                  onSelect={() => {
                    onChange(monster.id);
                    setOpen(false);
                  }}
                  className="gap-3"
                >
                  <MonsterIcon monster={monster} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Typography as="div" className="truncate text-sm">
                      {monster.name}
                    </Typography>
                    <Typography
                      as="div"
                      className="truncate text-xs text-muted-foreground"
                    >
                      {speciesLabel(monster.species)}
                    </Typography>
                  </div>
                  {monster.id === value && (
                    <Check className="size-3.5 text-primary" />
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
