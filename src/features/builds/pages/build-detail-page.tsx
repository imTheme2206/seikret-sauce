import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  Copy,
  Edit3,
  FileQuestion,
  History,
  ScrollText,
  Share2,
} from "lucide-react";
import { ScreenError, ScreenLoader } from "../components/builds-states";
import { CopyBuildLinkButton } from "../components/copy-build-link-button";
import { EquippedGearRow } from "../components/equipped-gear-row";
import { EquippedWeaponRow } from "../components/equipped-weapon-row";
import { HunterStatusPanel } from "../components/hunter-status-panel";
import { POSITION_KEYS } from "../config";
import { useBuildDetail } from "../hooks/use-build-detail";
import { formatBuildDate } from "../utils";

type BuildDetailPageProps = {
  buildId: string;
};

/** `/b/$buildId`: the public permalink for one saved build. */
export const BuildDetailPage = ({ buildId }: BuildDetailPageProps) => {
  const { build, isLoading, error, isOwner, hunterStatus, message, duplicate } =
    useBuildDetail(buildId);

  if (isLoading) return <ScreenLoader />;
  if (error || !build || !hunterStatus) {
    return (
      <ScreenError
        icon={FileQuestion}
        title="Equipment record not found"
        body="It may be private, deleted, or the link may be incomplete."
        action={
          <Button asChild variant="outline">
            <Link to="/builds">Return to loadouts</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        icon={ScrollText}
        eyebrow="Hunter equipment record"
        title={build.name}
        description={
          build.description || "A loadout forged for the Forbidden Lands."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <CopyBuildLinkButton buildId={build.id} buildName={build.name} />
            <Button
              onClick={() => void duplicate()}
              className="gap-2 uppercase tracking-wider"
            >
              <Copy className="size-4" /> Duplicate loadout
            </Button>
          </div>
        }
      />

      <PageContainer>
        <main className="space-y-5 py-5 md:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Typography
                as="span"
                className="flex items-center gap-1 text-[11px] uppercase tracking-[.18em] text-muted-foreground"
              >
                <History className="size-3" /> Revision {build.revision}
              </Typography>
              <Typography
                as="span"
                className="flex items-center gap-1 text-[11px] uppercase tracking-[.18em] text-muted-foreground"
              >
                <CalendarDays className="size-3" />{" "}
                {formatBuildDate(build.updatedAt)}
              </Typography>
              {build.isShared && (
                <Typography
                  as="span"
                  className="flex items-center gap-1 text-[11px] uppercase tracking-[.18em] text-primary"
                >
                  <Share2 className="size-3" /> Shared
                </Typography>
              )}
              {build.isStale && (
                <Typography
                  as="span"
                  className="flex items-center gap-1 text-[11px] uppercase tracking-[.18em] text-warning"
                  title="The catalog changed after this build was saved."
                >
                  <AlertTriangle className="size-3" /> Catalog changed
                </Typography>
              )}
            </div>
            {isOwner && (
              <Button
                asChild
                variant="outline"
                className="gap-2 uppercase tracking-wider"
              >
                <Link to="/builds/$buildId/edit" params={{ buildId }}>
                  <Edit3 className="size-4" /> Reforge
                </Link>
              </Button>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
            <div className="grid gap-3">
              {POSITION_KEYS.map((position) => (
                <EquippedGearRow
                  key={position}
                  position={position}
                  piece={build.composition.positions[position]}
                />
              ))}
              <EquippedWeaponRow weapon={build.composition.positions.weapon} />
            </div>
            <HunterStatusPanel
              status={hunterStatus}
              subtitle="Verified snapshot totals"
              className="lg:sticky lg:top-5"
            />
          </div>
        </main>
      </PageContainer>
    </>
  );
};
