import {
  BookMarked,
  Hammer,
  Loader2,
  LockKeyhole,
  PackageOpen,
  Plus,
  RefreshCw,
  Share2,
  ShieldOff,
  Trash2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  useBuildsHub,
  type BuildsHubController,
  type BuildsView,
} from "../hooks/use-builds-hub";
import { AlertBanner } from "./alert-banner";
import { BuildPageHeader } from "./build-page-header";
import { BuildSummaryCard } from "./build-summary-card";
import { BuildsEmptyState, BuildsGridSkeleton } from "./builds-states";
import type { BuildSummary } from "../types";

const COPY: Record<
  BuildsView,
  { icon: LucideIcon; eyebrow: string; title: string; body: string }
> = {
  mine: {
    icon: BookMarked,
    eyebrow: "Hunter's equipment box",
    title: "My Loadouts",
    body: "Forge and revise equipment records prepared for the Forbidden Lands.",
  },
  shared: {
    icon: Users,
    eyebrow: "Guild expedition archive",
    title: "Gathering Hub",
    body: "Study loadouts posted by fellow hunters and bring one back to your equipment box.",
  },
};

/** `/builds` and `/builds/shared`: the two build feeds behind one layout. */
export function BuildsHub({ view = "mine" }: { view?: BuildsView }) {
  const controller = useBuildsHub(view);
  const copy = COPY[view];

  return (
    <div className="h-full overflow-y-auto">
      <BuildPageHeader
        icon={copy.icon}
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.body}
        action={
          <Button asChild className="gap-2 uppercase tracking-wider">
            <Link to="/builds/new">
              <Plus className="size-4" /> Forge loadout
            </Link>
          </Button>
        }
      />

      <main className="mx-auto max-w-7xl p-5 md:p-10">
        {controller.actionError && (
          <AlertBanner message={controller.actionError} className="mb-5" />
        )}
        {view === "mine" ? (
          <MyBuilds controller={controller} />
        ) : (
          <SharedBuilds controller={controller} />
        )}
      </main>
    </div>
  );
}

function BuildsGrid({ children }: React.PropsWithChildren) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}

function MyBuilds({ controller }: { controller: BuildsHubController }) {
  const { mine, session, signInWithDiscord, toggleShare, removeBuild } = controller;

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

  const confirmRemove = (build: BuildSummary) => {
    if (window.confirm(`Discard “${build.name}” from your equipment box?`)) {
      void removeBuild(build);
    }
  };

  return (
    <BuildsGrid>
      {mine.builds.map((build) => (
        <BuildSummaryCard
          key={build.id}
          build={build}
          actions={
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                title={build.isShared ? "Stop sharing" : "Share build"}
                onClick={(event) => {
                  event.preventDefault();
                  void toggleShare(build);
                }}
              >
                <Share2
                  className={build.isShared ? "size-4 text-primary" : "size-4"}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Delete build"
                onClick={(event) => {
                  event.preventDefault();
                  confirmRemove(build);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          }
        />
      ))}
    </BuildsGrid>
  );
}

function SharedBuilds({ controller }: { controller: BuildsHubController }) {
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
      <BuildsGrid>
        {shared.builds.map((build) => (
          <BuildSummaryCard key={build.id} build={build} />
        ))}
      </BuildsGrid>
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
