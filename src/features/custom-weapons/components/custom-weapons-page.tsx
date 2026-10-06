import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useWeaponCatalog } from "@/features/builds/hooks/use-catalog";
import { EMPTY_DRAFT } from "@/features/builds/config";
import { equipWeapon } from "@/features/builds/weapon-selection";
import { buildWeaponRowFor } from "@/features/builds/weapon-rows";
import { EditorWeaponCard } from "@/features/builds/components/editor-weapon-card";
import { WeaponStatusPreview } from "@/features/builds/components/hunter-status-panel";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Boxes, CircleAlert, LockKeyhole, Swords, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { EditorWeaponSelection, WeaponKind } from "@/features/builds/types";
import { useCustomWeapons } from "../hooks/use-custom-weapons";
import { MAX_CUSTOM_WEAPONS_PER_USER, type CreateCustomWeaponInput } from "../types";

const CustomWeaponFrame = ({ children }: React.PropsWithChildren) => (
  <>
    <PageHeader
      icon={Swords}
      eyebrow="Custom equipment"
      title="Artian Weapons"
      description="Save your Artian and Gogma Artian rolls once, then equip them in any build."
    />
    <PageContainer>{children}</PageContainer>
  </>
);

/** Forge and manage saved Artian / Gogma Artian weapon configurations. */
export const CustomWeaponsPage = () => {
  const { session, isLoading: isAuthLoading, signInWithDiscord } = useAuth();
  const catalog = useWeaponCatalog();
  const saved = useCustomWeapons();
  const [name, setName] = useState("");
  const [selection, setSelection] = useState<EditorWeaponSelection>(EMPTY_DRAFT.composition.weapon);
  const [chosenKind, setChosenKind] = useState<WeaponKind | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const row = useMemo(
    () => buildWeaponRowFor(selection, catalog.weapons, chosenKind, [], catalog.artianRules),
    [selection, catalog.weapons, chosenKind, catalog.artianRules],
  );
  const artianIds = useMemo(
    () => new Set(catalog.weapons.filter((weapon) => weapon.artian).map((weapon) => weapon.id)),
    [catalog.weapons],
  );
  const forgeRow = useMemo(
    () => ({
      ...row,
      groups: row.groups
        .map((group) => ({ ...group, options: group.options.filter((option) => artianIds.has(option.id)) }))
        .filter((group) => group.options.length > 0),
    }),
    [row, artianIds],
  );
  const canSave =
    !catalog.isLoading &&
    !catalog.error &&
    !saved.isLoading &&
    saved.weapons.length < MAX_CUSTOM_WEAPONS_PER_USER &&
    Boolean(name.trim()) &&
    Boolean(row.weapon?.artian && row.artian && !row.artian.issue) &&
    (row.weapon?.artian?.family !== "gogma" || Boolean(selection.setBonusId && selection.groupBonusId));

  if (isAuthLoading) {
    return <CustomWeaponFrame><div className="py-6"><Skeleton className="h-96 rounded-sm" /></div></CustomWeaponFrame>;
  }

  if (!session) {
    return (
      <CustomWeaponFrame>
        <main className="py-6">
          <EmptyState
            icon={LockKeyhole}
            title="Your weapon forge is sealed"
            description="Sign in with Discord to save custom Artian and Gogma Artian rolls for your builds."
            action={<Button onClick={() => void signInWithDiscord()}><LockKeyhole className="size-4" />Sign in with Discord</Button>}
          />
        </main>
      </CustomWeaponFrame>
    );
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Name your weapon", description: "Enter a name before saving this roll." });
      return;
    }
    if (!row.weapon?.artian || !row.artian || row.artian.issue) {
      toast({ variant: "destructive", title: "Check the weapon configuration", description: row.artian?.issue ?? "Choose an Artian or Gogma Artian weapon." });
      return;
    }
    if (row.weapon.artian.family === "gogma" && (!selection.setBonusId || !selection.groupBonusId)) {
      toast({ variant: "destructive", title: "Choose both Gogma bonuses", description: "Gogma Artian weapons need a Set Bonus and a Group Bonus." });
      return;
    }
    setIsSaving(true);
    const input: CreateCustomWeaponInput = {
      name: name.trim(),
      weaponId: row.weapon.id,
      customization: row.artian.config,
      setBonusId: selection.setBonusId,
      groupBonusId: selection.groupBonusId,
    };
    try {
      await saved.create(input);
      toast({ variant: "success", title: "Weapon saved", description: `${input.name} is ready for your builds.` });
      setName("");
      setSelection(EMPTY_DRAFT.composition.weapon);
      setChosenKind(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Could not save weapon", description: error instanceof Error ? error.message : "Failed to save weapon." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await saved.remove(id);
      toast({ variant: "success", title: "Weapon deleted", description: "The saved weapon was removed from your box." });
    } catch (error) {
      toast({ variant: "destructive", title: "Could not delete weapon", description: error instanceof Error ? error.message : "Failed to delete weapon." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <CustomWeaponFrame>
      <main className="grid items-start gap-6 py-5 md:py-8 lg:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
        <form onSubmit={(event) => void handleCreate(event)} className="min-w-0 space-y-3 lg:sticky lg:top-6">
          {catalog.error && (
            <Typography role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Could not load the weapon catalog: {catalog.error.message}
            </Typography>
          )}
          <div>
            <label htmlFor="custom-weapon-name" className="mb-1.5 block text-sm font-medium">Saved weapon name</label>
            <Input id="custom-weapon-name" value={name} maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="e.g. Fire Focus GS" className="rounded-sm bg-background/70" />
          </div>
          <EditorWeaponCard
            row={forgeRow}
            selection={selection}
            setBonusOptions={catalog.skillCatalog?.bonuses.set ?? []}
            groupBonusOptions={catalog.skillCatalog?.bonuses.group ?? []}
            onKindChange={(kind) => {
              setChosenKind(kind);
              setSelection((current) => equipWeapon(current, "", catalog.weapons, catalog.artianRules));
            }}
            onSelect={(weaponId) => setSelection((current) => equipWeapon(current, weaponId, catalog.weapons, catalog.artianRules))}
            onCustomize={(customization) => setSelection((current) => ({ ...current, customization }))}
            onBonus={(kind, bonusId) => setSelection((current) => ({ ...current, [kind]: bonusId }))}
          />
          {row.weapon && (
            <Card className="rounded-sm border-border bg-card py-0 shadow-none">
              <CardContent className="p-4">
                <Typography as="h2" className="mb-3 text-sm font-semibold">Live weapon stats</Typography>
                <WeaponStatusPreview weapon={row.weapon} />
              </CardContent>
            </Card>
          )}
          <Button type="submit" disabled={isSaving || !canSave} className="h-10 w-full font-semibold">
            {isSaving ? "Saving weapon…" : "Save custom weapon"}
          </Button>
          {!isSaving && !canSave && (
            <Typography className="text-center text-xs text-muted-foreground">
              {catalog.isLoading ? "Loading weapon rules…" : !name.trim() ? "Enter a name to save this weapon." : row.artian?.issue ?? (row.weapon?.artian?.family === "gogma" && (!selection.setBonusId || !selection.groupBonusId) ? "Choose both the Gogma Set Bonus and Group Bonus." : row.weapon ? "Choose an Artian or Gogma Artian base." : "Choose an Artian or Gogma Artian weapon and configure its roll.")}
            </Typography>
          )}
          {saved.weapons.length >= MAX_CUSTOM_WEAPONS_PER_USER && (
            <Typography className="text-center text-xs text-muted-foreground">Your weapon box is full. Delete a saved weapon to make room.</Typography>
          )}
        </form>

        <section aria-labelledby="saved-weapons-heading" className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <Typography as="div" className="mb-1 flex items-center gap-2 text-xs font-medium text-primary"><Boxes className="size-3.5" aria-hidden="true" />Equipment box</Typography>
              <Typography id="saved-weapons-heading" as="h2" className="font-display text-xl font-semibold tracking-wide">Saved weapons</Typography>
            </div>
            <Typography as="span" className="shrink-0 text-xs tabular-nums text-muted-foreground">{saved.weapons.length} of {MAX_CUSTOM_WEAPONS_PER_USER} used</Typography>
          </div>
          {catalog.isLoading && <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-32 rounded-sm" /><Skeleton className="h-32 rounded-sm" /></div>}
          {catalog.error && <EmptyState icon={CircleAlert} tone="error" title="Could not load the weapon catalog" description={catalog.error.message} compact />}
          {saved.error && <EmptyState icon={CircleAlert} tone="error" title="Could not load saved weapons" description={saved.error.message} compact action={<Button variant="outline" onClick={saved.retry}>Try again</Button>} />}
          {!saved.isLoading && !saved.error && saved.weapons.length === 0 && (
            <EmptyState icon={Swords} title="No custom weapons yet" description="Forge an Artian or Gogma Artian roll. It will then be available in the build editor." compact />
          )}
          {!saved.isLoading && saved.weapons.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {saved.weapons.map((weapon) => {
                const base = catalog.weapons.find((candidate) => candidate.id === weapon.weaponId);
                return (
                  <Card key={weapon.id} className="rounded-sm border-border bg-card py-0 shadow-none">
                    <CardContent className="flex items-start gap-3 p-4">
                      <Swords className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <Typography as="h3" className="truncate font-semibold">{weapon.name}</Typography>
                        <Typography className="mt-1 text-xs text-muted-foreground">{base?.name ?? "Artian weapon"} · {base?.artian?.family === "gogma" ? "Gogma Artian" : "Artian"}</Typography>
                        <Typography className="mt-2 text-xs text-muted-foreground">{weapon.customization.element ?? "No element"} · {weapon.customization.reinforcements.length} reinforcements</Typography>
                      </div>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${weapon.name}`} disabled={deletingId === weapon.id} onClick={() => void handleDelete(weapon.id)}><Trash2 className="size-4" /></Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </CustomWeaponFrame>
  );
};
