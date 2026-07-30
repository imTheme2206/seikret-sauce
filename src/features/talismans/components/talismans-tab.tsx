import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import type { GroupedSkills, SkillCategory } from "@/features/loadout/types";
import { useAuth } from "@/hooks/use-auth";
import { useGetSkills } from "@/hooks/use-get-skills";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Boxes, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTalismans } from "../hooks/use-talismans";
import { MAX_TALISMANS_PER_USER, type CreateTalismanInput } from "../types";
import { TalismanCard } from "./talisman-card";
import { TalismanEmptyState } from "./talisman-empty-state";
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

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Could not load talismans",
        description: error.message,
      });
    }
  }, [error]);

  if (isAuthLoading) {
    return (
      <div className="h-full overflow-y-auto p-5 md:p-8">
        <Skeleton className="mx-auto h-48 max-w-7xl rounded-none" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-full overflow-y-auto">
        <main className="mx-auto max-w-7xl p-5 md:p-8">
          <TalismanEmptyState
            icon={LockKeyhole}
            title="Your talisman box is sealed"
            body="Sign in with Discord to forge custom talismans and use them in your saved loadouts."
            action={
              <Button
                onClick={() => void signInWithDiscord()}
                className="gap-2"
              >
                <LockKeyhole className="size-4" />
                Sign in with Discord
              </Button>
            }
          />
        </main>
      </div>
    );
  }

  const skillMetaById = toSkillMetaById(
    skills as unknown as GroupedSkills | undefined,
  );

  const handleCreate = async (input: CreateTalismanInput) => {
    try {
      await create(input);
      toast({
        variant: "success",
        title: "Talisman forged",
        description: `${input.name} is ready for your loadouts.`,
      });
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to create talisman.";
      toast({
        variant: "destructive",
        title: "Could not forge talisman",
        description: message,
      });
      throw createError;
    }
  };

  const handleDelete = async (id: string) => {
    const talisman = talismans.find((candidate) => candidate.id === id);
    setDeletingId(id);
    try {
      await remove(id);
      toast({
        variant: "success",
        title: "Talisman deleted",
        description: talisman
          ? `${talisman.name} was removed from your equipment box.`
          : undefined,
      });
    } catch (deleteError) {
      toast({
        variant: "destructive",
        title: "Could not delete talisman",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete talisman.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <main className="mx-auto grid max-w-7xl items-start gap-6 p-5 md:p-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6">
          <TalismanForm
            skills={skills as unknown as GroupedSkills | undefined}
            isLoadingSkills={isLoadingSkills}
            onCreate={handleCreate}
          />
        </aside>

        <section aria-labelledby="saved-talismans-heading">
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <Typography
                as="div"
                className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-primary"
              >
                <Boxes className="size-3.5" />
                Equipment box
              </Typography>
              <Typography
                id="saved-talismans-heading"
                as="h2"
                className="text-xl font-semibold"
              >
                Saved talismans
              </Typography>
            </div>
            <Typography
              as="span"
              className="shrink-0 text-xs tabular-nums text-muted-foreground"
            >
              {talismans.length} / {MAX_TALISMANS_PER_USER}
            </Typography>
          </div>

          {isLoading && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-48 rounded-none" />
              ))}
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 border border-destructive/35 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <Typography>
                {error.message ?? "Failed to load talismans."}
              </Typography>
            </div>
          )}
          {!isLoading && !error && talismans.length === 0 && (
            <TalismanEmptyState
              icon={Sparkles}
              title="No custom talismans yet"
              body="Use the forge to add skills and decoration slots. Your talismans will then be available in the loadout editor."
              compact
            />
          )}
          {!isLoading && talismans.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
        </section>
      </main>
    </div>
  );
}
