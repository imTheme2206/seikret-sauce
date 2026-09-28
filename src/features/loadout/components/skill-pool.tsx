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
  showSummary?: boolean;
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
  showSummary = true,
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
    <section className="flex h-full min-h-0 flex-col">
      {showSummary && <div className="flex min-h-11 shrink-0 items-center justify-between border-b border-border px-4">
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
            className="h-7 px-2 text-xs font-normal text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>}

      <div className="shrink-0 border-b border-border px-3 py-2">
        <Tabs
          value={activeTab}
          onValueChange={(v) => onTabChange(v as SkillCategory)}
        >
          <TabsList className="grid h-9 w-full grid-cols-4 gap-1 p-0 bg-transparent">
            {CATEGORY_ORDER.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="h-9 rounded-md border border-border bg-transparent px-1 text-xs font-medium data-[state=active]:border-primary/60 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
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
      {!showSummary && (
        <div className="grid shrink-0 grid-cols-[1fr_auto] border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
          <span>Skill</span><span className="pr-16">Level</span>
        </div>
      )}
      <ScrollArea className="min-h-0 flex-1">
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
      className="flex min-h-[220px] items-center justify-center px-6 py-6 text-center text-sm text-muted-foreground"
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
