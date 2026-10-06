import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  CircleAlert,
  FileQuestion,
  Hammer,
  ListChecks,
  Loader2,
  Save,
  Share2,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  matchingSavedWeapon,
  savedWeaponIdFromOptionValue,
  savedWeaponOptionValue,
  savedWeaponPickerGroups,
} from "@/features/custom-weapons/picker-options";
import { ScreenError, ScreenLoader } from "../components/builds-states";
import { EditorGearRowCard } from "../components/editor-gear-row";
import { EditorWeaponCard } from "../components/editor-weapon-card";
import { EfrPanel } from "../components/efr-panel";
import { HunterPanel } from "../components/hunter-panel";
import { HunterStatusPanel } from "../components/hunter-status-panel";
import { PanelHeading } from "../components/panel-heading";
import { WeaponBonusRow } from "../components/weapon-bonus-row";
import { DRAFT_LIMITS } from "../config";
import {
  useBuildEditor,
  type BuildEditorController,
} from "../hooks/use-build-editor";

/** `/builds/new` and `/builds/$buildId/edit`. */
export const BuildEditorPage = ({ buildId }: { buildId?: string }) => {
  const controller = useBuildEditor(buildId);
  const currentWeapon = controller.draft.composition.weapon;
  const selectedSavedWeapon = matchingSavedWeapon(
    currentWeapon,
    controller.savedWeapons,
  );
  const weaponPickerRow = {
    ...controller.weaponRow,
    value: selectedSavedWeapon
      ? savedWeaponOptionValue(selectedSavedWeapon.id)
      : controller.weaponRow.value,
    groups: [
      ...controller.weaponRow.groups,
      ...savedWeaponPickerGroups(
        controller.savedWeapons,
        controller.weaponCatalog,
        controller.weaponRow.kind,
        controller.artianRules,
      ),
    ],
  };
  const nameInputRef = useRef<HTMLInputElement>(null);
  const equipmentErrorRef = useRef<HTMLParagraphElement>(null);

  /** Saves, or moves focus to the first field that blocks saving. */
  const handleSave = async () => {
    const invalidField = await controller.save();
    if (invalidField === "name") nameInputRef.current?.focus();
    if (invalidField === "equipment") {
      // Wait a frame so the freshly rendered error exists.
      requestAnimationFrame(() => {
        equipmentErrorRef.current?.scrollIntoView({ block: "center" });
        equipmentErrorRef.current?.focus();
      });
    }
  };
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // ⌘S / Ctrl+S saves, matching every other editor.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSaveRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (controller.isLoadingBuild) return <ScreenLoader />;
  if (controller.loadError) {
    return (
      <ScreenError
        icon={FileQuestion}
        title="Could not open this equipment record"
        body="It may have been deleted, or the link may be incomplete."
      />
    );
  }

  return (
    <div className="bg-background">
      <PageHeader
        icon={Hammer}
        eyebrow={controller.isEditing ? "Reforge equipment" : "Equipment forge"}
        title={controller.isEditing ? "Reforge loadout" : "Forge new loadout"}
        description="Equip a piece per slot, socket decorations, then save the record to your equipment box."
      />

      <PageContainer>
        <main className="grid gap-5 py-4 pb-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)] lg:py-7">
          <div className="space-y-5">
            <IdentityPanel controller={controller} nameInputRef={nameInputRef} />

            <MobileBuildSummary controller={controller} />

            <section aria-labelledby="equipment-heading">
              <EquipmentHeading controller={controller} errorRef={equipmentErrorRef} />
              <div className="grid gap-3">
                {controller.rows.map((row) => (
                  <EditorGearRowCard
                    key={row.position}
                    row={row}
                    onSelect={(value) =>
                      controller.selectGear(row.position, value)
                    }
                    onDecoration={(assignment) =>
                      controller.assignDecoration(row.position, assignment)
                    }
                  />
                ))}
                <EditorWeaponCard
                  row={weaponPickerRow}
                  selection={controller.draft.composition.weapon}
                  customizationEditable={false}
                  excludedWeaponIds={controller.excludedWeaponIds}
                  selectedName={selectedSavedWeapon?.name}
                  setBonusOptions={controller.bonusOptions.set}
                  groupBonusOptions={controller.bonusOptions.group}
                  onKindChange={controller.setWeaponKind}
                  onSelect={(value) => {
                    const savedWeaponId = savedWeaponIdFromOptionValue(value);
                    if (savedWeaponId) controller.setSavedWeapon(savedWeaponId);
                    else controller.setWeapon(value);
                  }}
                  onDecoration={controller.assignWeaponDecoration}
                  onCustomize={controller.setWeaponCustomization}
                  onBonus={controller.setWeaponBonus}
                />
                {controller.weaponRow.artian && (
                  <Typography className="px-1 text-xs text-muted-foreground">
                    This Artian roll is saved in this build as a snapshot. To apply a different saved roll, choose it above; saved weapons can be managed in <Link to="/custom-weapons" className="font-medium text-primary underline-offset-4 hover:underline">My Weapons</Link>.
                  </Typography>
                )}
                {/* Bonuses now belong to a Gogma Artian's panel; the row only serves a bonus-only selection. */}
                {!controller.draft.composition.weapon.weaponId &&
                  (controller.draft.composition.weapon.setBonusId ||
                    controller.draft.composition.weapon.groupBonusId) && (
                    <WeaponBonusRow
                      value={controller.draft.composition.weapon}
                      setBonusOptions={controller.bonusOptions.set}
                      groupBonusOptions={controller.bonusOptions.group}
                      onChange={controller.setWeaponBonus}
                    />
                  )}
              </div>
            </section>

            <EfrPanel
              weapon={controller.weaponRow.weapon}
              skills={controller.hunterStatus.skills}
            />
          </div>

          <aside className="hidden h-fit space-y-4 lg:sticky lg:top-4 lg:block">
            <SavePanel controller={controller} onSave={handleSave} />
            <HunterStatusPanel
              status={controller.hunterStatus}
              subtitle="Live equipment totals"
              weapon={controller.weaponRow.weapon}
            />
          </aside>
        </main>
      </PageContainer>

      <MobileSaveBar controller={controller} onSave={handleSave} />

      <Dialog
        open={controller.leaveGuard.status === "blocked"}
        onOpenChange={(open) => !open && controller.leaveGuard.reset?.()}
      >
        <DialogContent className="rounded-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave without saving?</DialogTitle>
            <DialogDescription>
              Your changes to this loadout haven&apos;t been saved and will be
              lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => controller.leaveGuard.reset?.()}>
              Keep editing
            </Button>
            <Button variant="destructive" onClick={() => controller.leaveGuard.proceed?.()}>
              Discard and leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={controller.hasRevisionConflict}
        onOpenChange={controller.setHasRevisionConflict}
      >
        <DialogContent className="rounded-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>A newer revision exists</DialogTitle>
            <DialogDescription>
              This loadout changed elsewhere after you opened it. Reloading
              replaces your unsaved edits with the newest saved revision.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => controller.setHasRevisionConflict(false)}
            >
              Keep editing
            </Button>
            <Button onClick={() => void controller.reloadNewest()}>
              Reload newest revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

