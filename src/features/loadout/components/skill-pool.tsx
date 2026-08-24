import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "../config";
import type {
  PoolSkill,
  SelectedSkillMap,
  SkillCategory,
} from "../types";
import { SkillPoolRow } from "./skill-pool-row";

type SkillPoolProps = {
  pool: PoolSkill[];
  activeTab: SkillCategory;
  onTabChange: (tab: SkillCategory) => void;
  isSearchActive: boolean;
  isLoading: boolean;
  selected: SelectedSkillMap;
  selectedCount: number;
  onAdd: (skill: PoolSkill) => void;
  onLevelChange: (name: string, level: number) => void;
  onRemove: (name: string) => void;
  onClearAll: () => void;
};

/** Browsable, tabbed pool of all available skills. */
export const SkillPool = ({
  pool,
  activeTab,
  onTabChange,
  isSearchActive,
  isLoading,
  selected,
  selectedCount,
  onAdd,
  onLevelChange,
  onRemove,
  onClearAll,
}: SkillPoolProps) => {
  const selectedByCategory = Object.values(selected).reduce<
    Partial<Record<SkillCategory, number>>
  >((counts, skill) => {
    counts[skill.category] = (counts[skill.category] ?? 0) + 1;
    return counts;
  }, {});
  const sortedPool = [...pool].sort(
    (a, b) => Number(Boolean(selected[b.name])) - Number(Boolean(selected[a.name])),
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-11 shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography
            as="span"
            className="text-sm font-medium text-foreground"
          >
            Skills
          </Typography>
          {selectedCount > 0 && (
            <Typography as="span" className="text-xs text-muted-foreground">
              {selectedCount} selected
            </Typography>
          )}
        </div>
        {selectedCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClearAll}
            className="h-7 rounded-none px-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="shrink-0 border-b border-border">
        <Tabs
          value={activeTab}
          onValueChange={(v) => onTabChange(v as SkillCategory)}
        >
          <TabsList variant="line" className="grid h-9 w-full grid-cols-4 gap-0 p-0">
            {CATEGORY_ORDER.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="h-9 rounded-none px-1 text-xs font-medium"
              >
                <span className="truncate">{CATEGORY_CONFIG[category].label}</span>
                {(selectedByCategory[category] ?? 0) > 0 && (
                  <span className="text-[10px] font-normal text-primary">
                    {selectedByCategory[category]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="-mx-5 min-h-0 flex-1">
        {isLoading ? (
          <PoolSkeleton />
        ) : sortedPool.length === 0 ? (
          <PoolMessage>No skills match</PoolMessage>
        ) : (
          sortedPool.map((skill) => (
            <SkillPoolRow
              key={`${skill.category}:${skill.name}`}
              skill={skill}
              selectedSkill={selected[skill.name]}
              showCategory={isSearchActive}
              onAdd={() => onAdd(skill)}
              onLevelChange={(level) => onLevelChange(skill.name, level)}
              onRemove={() => onRemove(skill.name)}
            />
          ))
        )}
      </ScrollArea>
    </section>
  );
};

const PoolMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      as="div"
      className="px-6 py-6 text-center text-xs text-muted-foreground col-span-full"
    >
      {children}
    </Typography>
  );
};

/** Loading placeholder that mirrors the skill-pool row layout. */
const PoolSkeleton = () => {
  return (
    <div aria-busy="true" aria-label="Loading skills">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className="flex min-h-[52px] items-center gap-3 border-b border-border/70 px-5 py-2.5"
        >
          <Skeleton className="size-7 shrink-0 rounded-sm" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3 w-10 shrink-0 rounded-sm" />
        </div>
      ))}
    </div>
  );
};
