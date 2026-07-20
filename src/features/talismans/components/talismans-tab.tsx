import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import type { GroupedSkills, SkillCategory } from "@/features/loadout/types";
import { useAuth } from "@/hooks/use-auth";
import { useGetSkills } from "@/hooks/use-get-skills";
import { useState } from "react";
import { useTalismans } from "../hooks/use-talismans";
import { TalismanCard } from "./talisman-card";
import { TalismanForm } from "./talisman-form";

/** Display metadata for a skill, keyed by id for the talisman card. */
export interface SkillMeta {
  name: string;
  icon: string | null;
  category: SkillCategory;
}

/** Flattens the category buckets from `useGetSkills` into a single id -> metadata lookup. */
export function toSkillMetaById(
  skills: GroupedSkills | undefined,
): Map<string, SkillMeta> {
  const map = new Map<string, SkillMeta>();
  if (!skills) return map;

  const buckets: [GroupedSkills["armorSkills"], SkillCategory][] = [
    [skills.armorSkills, "armor"],
    [skills.weaponSkills, "weapon"],
    [skills.setSkills, "set"],
    [skills.groupSkills, "group"],
  ];
  for (const [bucket, category] of buckets) {
    for (const skill of bucket)
      map.set(skill.id, { name: skill.name, icon: skill.icon, category });
  }

  return map;
}

/** "Talismans" tab: CRUD over the signed-in user's custom talismans. */
export function TalismansTab() {
  const { session, isLoading: isAuthLoading, signInWithDiscord } = useAuth();
  const { data: skills, isLoading: isLoadingSkills } = useGetSkills();
  const { talismans, isLoading, error, create, remove } = useTalismans();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isAuthLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <Typography className="text-sm text-muted-foreground">
          Log in with Discord to create and manage custom talismans.
        </Typography>
        <Button variant="outline" onClick={() => void signInWithDiscord()}>
          Log in with Discord
        </Button>
      </div>
    );
  }

  const skillMetaById = toSkillMetaById(
    skills as unknown as GroupedSkills | undefined,
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await remove(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid h-full grid-cols-[380px_1fr] overflow-hidden">
      <aside className="overflow-hidden border-r border-border p-3.5">
        <TalismanForm
          skills={skills as unknown as GroupedSkills | undefined}
          onCreate={create}
        />
      </aside>

      <ScrollArea className="h-full">
        <div className="p-3.5">
          {isLoading && !isLoadingSkills && (
            <Skeleton className="h-24 w-full" />
          )}
          {error && (
            <Typography className="text-sm text-destructive">
              {error?.message ?? "Failed to load talismans."}
            </Typography>
          )}
          {!isLoading && talismans.length === 0 && (
            <Typography className="text-sm text-muted-foreground">
              No talismans yet.
            </Typography>
          )}
          {talismans.length > 0 && (
            <div className="grid grid-cols-4 gap-2.5">
              {talismans.map((t) => (
                <TalismanCard
                  key={t.id}
                  talisman={t}
                  skillMetaById={skillMetaById}
                  onDelete={(id) => void handleDelete(id)}
                  isDeleting={deletingId === t.id}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
