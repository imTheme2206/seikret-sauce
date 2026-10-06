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
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/features/loadout/config";
import type { CatalogSkill } from "@/features/skills/skill-catalog";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type SkillComboboxProps = {
  id?: string;
  skills: CatalogSkill[];
  value: string;
  /** Skills already used by another row; shown but not selectable. */
  takenIds: ReadonlySet<string>;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  ariaLabel: string;
  onChange: (skillId: string) => void;
};

/** Searchable skill picker, grouped by skill category, with the in-game glyphs. */
export const SkillCombobox = ({
  id,
  skills,
  value,
  takenIds,
  disabled,
  invalid,
  describedBy,
  ariaLabel,
  onChange,
}: SkillComboboxProps) => {
  const [open, setOpen] = useState(false);
  const selected = skills.find((skill) => skill.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full min-w-0 items-center gap-2 rounded-sm border border-input bg-background/70 px-3 text-left text-sm outline-none transition-colors hover:border-primary/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive",
          )}
        >
          {selected ? (
            <SkillGlyph
              icon={selected.icon}
              category={selected.category}
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
            {selected?.name ??
              (disabled ? "Loading skills…" : "Choose a skill")}
          </span>
          <ChevronsUpDown
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,360px)] p-0">
        {/* Plain substring match — cmdk's default fuzzy scoring surfaces unrelated skills. */}
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase().trim())
              ? 1
              : 0
          }
        >
          <CommandInput placeholder="Search skills" />
          <CommandList className="max-h-72">
            <CommandEmpty>No skill matches that search.</CommandEmpty>
            {CATEGORY_ORDER.map((category) => {
              if (category === "set" || category === "group") {
                return null;
              }

              const options = skills.filter(
                (skill) => skill.category === category,
              );

              if (options.length === 0) {
                return null;
              }
              return (
                <CommandGroup
                  key={category}
                  heading={`${CATEGORY_CONFIG[category].label} skills`}
                >
                  {options.map((skill) => {
                    const isTaken = takenIds.has(skill.id);
                    return (
                      <CommandItem
                        key={skill.id}
                        value={`${skill.name} ${skill.id}`}
                        disabled={isTaken}
                        onSelect={() => {
                          onChange(skill.id);
                          setOpen(false);
                        }}
                      >
                        <SkillGlyph
                          icon={skill.icon}
                          category={skill.category}
                          label=""
                          className="size-5"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {skill.name}
                        </span>
                        {isTaken ? (
                          <span className="text-xs text-muted-foreground">
                            Added
                          </span>
                        ) : (
                          <span className="text-xs tabular-nums text-muted-foreground">
                            Max {skill.maxLevel}
                          </span>
                        )}
                        {skill.id === value && (
                          <Check
                            className="size-3.5 text-primary"
                            aria-hidden="true"
                          />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
