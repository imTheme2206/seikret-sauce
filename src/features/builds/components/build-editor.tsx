import {
  ArrowLeft,
  FileQuestion,
  Hammer,
  Loader2,
  Save,
  Share2,
  Sparkles,
  Tag,
  Text,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Typography } from "@/components/ui/typography";
import { DRAFT_LIMITS } from "../config";
import { useBuildEditor, type BuildEditorController } from "../hooks/use-build-editor";
import { AlertBanner } from "./alert-banner";
import { ScreenError, ScreenLoader } from "./builds-states";
import { EditorGearRowCard } from "./editor-gear-row";
import { HunterPanel } from "./hunter-panel";
import { HunterStatusPanel } from "./hunter-status-panel";
import { PanelHeading } from "./panel-heading";

/** `/builds/new` and `/builds/$buildId/edit`. */
export function BuildEditor({ buildId }: { buildId?: string }) {
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
    <div className="h-full overflow-y-auto bg-background">
      <EditorToolbar controller={controller} />

      <main className="mx-auto grid max-w-[1500px] gap-5 p-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)] lg:p-7">
        <div className="space-y-5">
          <IdentityPanel controller={controller} />

          <div className="grid gap-3">
            {controller.rows.map((row) => (
              <EditorGearRowCard
                key={row.position}
                row={row}
                onSelect={(value) => controller.selectGear(row.position, value)}
                onDecoration={(assignment) =>
                  controller.assignDecoration(row.position, assignment)
                }
              />
            ))}
          </div>
        </div>

        <HunterStatusPanel
          snapshot={controller.snapshot}
          subtitle="Live equipment totals"
          className="lg:sticky lg:top-20"
        />
      </main>
    </div>
  );
}

function EditorToolbar({ controller }: { controller: BuildEditorController }) {
  return (
    <div className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-7">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => history.back()}
        aria-label="Go back"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <Hammer className="size-4 shrink-0 text-primary" />
      <div>
        <Typography as="div" className="text-base font-semibold">
          {controller.isEditing ? "Reforge Loadout" : "Forge New Loadout"}
        </Typography>
        <Typography
          as="div"
          className="text-[9px] uppercase tracking-[.22em] text-primary"
        >
          Equipment assembly
        </Typography>
      </div>
      <Button
        onClick={() => void controller.save()}
        disabled={controller.isSaving || controller.isLoadingCatalog}
        className="ml-auto gap-2 uppercase tracking-wider"
      >
        {controller.isSaving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {controller.isEditing ? "Save revision" : "Save loadout"}
      </Button>
    </div>
  );
}

function IdentityPanel({ controller }: { controller: BuildEditorController }) {
  const { draft, patchDraft } = controller;

  return (
    <HunterPanel className="p-5">
      <PanelHeading icon={Sparkles} className="mb-4">
        Loadout identity
      </PanelHeading>

      <div className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto]">
        <label className="block">
          <Typography
            as="span"
            className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <Tag className="size-3" /> Name
          </Typography>
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
            onChange={(event) => patchDraft({ description: event.target.value })}
            className="rounded-none bg-background/70"
          />
        </label>
        <Toggle
          variant="outline"
          pressed={draft.isShared}
          onPressedChange={(pressed) => patchDraft({ isShared: pressed })}
          className="gap-2 self-end data-[state=on]:border-primary/50 data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
        >
          <Share2 className="size-4" /> Share with hunters
        </Toggle>
      </div>

      {controller.message && (
        <AlertBanner message={controller.message} className="mt-4" />
      )}
    </HunterPanel>
  );
}
