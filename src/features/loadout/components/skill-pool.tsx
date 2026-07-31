import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "../config";
import type { PoolSkill, SkillCategory } from "../types";
import { SkillPoolRow } from "./skill-pool-row";

type SkillPoolProps = {
  pool: PoolSkill[];
  activeTab: SkillCategory;
  onTabChange: (tab: SkillCategory) => void;
  isSearchActive: boolean;
  isLoading: boolean;
  isSelected: (name: string) => boolean;
  onAdd: (skill: PoolSkill) => void;
};

/** Browsable, tabbed pool of all available skills. */
export const SkillPool = ({
  pool,
  activeTab,
  onTabChange,
  isSearchActive,
  isLoading,
  isSelected,
  onAdd,
}: SkillPoolProps) => {
  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-0 rounded-md border-border py-0 shadow-none">
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
                {CATEGORY_CONFIG[category].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <PoolSkeleton />
        ) : pool.length === 0 ? (
          <PoolMessage>No skills match</PoolMessage>
        ) : (
          pool.map((skill) => (
            <SkillPoolRow
              key={`${skill.category}:${skill.name}`}
              skill={skill}
              isSelected={isSelected(skill.name)}
              showCategory={isSearchActive}
              onAdd={() => onAdd(skill)}
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
