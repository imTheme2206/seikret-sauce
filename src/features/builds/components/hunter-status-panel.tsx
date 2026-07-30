import { Shield } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { BuildStats } from "./build-stats";
import { HunterPanel } from "./hunter-panel";
import type { BuildSnapshot } from "../types";

interface HunterStatusPanelProps {
  snapshot: BuildSnapshot;
  /** Distinguishes live editor totals from a saved snapshot's totals. */
  subtitle: string;
  className?: string;
}

/** The sticky totals panel shared by the editor and the permalink. */
export function HunterStatusPanel({
  snapshot,
  subtitle,
  className,
}: HunterStatusPanelProps) {
  return (
    <HunterPanel className={cn("h-fit p-5", className)}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Typography as="h2" className="text-xl font-semibold">
            Hunter Status
          </Typography>
          <Typography
            as="p"
            className="text-[9px] uppercase tracking-[.22em] text-primary"
          >
            {subtitle}
          </Typography>
        </div>
        <Shield className="size-6 text-primary/60" />
      </div>
      <BuildStats snapshot={snapshot} />
    </HunterPanel>
  );
}
