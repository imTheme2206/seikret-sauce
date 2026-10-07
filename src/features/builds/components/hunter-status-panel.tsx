import { Shield } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { BuildStats } from "./build-stats";
import { HunterPanel } from "./hunter-panel";
import { WeaponStatusDetail } from "./weapon-status-detail";
import type { HunterStatus } from "../hunter-status";
import type { Weapon } from "../types";

type HunterStatusPanelProps = {
  status: HunterStatus;
  /** Distinguishes live editor totals from a saved snapshot's totals. */
  subtitle: string;
  className?: string;
  weapon?: Weapon | null;
};

/** The sticky totals panel shared by the editor and the permalink. */
export const HunterStatusPanel = ({
  status,
  subtitle,
  className,
  weapon,
}: HunterStatusPanelProps) => {
  return (
    <HunterPanel className={cn("h-fit p-5", className)}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Typography as="h2" className="font-display text-xl font-semibold tracking-wide">
            Hunter Status
          </Typography>
          <Typography
            as="p"
            className="text-[11px] uppercase tracking-[.16em] text-primary"
          >
            {subtitle}
          </Typography>
        </div>
        <Shield className="size-6 text-primary/60" aria-hidden="true" />
      </div>
      {weapon && (
        <div className="mb-5 border-b border-border pb-5">
          <WeaponStatusDetail weapon={weapon} />
        </div>
      )}
      <BuildStats status={status} />
    </HunterPanel>
  );
};
