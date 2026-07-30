import { AlertTriangle, ChevronRight, Clock3, Link2, Swords } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Typography } from "@/components/ui/typography";
import { formatBuildDate } from "../utils";
import { HunterPanel } from "./hunter-panel";
import type { BuildSummary } from "../types";

function CardTag({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof AlertTriangle;
  label: string;
  tone: "warning" | "primary";
}) {
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
}

/** One build in a grid. `actions` replaces the default "open" chevron. */
export function BuildSummaryCard({
  build,
  actions,
}: {
  build: BuildSummary;
  actions?: React.ReactNode;
}) {
  return (
    <HunterPanel className="group flex min-h-52 flex-col p-5 transition-colors hover:border-primary/45">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="grid size-11 place-items-center border border-primary/35 bg-primary/10 [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]">
          <Swords className="size-5 text-primary" />
        </div>
        <div className="flex gap-2">
          {build.isStale && (
            <CardTag icon={AlertTriangle} label="Old catalog" tone="warning" />
          )}
          {build.isShared && <CardTag icon={Link2} label="Shared" tone="primary" />}
        </div>
      </div>

      <Link
        to="/b/$buildId"
        params={{ buildId: build.id }}
        className="text-xl font-semibold tracking-wide transition-colors group-hover:text-primary"
      >
        {build.name}
      </Link>
      <Typography className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {build.description || "A hunter's equipment record."}
      </Typography>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <Typography
          as="span"
          className="flex items-center gap-1 text-[10px] uppercase tracking-[.15em] text-muted-foreground"
        >
          <Clock3 className="size-3" /> Revised {formatBuildDate(build.updatedAt)}
        </Typography>
        {actions ?? (
          <ChevronRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
        )}
      </div>
    </HunterPanel>
  );
}
