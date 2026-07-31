import { PageHeader } from "@/components/page-header";
import { PageContainer } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useSkillCatalog } from "@/features/skills/skill-catalog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Boxes, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTalismans } from "../hooks/use-talismans";
import { MAX_TALISMANS_PER_USER, type CreateTalismanInput } from "../types";
import { TalismanCard } from "./talisman-card";
import { TalismanEmptyState } from "./talisman-empty-state";
import { TalismanForm } from "./talisman-form";

/** Banner + page column shared by every state of the talismans screen. */
const TalismansFrame = ({ children }: React.PropsWithChildren) => (
  <>
    <PageHeader
      icon={Sparkles}
      eyebrow="Custom equipment"
      title="Talismans"
      description="Forge the talismans you own so the optimizer and the set builder can equip them."
    />
    <PageContainer>{children}</PageContainer>
  </>
);

/** "Talismans" tab: CRUD over the signed-in user's custom talismans. */
export const TalismansTab = () => {
  const { session, isLoading: isAuthLoading, signInWithDiscord } = useAuth();
  const { catalog, isLoading: isLoadingSkills } = useSkillCatalog();
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
      <TalismansFrame>
        <div className="py-5 md:py-8">
          <Skeleton className="h-48 rounded-none" />
        </div>
      </TalismansFrame>
    );
  }

  if (!session) {
    return (
      <TalismansFrame>
        <main className="py-5 md:py-8">
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
      </TalismansFrame>
    );
  }

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
    <TalismansFrame>
      <main className="grid items-start gap-6 py-5 md:py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6">
          <TalismanForm
            catalog={catalog}
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
                  skillMetaById={catalog?.byId}
                  onDelete={(id) => void handleDelete(id)}
                  isDeleting={deletingId === t.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </TalismansFrame>
  );
};
