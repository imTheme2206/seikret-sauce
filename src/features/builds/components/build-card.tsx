import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  Clock3,
  Gem,
  Link2,
  Loader2,
  ShieldOff,
  Swords,
  UserRound,
} from "lucide-react";
import { SlotIcon } from "@/components/gear/slot-icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { useSkillCatalog } from "@/features/skills/skill-catalog";
import { POSITION_LABELS, rarityColor } from "@/lib/mh-wilds";
import { POSITION_KEYS } from "../config";
import { createHunterStatus } from "../hunter-status";
import { useSavedBuild } from "../hooks/use-saved-build";
import type { BuildSummary } from "../types";
import { formatBuildDate } from "../utils";
import { HunterPanel } from "./hunter-panel";
import { HunterSkills } from "./hunter-skills";
import { PanelHeading } from "./panel-heading";
import { EquippedWeaponCell } from "./equipped-weapon-row";

/**
 * Expanded Build card shared by the Gathering Hub and the hunter's equipment
 * box. Feed entries contain metadata, so the card resolves the saved snapshot.
 */
export const BuildCard = ({
  summary,
  actions,
}: {
  summary: BuildSummary;
  actions?: React.ReactNode;
}) => {
  const { build, isLoading, error } = useSavedBuild(summary.id);
  const { catalog, isLoading: isLoadingSkills } = useSkillCatalog();

  if (isLoading || isLoadingSkills) {
    return (
      <HunterPanel className="grid min-h-80 place-items-center" aria-busy="true">
        <Loader2 className="size-6 animate-spin text-primary" />
      </HunterPanel>
    );
  }

  if (error || !build) {
    return (
      <HunterPanel className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldOff className="size-6 text-destructive" />
        <Typography as="h3" className="font-semibold">
          {summary.name}
        </Typography>
        <Typography className="text-sm text-muted-foreground">
          This equipment set could not be inspected.
        </Typography>
        <BuildLink id={summary.id} name={summary.name} />
      </HunterPanel>
    );
  }

  const status = createHunterStatus(build.composition, catalog);

  return (
    <HunterPanel className="group">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {build.isShared && (
              <CardTag icon={Link2} label="Shared loadout" tone="primary" />
            )}
            {build.isStale && (
              <CardTag icon={AlertTriangle} label="Old catalog" tone="warning" />
            )}
          </div>
          <Link
            to="/b/$buildId"
            params={{ buildId: build.id }}
            className="text-xl font-semibold tracking-wide transition-colors group-hover:text-primary"
          >
            {build.name}
          </Link>
          <Typography className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {build.description || "A hunter's complete equipment record."}
          </Typography>
          {summary.owner && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar size="sm" className="border border-border">
                <AvatarImage
                  src={summary.owner.avatarUrl ?? undefined}
                  alt={summary.owner.displayName ?? "Build owner"}
                />
                <AvatarFallback>
                  <UserRound className="size-3" />
                </AvatarFallback>
              </Avatar>
              <Typography
                as="span"
                className="text-xs font-medium text-muted-foreground"
              >
                {summary.owner.displayName ?? "Unknown hunter"}
              </Typography>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <Typography
            as="span"
            className="flex items-center gap-1 text-[10px] uppercase tracking-[.15em] text-muted-foreground"
          >
            <Clock3 className="size-3" />
            Revised {formatBuildDate(build.updatedAt)}
          </Typography>
          <div className="flex items-center gap-2">
            <BuildLink id={build.id} name={build.name} />
            {actions}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_.85fr]">
        <section className="border-b border-border p-5 lg:border-r lg:border-b-0">
          <PanelHeading icon={Swords}>Complete equipment set</PanelHeading>
          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            {POSITION_KEYS.map((position) => {
              const piece = build.composition.positions[position];
              const rarity =
                piece && "rarity" in piece ? piece.rarity : undefined;

              return (
                <div
                  key={position}
                  className="flex min-h-24 gap-3 bg-card p-3"
                >
                  <div className="grid size-9 shrink-0 place-items-center border border-primary/25 bg-primary/[.06]">
                    <SlotIcon
                      position={position}
                      color={rarityColor(rarity ?? 0)}
                      size={18}
                    />
                  </div>
                  <div className="min-w-0">
                    <Typography
                      as="div"
                      className="text-[9px] uppercase tracking-[.18em] text-muted-foreground"
                    >
                      {POSITION_LABELS[position]}
                    </Typography>
                    <Typography
                      as="div"
                      className="mt-0.5 truncate text-sm font-medium"
                      title={piece?.name}
                    >
                      {piece?.name ?? "Empty"}
                    </Typography>
                    {piece && piece.decorations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        {piece.decorations.map((decoration) => (
                          <Typography
                            as="span"
                            key={`${decoration.slotIndex}-${decoration.decorationId}`}
                            className="flex items-center gap-1 text-[10px] text-primary"
                          >
                            <Gem className="size-2.5" />
                            {decoration.name}
                          </Typography>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <EquippedWeaponCell
              weapon={build.composition.positions.weapon}
            />
          </div>
        </section>

        <section className="space-y-5 p-5">
          <HunterSkills status={status} />
        </section>
      </div>
    </HunterPanel>
  );
};

const BuildLink = ({ id, name }: { id: string; name: string }) => {
  return (
    <Link
      to="/b/$buildId"
      params={{ buildId: id }}
      aria-label={`Inspect ${name}`}
      className="flex items-center gap-1 text-xs font-medium text-primary"
    >
      Inspect set
      <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
};

const CardTag = ({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof AlertTriangle;
  label: string;
  tone: "warning" | "primary";
}) => {
  return (
    <Typography
      as="span"
      className={
        tone === "warning"
          ? "flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] uppercase tracking-widest text-amber-300"
          : "flex items-center gap-1 border border-primary/30 bg-primary/10 px-2 py-1 text-[9px] uppercase tracking-widest text-primary"
      }
    >
      <Icon className="size-3" /> {label}
    </Typography>
  );
};