type SaveActionProps = {
  controller: BuildEditorController;
  onSave: () => Promise<void>;
};

const SaveButton = ({
  controller,
  onSave,
  className,
}: SaveActionProps & { className?: string }) => {
  return (
    <Button
      onClick={() => void onSave()}
      aria-keyshortcuts="Meta+S Control+S"
      disabled={controller.isSaving || controller.isLoadingCatalog}
      className={className}
    >
      {controller.isSaving ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Save className="size-4" />
      )}
      {controller.isSaving
        ? "Saving…"
        : controller.isEditing
          ? "Save revision"
          : "Save loadout"}
    </Button>
  );
};

/** "Unsaved changes" / "All changes saved" line shared by the desktop panel and mobile bar. */
const SaveStateLine = ({ controller }: { controller: BuildEditorController }) =>
  controller.isDirty ? (
    <Typography as="span" className="flex items-center gap-1.5 text-xs font-medium text-warning">
      <span className="size-1.5 rotate-45 bg-warning" aria-hidden="true" />
      Unsaved changes
    </Typography>
  ) : (
    <Typography as="span" className="text-xs text-muted-foreground">
      {controller.isEditing ? "No unsaved changes" : "Nothing to save yet"}
    </Typography>
  );

const SavePanel = ({ controller, onSave }: SaveActionProps) => {
  const equippedCount = controller.rows.filter((row) => row.name).length;

  return (
    <HunterPanel className="frame-corners p-5">
      <PanelHeading icon={Save} className="mb-2">
        Save equipment record
      </PanelHeading>
      <Typography as="h2" className="font-display text-lg font-semibold tracking-wide">
        {controller.isEditing ? "Commit this revision" : "Ready to forge?"}
      </Typography>
      <Typography className="mt-1 text-xs leading-relaxed text-muted-foreground">
        A name and at least one equipped piece are required.
      </Typography>
      <div className="mt-4 flex items-center justify-between border-y border-border py-3">
        <Typography
          as="span"
          className="text-xs text-muted-foreground"
        >
          Equipment
        </Typography>
        <Typography
          as="span"
          className="text-xs font-semibold tabular-nums text-primary"
        >
          {equippedCount}/6 equipped
        </Typography>
      </div>
      <SaveButton
        controller={controller}
        onSave={onSave}
        className="mt-4 h-10 w-full font-semibold"
      />
      <div className="mt-3 flex items-center justify-between gap-2" aria-live="polite">
        <SaveStateLine controller={controller} />
        <Typography as="span" className="text-[11px] text-muted-foreground">
          <kbd className="font-mono">⌘S</kbd> / <kbd className="font-mono">Ctrl+S</kbd>
        </Typography>
      </div>
      {controller.message && (
        <Typography
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-foreground"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0 text-destructive" aria-hidden="true" />
          {controller.message}
        </Typography>
      )}
    </HunterPanel>
  );
};

