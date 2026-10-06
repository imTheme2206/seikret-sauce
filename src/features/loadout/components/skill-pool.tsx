import { useId } from "react";
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
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { groupSkillsByIcon, type SkillIconGroup } from "../utils";
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

  // Desktop and the mobile drawer can both mount a pool; keep heading ids unique.
  const idPrefix = useId();

  const renderRow = (skill: PoolSkill) => (
    <SkillPoolRow
      key={`${skill.category}:${skill.name}`}
      skill={skill}
      selectedSkill={selected[skill.name]}
      showCategory={isSearchActive}
      onAdd={() => onAdd(skill)}
      onLevelChange={(level) => onLevelChange(skill.name, level)}
      onRemove={() => onRemove(skill.name)}
    />
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
                className="relative h-9 rounded-sm border border-border bg-transparent px-1 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary/60 data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:border-primary/60 dark:data-[state=active]:bg-primary/10 dark:data-[state=active]:text-primary"
              >
                <span className="truncate">{CATEGORY_CONFIG[category].label}</span>
                {(selectedByCategory[category] ?? 0) > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-sm bg-primary px-1 text-[10px] font-semibold leading-4 tabular-nums text-primary-foreground">
                    <span className="sr-only">, selected: </span>
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
          <span>Skill</span><span className="pr-9">Max level</span>
        </div>
      )}
      {/* Radix wraps content in a `display: table` div, which defeats `truncate`; force block. */}
      <ScrollArea className="min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:!block">
        {isLoading ? (
          <PoolSkeleton />
        ) : sortedPool.length === 0 ? (
          <PoolMessage>No skills match</PoolMessage>
        ) : (
          activeTab === "armor" && !isSearchActive ? (
            // Armor skills are grouped by icon type; search results and the
            // other categories stay a flat list.
            groupSkillsByIcon(sortedPool).map((group) => {
              const headingId = `${idPrefix}-group-${group.icon ?? "other"}`;
              return (
                <div key={headingId} role="group" aria-labelledby={headingId}>
                  <SkillGroupHeader
                    id={headingId}
                    group={group}
                    selectedCount={group.skills.filter((skill) => selected[skill.name]).length}
                  />
                  {group.skills.map(renderRow)}
                </div>
              );
            })
          ) : (
            sortedPool.map(renderRow)
          )
        )}
      </ScrollArea>
    </section>
  );
};

/** Sticky heading for one icon-type group of armor skills. */
const SkillGroupHeader = ({
  id,
  group,
  selectedCount,
}: {
  id: string;
  group: SkillIconGroup;
  selectedCount: number;
}) => (
  <div className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-border bg-surface-raised px-4 py-2">
    {group.icon && (
      <SkillGlyph category="armor" icon={group.icon} label="" className="size-5" />
    )}
    <Typography
      id={id}
      as="h3"
      className="text-xs font-semibold uppercase tracking-[0.14em] text-primary"
    >
      {group.label}
    </Typography>
    <Typography as="span" className="text-xs tabular-nums text-muted-foreground">
      {group.skills.length}
    </Typography>
    {selectedCount > 0 && (
      <Typography as="span" className="ml-auto text-xs tabular-nums text-primary">
        {selectedCount} selected
      </Typography>
    )}
  </div>
);

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
