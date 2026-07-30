import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { Link } from "@tanstack/react-router";
import {
  Hammer,
  Loader2,
  LockKeyhole,
  PackageOpen,
  RefreshCw,
  Share2,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  useBuildsHub,
  type BuildsHubController,
  type BuildsView,
} from "../hooks/use-builds-hub";
import type { BuildSummary } from "../types";
import { AlertBanner } from "./alert-banner";
import { BuildSetCard } from "./build-set-card";
import { BuildSummaryCard } from "./build-summary-card";
import { BuildsEmptyState, BuildsGridSkeleton } from "./builds-states";
import { CopyBuildLinkButton } from "./copy-build-link-button";

/** Reusable build feeds for route pages and embedded feature surfaces. */
export function BuildsHub({
  view = "mine",
  showFullSets = false,
}: {
  view?: BuildsView;
  /** Resolve and display each build's equipment and calculated skills. */
  showFullSets?: boolean;
}) {
  const controller = useBuildsHub(view);

  return (
    <>
      {controller.actionError && (
        <AlertBanner message={controller.actionError} className="mb-5" />
      )}
      {view === "mine" ? (
        <MyBuilds controller={controller} />
      ) : (
        <SharedBuilds controller={controller} showFullSets={showFullSets} />
      )}
    </>
  );
}

function BuildsGrid({ children }: React.PropsWithChildren) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}

function MyBuilds({ controller }: { controller: BuildsHubController }) {
  const { mine, session, signInWithDiscord, toggleShare, removeBuild } =
    controller;
  const [pendingDelete, setPendingDelete] = useState<BuildSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!session && !mine.authLoading) {
    return (
      <BuildsEmptyState
        icon={LockKeyhole}
        title="Your equipment box is sealed"
        body="Sign in with Discord to save, revise, and share your personal loadouts."
        action={
          <Button onClick={signInWithDiscord} className="gap-2">
            <LockKeyhole className="size-4" /> Sign in with Discord
          </Button>
        }
      />
    );
  }
  // Session still resolving: keep the skeleton up rather than flashing "no loadouts".
  if (mine.authLoading || mine.isLoading) return <BuildsGridSkeleton />;
  if (mine.error) {
    return (
      <BuildsEmptyState
        icon={ShieldOff}
        title="Equipment records unavailable"
        body="The Guild could not retrieve your saved loadouts."
      />
    );
  }
  if (!mine.builds.length) {
    return (
      <BuildsEmptyState
        icon={Hammer}
        title="No loadouts forged yet"
        body="Assemble your first armor set and keep it ready for the next hunt."
        action={
          <Button asChild className="gap-2">
            <Link to="/builds/new">
              <Hammer className="size-4" /> Forge first loadout
            </Link>
          </Button>
        }
      />
    );
  }

  const confirmRemove = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const wasDeleted = await removeBuild(pendingDelete);
      if (wasDeleted) setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <BuildsGrid>
        {mine.builds.map((build) => (
          <BuildSummaryCard
            key={build.id}
            build={build}
            actions={
              <div className="flex gap-1">
                <CopyBuildLinkButton
                  buildId={build.id}
                  buildName={build.name}
                  iconOnly
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    build.isShared
                      ? `Stop sharing ${build.name}`
                      : `Share ${build.name}`
                  }
                  title={build.isShared ? "Stop sharing" : "Share loadout"}
                  onClick={(event) => {
                    event.preventDefault();
                    void toggleShare(build);
                  }}
                >
                  <Share2
                    className={
                      build.isShared ? "size-4 text-primary" : "size-4"
                    }
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${build.name}`}
                  title="Delete loadout"
                  onClick={(event) => {
                    event.preventDefault();
                    setPendingDelete(build);
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            }
          />
        ))}
      </BuildsGrid>
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingDelete(null);
        }}
      >
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{pendingDelete?.name}”?</DialogTitle>
            <DialogDescription>
              This permanently removes the loadout from your equipment box and
              invalidates its shared link.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void confirmRemove()}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {isDeleting ? "Deleting…" : "Delete loadout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SharedBuilds({
  controller,
  showFullSets,
}: {
  controller: BuildsHubController;
  showFullSets: boolean;
}) {
  const { shared } = controller;

  if (shared.isLoadingFirstPage) return <BuildsGridSkeleton />;
  if (shared.error) {
    return (
      <BuildsEmptyState
        icon={ShieldOff}
        title="The Gathering Hub is quiet"
        body="Shared loadouts could not be retrieved right now."
      />
    );
  }
  if (!shared.builds.length) {
    return (
      <BuildsEmptyState
        icon={PackageOpen}
        title="No posted loadouts"
        body="No hunters have shared an equipment record yet."
      />
    );
  }

  return (
    <>
      <CollectionHeading
        title="Shared by hunters"
        count={shared.builds.length}
        description="Open a record to inspect it or duplicate it into your equipment box."
      />
      {showFullSets ? (
        <div className="grid gap-5">
          {shared.builds.map((build) => (
            <BuildSetCard key={build.id} summary={build} />
          ))}
        </div>
      ) : (
        <BuildsGrid>
          {shared.builds.map((build) => (
            <BuildSummaryCard key={build.id} build={build} />
          ))}
        </BuildsGrid>
      )}
      {shared.hasMore && (
        <div className="mt-7 text-center">
          <Button
            variant="outline"
            className="gap-2 uppercase tracking-wider"
            disabled={shared.isLoadingMore}
            onClick={shared.loadMore}
          >
            {shared.isLoadingMore ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Load more records
          </Button>
        </div>
      )}
    </>
  );
}

function CollectionHeading({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-end">
      <div>
        <Typography as="h2" className="text-lg font-semibold">
          {title}
        </Typography>
        <Typography className="mt-1 text-xs text-muted-foreground">
          {description}
        </Typography>
      </div>
      <Typography
        as="span"
        className="text-[10px] font-bold uppercase tracking-[.18em] text-primary"
      >
        {count} {count === 1 ? "record" : "records"}
      </Typography>
    </div>
  );
}