const MobileSaveBar = ({ controller, onSave }: SaveActionProps) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-card p-3 lg:hidden">
      <div className="min-w-0 flex-1" aria-live="polite">
        <SaveStateLine controller={controller} />
      </div>
      <SaveButton controller={controller} onSave={onSave} className="h-10 font-semibold" />
    </div>
  );
};

type IdentityPanelProps = {
  controller: BuildEditorController;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
};

const IdentityPanel = ({ controller, nameInputRef }: IdentityPanelProps) => {
  const { draft, patchDraft, errors } = controller;

  return (
    <HunterPanel className="p-5">
      <PanelHeading icon={Sparkles} className="mb-4">
        1 · Record details
      </PanelHeading>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label htmlFor="build-name" className="text-sm font-medium">
              Name <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <Typography
              as="span"
              className="text-xs tabular-nums text-muted-foreground"
              aria-hidden="true"
            >
              {draft.name.length}/{DRAFT_LIMITS.name}
            </Typography>
          </div>
          <Input
            id="build-name"
            ref={nameInputRef}
            value={draft.name}
            maxLength={DRAFT_LIMITS.name}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "build-name-error" : undefined}
            placeholder="e.g. Scarlet Arkveld"
            onChange={(event) => patchDraft({ name: event.target.value })}
            className="rounded-sm bg-background/70"
          />
          {errors.name && <FieldError id="build-name-error">{errors.name}</FieldError>}
        </div>
        <div>
          <label htmlFor="build-notes" className="mb-1.5 block text-sm font-medium">
            Field notes <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="build-notes"
            value={draft.description}
            maxLength={DRAFT_LIMITS.description}
            placeholder="e.g. Burst build for Arkveld"
            onChange={(event) =>
              patchDraft({ description: event.target.value })
            }
            className="rounded-sm bg-background/70"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:col-span-2">
          <Toggle
            variant="outline"
            pressed={draft.isShared}
            onPressedChange={(pressed) => patchDraft({ isShared: pressed })}
            aria-describedby="build-share-help"
            className="gap-2 data-[state=on]:border-primary/50 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
          >
            <Share2 className="size-4" />
            Share in Gathering Hub
          </Toggle>
          <Typography id="build-share-help" as="span" className="text-xs text-muted-foreground">
            {draft.isShared
              ? "Other hunters can find this loadout on the home page."
              : "Only you can see this loadout."}
          </Typography>
        </div>
      </div>
    </HunterPanel>
  );
};

const FieldError = ({ id, children }: React.PropsWithChildren<{ id: string }>) => (
  <Typography id={id} className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
    <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
    {children}
  </Typography>
);

const EquipmentHeading = ({
  controller,
  errorRef,
}: {
  controller: BuildEditorController;
  errorRef: React.RefObject<HTMLParagraphElement | null>;
}) => {
  const equippedCount = controller.rows.filter((row) => row.name).length;
  const error = controller.errors.equipment;

  return (
    <div className="mb-3 flex items-end justify-between gap-4 border-b border-border pb-3">
      <div>
        <PanelHeading icon={ListChecks} className="mb-1">
          2 · Equipment
        </PanelHeading>
        <Typography
          id="equipment-heading"
          as="h2"
          className="font-display text-lg font-semibold tracking-wide"
        >
          Choose each piece <span className="text-destructive" aria-hidden="true">*</span>
        </Typography>
        {error && (
          // Raw <p>: Typography doesn't forward refs, and the page focuses this on a failed save.
          <p
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="mt-1 flex items-center gap-1.5 text-xs text-destructive outline-none"
          >
            <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
      <Typography
        className={cn(
          "text-xs tabular-nums",
          equippedCount > 0 ? "text-primary" : "text-muted-foreground",
        )}
      >
        {equippedCount}/6 equipped
      </Typography>
    </div>
  );
};

const MobileBuildSummary = ({
  controller,
}: {
  controller: BuildEditorController;
}) => {
  return (
    <Collapsible className="border border-border lg:hidden">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center gap-3 bg-card px-4 py-3 text-left"
        >
          <div className="grid size-8 place-items-center border border-primary/30 bg-primary/10">
            <Sparkles className="size-3.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <Typography
              as="div"
              className="text-[11px] font-semibold uppercase tracking-[.16em] text-primary"
            >
              Live summary
            </Typography>
            <Typography as="div" className="text-sm font-semibold">
              Review hunter status
            </Typography>
          </div>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border">
        <HunterStatusPanel
          status={controller.hunterStatus}
          subtitle="Live equipment totals"
          weapon={controller.weaponRow.weapon}
          className="border-0"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
