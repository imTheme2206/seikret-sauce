import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { buildArtianPanel, effectiveWeapon } from "@/features/builds/artian";
import { EditorWeaponCard } from "@/features/builds/components/editor-weapon-card";
import { RarityPips } from "@/features/builds/components/rarity-pips";
import { WeaponStatusDetail } from "@/features/builds/components/weapon-status-detail";
import { EMPTY_DRAFT, weaponKindConfig } from "@/features/builds/config";
import { useWeaponCatalog } from "@/features/builds/hooks/use-catalog";
import type {
  ArtianRules,
  EditorWeaponSelection,
  Weapon,
  WeaponKind,
} from "@/features/builds/types";
import { buildWeaponRowFor, titleCase } from "@/features/builds/weapon-rows";
import { equipWeapon } from "@/features/builds/weapon-selection";
import type { SkillCatalog as SharedSkillCatalog } from "@/features/skills/skill-catalog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import {
  Boxes,
  CircleAlert,
  LockKeyhole,
  Plus,
  Swords,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCustomWeapons } from "../hooks/use-custom-weapons";
import {
  MAX_CUSTOM_WEAPONS_PER_USER,
  type CreateCustomWeaponInput,
  type CustomWeapon,
} from "../types";

const SavedWeaponCard = ({
  savedWeapon,
  base,
  rules,
  skills,
  deleting,
  onDelete,
}: {
  savedWeapon: CustomWeapon;
  base: Weapon | undefined;
  rules: ArtianRules | undefined;
  skills: SharedSkillCatalog | undefined;
  deleting: boolean;
  onDelete: () => void;
}) => {
  const weapon =
    base && rules
      ? effectiveWeapon(base, savedWeapon.customization, rules)
      : undefined;
  const artian =
    base && buildArtianPanel(base, savedWeapon.customization, rules);
  const bonuses = [
    { id: savedWeapon.setBonusId, kind: "set" as const },
    { id: savedWeapon.groupBonusId, kind: "group" as const },
  ].flatMap(({ id, kind }) => {
    const bonus = skills?.bonuses[kind].find((entry) => entry.id === id);
    return bonus ? [{ name: bonus.name, kind }] : [];
  });
  const { customization } = savedWeapon;

  return (
    <Card className="rounded-sm border-border bg-card py-0 shadow-none">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-primary/25 bg-primary/[.08]">
            {base ? (
              <img
                src={weaponKindConfig(base.kind).image}
                alt=""
                className="size-7 object-contain"
              />
            ) : (
              <Swords className="size-5 text-primary" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <Typography
              as="h3"
              className="break-words font-display text-lg font-semibold leading-tight"
            >
              {savedWeapon.name}
            </Typography>
            <Typography className="mt-1 text-xs text-muted-foreground">
              {base?.name ?? "Artian weapon"} ·{" "}
              {base?.artian?.family === "gogma" ? "Gogma Artian" : "Artian"}
            </Typography>
            {base && (
              <div className="mt-2">
                <RarityPips value={base.rarity} />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${savedWeapon.name}`}
            disabled={deleting}
            onClick={onDelete}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {weapon ? (
          <WeaponStatusDetail
            weapon={weapon}
            showName={false}
            showEmptyValues
            showSkills
            bonuses={bonuses}
            sharpnessBonus={artian?.sharpnessBonus}
            className="border-y border-border/70 py-3"
          />
        ) : (
          <Typography className="text-xs text-muted-foreground">
            Weapon details are unavailable until the catalog loads.
          </Typography>
        )}

        <div className="space-y-2 border-t border-border/70 pt-3">
          <Typography className="text-xs font-medium">Forge setup</Typography>
          <div className="flex flex-wrap gap-1.5">
            {customization.element && (
              <Badge variant="secondary">
                {titleCase(customization.element)}
              </Badge>
            )}
            <Badge
              variant={customization.elementInfusion ? "secondary" : "outline"}
            >
              {customization.elementInfusion
                ? "Element infused"
                : "No infusion"}
            </Badge>
            {customization.attackParts > 0 && (
              <Badge variant="outline">
                Attack parts {customization.attackParts}
              </Badge>
            )}
            {customization.affinityParts > 0 && (
              <Badge variant="outline">
                Affinity parts {customization.affinityParts}
              </Badge>
            )}
            {customization.reinforcements.map((reinforcement, index) => (
              <Badge key={`${reinforcement.type}-${index}`} variant="outline">
                {reinforcement.type === "ammo"
                  ? "Ammo capacity"
                  : titleCase(reinforcement.type)}{" "}
                {reinforcement.level}
              </Badge>
            ))}
            {customization.reinforcements.length === 0 && (
              <Typography
                as="span"
                className="self-center text-xs text-muted-foreground"
              >
                No reinforcements
              </Typography>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [selection, setSelection] = useState<EditorWeaponSelection>(
    EMPTY_DRAFT.composition.weapon,
  );
  const [chosenKind, setChosenKind] = useState<WeaponKind | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const row = useMemo(
    () =>
      buildWeaponRowFor(
        selection,
        catalog.weapons,
        chosenKind,
        [],
        catalog.artianRules,
      ),
    [selection, catalog.weapons, chosenKind, catalog.artianRules],
  );
  const artianIds = useMemo(
    () =>
      new Set(
        catalog.weapons
          .filter((weapon) => weapon.artian)
          .map((weapon) => weapon.id),
      ),
    [catalog.weapons],
  );
  const forgeRow = useMemo(
    () => ({
      ...row,
      groups: row.groups
        .map((group) => ({
          ...group,
          options: group.options.filter((option) => artianIds.has(option.id)),
        }))
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
    (row.weapon?.artian?.family !== "gogma" ||
      Boolean(selection.setBonusId && selection.groupBonusId));

  if (isAuthLoading) {
    return (
      <CustomWeaponFrame>
        <div className="py-6">
          <Skeleton className="h-96 rounded-sm" />
        </div>
      </CustomWeaponFrame>
    );
  }

  if (!session) {
    return (
      <CustomWeaponFrame>
        <main className="py-6">
          <EmptyState
            icon={LockKeyhole}
            title="Your weapon forge is sealed"
            description="Sign in with Discord to save custom Artian and Gogma Artian rolls for your builds."
            action={
              <Button onClick={() => void signInWithDiscord()}>
                <LockKeyhole className="size-4" />
                Sign in with Discord
              </Button>
            }
          />
        </main>
      </CustomWeaponFrame>
    );
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Name your weapon",
        description: "Enter a name before saving this roll.",
      });
      return;
    }
    if (!row.weapon?.artian || !row.artian || row.artian.issue) {
      toast({
        variant: "destructive",
        title: "Check the weapon configuration",
        description:
          row.artian?.issue ?? "Choose an Artian or Gogma Artian weapon.",
      });
      return;
    }
    if (
      row.weapon.artian.family === "gogma" &&
      (!selection.setBonusId || !selection.groupBonusId)
    ) {
      toast({
        variant: "destructive",
        title: "Choose both Gogma bonuses",
        description: "Gogma Artian weapons need a Set Bonus and a Group Bonus.",
      });
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
      toast({
        variant: "success",
        title: "Weapon saved",
        description: `${input.name} is ready for your builds.`,
      });
      setName("");
      setSelection(EMPTY_DRAFT.composition.weapon);
      setChosenKind(null);
      setCreateOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not save weapon",
        description:
          error instanceof Error ? error.message : "Failed to save weapon.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await saved.remove(id);
      toast({
        variant: "success",
        title: "Weapon deleted",
        description: "The saved weapon was removed from your box.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not delete weapon",
        description:
          error instanceof Error ? error.message : "Failed to delete weapon.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <CustomWeaponFrame>
      <main className="py-5 md:py-8">
        <section aria-labelledby="saved-weapons-heading">
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <Typography
                as="div"
                className="mb-1 flex items-center gap-2 text-xs font-medium text-primary"
              >
                <Boxes className="size-3.5" aria-hidden="true" />
                Equipment box
              </Typography>
              <Typography
                id="saved-weapons-heading"
                as="h2"
                className="font-display text-xl font-semibold tracking-wide"
              >
                Saved weapons
              </Typography>
              <Typography className="mt-1 text-xs tabular-nums text-muted-foreground">
                {saved.weapons.length} of {MAX_CUSTOM_WEAPONS_PER_USER} used
              </Typography>
            </div>
            <Button
              disabled={
                saved.weapons.length >= MAX_CUSTOM_WEAPONS_PER_USER ||
                saved.isLoading ||
                Boolean(saved.error) ||
                catalog.isLoading ||
                Boolean(catalog.error)
              }
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Forge weapon
            </Button>
          </div>
          {(catalog.isLoading || saved.isLoading) && (
            <div className="grid gap-3 lg:grid-cols-2">
              <Skeleton className="h-72 rounded-sm" />
              <Skeleton className="h-72 rounded-sm" />
            </div>
          )}
          {catalog.error && (
            <EmptyState
              icon={CircleAlert}
              tone="error"
              title="Could not load the weapon catalog"
              description={catalog.error.message}
              compact
            />
          )}
          {saved.error && (
            <EmptyState
              icon={CircleAlert}
              tone="error"
              title="Could not load saved weapons"
              description={saved.error.message}
              compact
              action={
                <Button variant="outline" onClick={saved.retry}>
                  Try again
                </Button>
              }
            />
          )}
          {!catalog.isLoading &&
            !catalog.error &&
            !saved.isLoading &&
            !saved.error &&
            saved.weapons.length === 0 && (
              <EmptyState
                icon={Swords}
                title="No custom weapons yet"
                description="Forge an Artian or Gogma Artian roll. It will then be available in the build editor."
                compact
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4" />
                    Forge your first weapon
                  </Button>
                }
              />
            )}
          {!catalog.isLoading &&
            !catalog.error &&
            !saved.isLoading &&
            !saved.error &&
            saved.weapons.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                {saved.weapons.map((weapon) => {
                  const base = catalog.weapons.find(
                    (candidate) => candidate.id === weapon.weaponId,
                  );
                  return (
                    <SavedWeaponCard
                      key={weapon.id}
                      savedWeapon={weapon}
                      base={base}
                      rules={catalog.artianRules}
                      skills={catalog.skillCatalog}
                      deleting={deletingId === weapon.id}
                      onDelete={() => void handleDelete(weapon.id)}
                    />
                  );
                })}
              </div>
            )}
          {saved.weapons.length >= MAX_CUSTOM_WEAPONS_PER_USER && (
            <Typography className="mt-4 text-xs text-muted-foreground">
              Your weapon box is full. Delete a saved weapon to make room.
            </Typography>
          )}
        </section>
      </main>
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!isSaving) setCreateOpen(open);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Forge a weapon
            </DialogTitle>
            <DialogDescription>
              Configure an Artian or Gogma Artian roll and save it to your
              equipment box.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="min-w-0 space-y-4"
          >
            <div>
              <label
                htmlFor="custom-weapon-name"
                className="mb-1.5 block text-sm font-medium"
              >
                Saved weapon name
              </label>
              <Input
                id="custom-weapon-name"
                value={name}
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Fire Focus GS"
                className="rounded-sm bg-background/70"
              />
            </div>
            <EditorWeaponCard
              row={forgeRow}
              selection={selection}
              setBonusOptions={catalog.skillCatalog?.bonuses.set ?? []}
              groupBonusOptions={catalog.skillCatalog?.bonuses.group ?? []}
              onKindChange={(kind) => {
                setChosenKind(kind);
                setSelection((current) =>
                  equipWeapon(
                    current,
                    "",
                    catalog.weapons,
                    catalog.artianRules,
                  ),
                );
              }}
              onSelect={(weaponId) =>
                setSelection((current) =>
                  equipWeapon(
                    current,
                    weaponId,
                    catalog.weapons,
                    catalog.artianRules,
                  ),
                )
              }
              onCustomize={(customization) =>
                setSelection((current) => ({ ...current, customization }))
              }
              onBonus={(kind, bonusId) =>
                setSelection((current) => ({ ...current, [kind]: bonusId }))
              }
            />
            {row.weapon && (
              <Card className="rounded-sm border-border bg-card py-0 shadow-none">
                <CardContent className="p-4">
                  <Typography as="h2" className="mb-3 text-sm font-semibold">
                    Live weapon stats
                  </Typography>
                  <WeaponStatusDetail weapon={row.weapon} />
                </CardContent>
              </Card>
            )}
            <div className="flex flex-col-reverse items-center justify-end gap-2 border-t border-border pt-4 sm:flex-row">
              {!isSaving && !canSave && (
                <Typography className="flex-1 text-xs text-muted-foreground">
                  {catalog.isLoading
                    ? "Loading weapon rules…"
                    : !name.trim()
                      ? "Enter a name to save this weapon."
                      : (row.artian?.issue ??
                        (row.weapon?.artian?.family === "gogma" &&
                        (!selection.setBonusId || !selection.groupBonusId)
                          ? "Choose both the Gogma Set Bonus and Group Bonus."
                          : row.weapon
                            ? "Choose an Artian or Gogma Artian base."
                            : "Choose an Artian or Gogma Artian weapon and configure its roll."))}
                </Typography>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !canSave}
                className="font-semibold"
              >
                {isSaving ? "Saving weapon…" : "Save custom weapon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CustomWeaponFrame>
  );
};
