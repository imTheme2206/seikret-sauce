import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SelectedSkill } from "../types";
import { SelectedSkillRow } from "./selected-skill-row";

interface SelectedSkillsPanelProps {
  skills: SelectedSkill[];
  count: number;
  onLevelChange: (name: string, level: number) => void;
  onRemove: (name: string) => void;
  onClearAll: () => void;
}

/** Card listing the skills the user has chosen, with per-skill level control. */
export function SelectedSkillsPanel({
  skills,
  count,
  onLevelChange,
  onRemove,
  onClearAll,
}: SelectedSkillsPanelProps) {
  const hasSkills = count > 0;

  return (
    <Card className="flex max-h-[48rem] min-h-90 shrink-0 flex-col gap-0 rounded-md border-border py-0 shadow-none">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-[7px]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Selected Skills
        </span>
        {hasSkills && (
          <div className="flex items-center gap-1.5">
            <Badge className="h-auto rounded-full bg-[hsl(36,30%,10%)] px-2 py-px text-[10px] font-bold text-primary">
              {count}
            </Badge>
            <Button
              variant="outline"
              onClick={onClearAll}
              className="h-auto rounded-[3px] border-border bg-transparent px-[7px] py-0.5 text-[10px] font-normal text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground dark:bg-transparent dark:hover:bg-transparent"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {!hasSkills ? (
          <div className="px-3 py-3.5 text-center text-[11px] text-muted-foreground">
            Search and click skills below to add them
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3">
            {skills.map((skill) => (
              <SelectedSkillRow
                key={skill.name}
                skill={skill}
                onLevelChange={(level) => onLevelChange(skill.name, level)}
                onRemove={() => onRemove(skill.name)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
