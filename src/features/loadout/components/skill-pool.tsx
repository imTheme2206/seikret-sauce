import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="flex min-h-0 flex-1 flex-col gap-0 rounded-md border-border py-0 shadow-none">
      <div className="flex min-h-10 shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Typography
            as="span"
            className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            Skills
          </Typography>
          {selectedCount > 0 && (
            <Badge className="h-5 min-w-5 rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
              {selectedCount}
            </Badge>
          )}
        </div>
        {selectedCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClearAll}
            className="h-7 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="shrink-0 border-b border-border p-2">
        <Tabs
          value={activeTab}
          onValueChange={(v) => onTabChange(v as SkillCategory)}
        >
          <TabsList className="grid w-full grid-cols-4">
            {CATEGORY_ORDER.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="text-xs font-semibold uppercase tracking-[0.06em]"
              >
                <span className="truncate">{CATEGORY_CONFIG[category].label}</span>
                {(selectedByCategory[category] ?? 0) > 0 && (
                  <span className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[9px] leading-4 text-primary">
                    {selectedByCategory[category]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
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
    </Card>
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
          className="flex min-h-[46px] items-center gap-2.5 border-b border-border px-3 py-2"
        >
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="size-5 shrink-0 rounded-[4px]" />
        </div>
      ))}
    </div>
  );
};
