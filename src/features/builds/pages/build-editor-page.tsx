import { PageHeader } from "@/components/page-header";
import { PageContainer } from "@/components/page-layout";
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
import {
  ChevronDown,
  FileQuestion,
  Hammer,
  ListChecks,
  Loader2,
  Save,
  Share2,
  Sparkles,
  Tag,
  Text,
} from "lucide-react";
import { ScreenError, ScreenLoader } from "../components/builds-states";
import { EditorGearRowCard } from "../components/editor-gear-row";
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
            <IdentityPanel controller={controller} />

            <MobileBuildSummary controller={controller} />

            <section aria-labelledby="equipment-heading">
              <EquipmentHeading controller={controller} />
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
                <WeaponBonusRow
                  value={controller.draft.composition.weapon}
                  setBonusOptions={controller.bonusOptions.set}
                  groupBonusOptions={controller.bonusOptions.group}
                  onChange={controller.setWeaponBonus}
                />
              </div>
            </section>
          </div>

          <aside className="hidden h-fit space-y-4 lg:sticky lg:top-4 lg:block">
            <SavePanel controller={controller} />
            <HunterStatusPanel
              status={controller.hunterStatus}
              subtitle="Live equipment totals"
            />
          </aside>
        </main>
      </PageContainer>

      <MobileSaveBar controller={controller} />

      <Dialog
        open={controller.hasRevisionConflict}
        onOpenChange={controller.setHasRevisionConflict}
      >
        <DialogContent className="rounded-none sm:max-w-md">
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

const SaveButton = ({
  controller,
  className,
}: {
  controller: BuildEditorController;
  className?: string;
}) => {
  return (
    <Button
      onClick={() => void controller.save()}
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

const SavePanel = ({ controller }: { controller: BuildEditorController }) => {
  const equippedCount = controller.rows.filter((row) => row.name).length;

  return (
    <HunterPanel className="p-5">
      <PanelHeading icon={Save} className="mb-2">
        Save equipment record
      </PanelHeading>
      <Typography as="h2" className="text-lg font-semibold">
        {controller.isEditing ? "Commit this revision" : "Ready to forge?"}
      </Typography>
      <Typography className="mt-1 text-xs leading-relaxed text-muted-foreground">
        A name and at least one equipped piece are required.
      </Typography>
      <div className="mt-4 flex items-center justify-between border-y border-border py-3">
        <Typography
          as="span"
          className="text-[10px] uppercase tracking-[.18em] text-muted-foreground"
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
        className="mt-4 w-full rounded-none uppercase tracking-wider"
      />
    </HunterPanel>
  );
};

const MobileSaveBar = ({ controller }: { controller: BuildEditorController }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
      <SaveButton
        controller={controller}
        className="w-full rounded-none uppercase tracking-wider"
      />
    </div>
  );
};

const IdentityPanel = ({ controller }: { controller: BuildEditorController }) => {
  const { draft, patchDraft } = controller;

  return (
    <HunterPanel className="p-5">
      <PanelHeading icon={Sparkles} className="mb-4">
        1 · Record details
      </PanelHeading>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1.5fr_auto]">
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between gap-2">
            <Typography
              as="span"
              className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              <Tag className="size-3" /> Name
            </Typography>
            <Typography
              as="span"
              className="text-[9px] tabular-nums text-muted-foreground"
            >
              {draft.name.length}/{DRAFT_LIMITS.name}
            </Typography>
          </span>
          <Input
            value={draft.name}
            maxLength={DRAFT_LIMITS.name}
            placeholder="e.g. Scarlet Arkveld"
            onChange={(event) => patchDraft({ name: event.target.value })}
            className="rounded-none bg-background/70"
          />
        </label>
        <label className="block">
          <Typography
            as="span"
            className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <Text className="size-3" /> Field notes
          </Typography>
          <Input
            value={draft.description}
            maxLength={DRAFT_LIMITS.description}
            placeholder="What this loadout is built to hunt…"
            onChange={(event) =>
              patchDraft({ description: event.target.value })
            }
            className="rounded-none bg-background/70"
          />
        </label>
        <Toggle
          variant="outline"
          pressed={draft.isShared}
          onPressedChange={(pressed) => patchDraft({ isShared: pressed })}
          className="gap-2 self-end md:col-span-2 xl:col-span-1 data-[state=on]:border-primary/50 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
        >
          <Share2 className="size-4" />
          {draft.isShared ? "Shared with hunters" : "Keep private"}
        </Toggle>
      </div>
    </HunterPanel>
  );
};

const EquipmentHeading = ({
  controller,
}: {
  controller: BuildEditorController;
}) => {
  const equippedCount = controller.rows.filter((row) => row.name).length;

  return (
    <div className="mb-3 flex items-end justify-between gap-4 border-b border-border pb-3">
      <div>
        <PanelHeading icon={ListChecks} className="mb-1">
          2 · Equipment
        </PanelHeading>
        <Typography
          id="equipment-heading"
          as="h2"
          className="text-lg font-semibold"
        >
          Choose each piece
        </Typography>
      </div>
      <Typography className="text-xs tabular-nums text-muted-foreground">
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
              className="text-[9px] font-bold uppercase tracking-[.2em] text-primary"
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
          className="border-0"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
