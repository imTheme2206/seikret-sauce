import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import type { GroupedSkills } from "@/features/loadout/types";
import { useAuth } from "@/hooks/use-auth";
import { useGetSkills } from "@/hooks/use-get-skills";
import { useState } from "react";
import { useTalismans } from "../hooks/use-talismans";
import { TalismanCard } from "./talisman-card";
import { TalismanForm } from "./talisman-form";

/** Flattens the category buckets from `useGetSkills` into a single id -> name lookup. */
export function toSkillNamesById(
  skills: GroupedSkills | undefined,
): Map<string, string> {
  const map = new Map<string, string>();
  if (!skills) return map;

  for (const bucket of [skills.armorSkills, skills.weaponSkills]) {
    for (const skill of bucket) map.set(skill.id, skill.name);
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

  const skillNamesById = toSkillNamesById(
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
        <div className="flex flex-col gap-2.5 p-3.5">
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
          {talismans.map((t) => (
            <TalismanCard
              key={t.id}
              talisman={t}
              skillNamesById={skillNamesById}
              onDelete={(id) => void handleDelete(id)}
              isDeleting={deletingId === t.id}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
