import { Shield } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { BuildStats } from "./build-stats";
import { HunterPanel } from "./hunter-panel";
import { SharpnessBar } from "./sharpness-bar";
import type { HunterStatus } from "../hunter-status";
import type { Weapon } from "../types";
import { formatAffinity, formatDamage, formatSpecial, titleCase } from "../weapon-rows";

type HunterStatusPanelProps = {
  status: HunterStatus;
  /** Distinguishes live editor totals from a saved snapshot's totals. */
  subtitle: string;
  className?: string;
  weapon?: Weapon | null;
};

/** Compact, reusable weapon stat summary for Hunter Status and weapon previews. */
export const WeaponStatusPreview = ({ weapon }: { weapon: Weapon }) => (
  <section aria-label="Weapon stats" className="space-y-3">
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <Typography as="h3" className="font-display text-base font-semibold">
        {weapon.name}
      </Typography>
      {weapon.series && (
        <Typography className="text-xs text-muted-foreground">
          {weapon.series}
        </Typography>
      )}
    </div>
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
      <div>
        <Typography as="dt" className="text-xs text-muted-foreground">
          Attack
        </Typography>
        <Typography as="dd" className="font-semibold tabular-nums">
          {formatDamage(weapon)}
        </Typography>
      </div>
      <div>
        <Typography as="dt" className="text-xs text-muted-foreground">
          Affinity
        </Typography>
        <Typography as="dd" className="font-semibold tabular-nums">
          {formatAffinity(weapon.affinity)}
        </Typography>
      </div>
      {weapon.elderseal && (
        <div>
          <Typography as="dt" className="text-xs text-muted-foreground">
            Elderseal
          </Typography>
          <Typography as="dd">{titleCase(weapon.elderseal)}</Typography>
        </div>
      )}
      {weapon.specials.length > 0 && (
        <div className="col-span-2 sm:col-span-3">
          <Typography as="dt" className="text-xs text-muted-foreground">
            Element / status
          </Typography>
          <Typography as="dd" className="font-medium">
            {weapon.specials.map(formatSpecial).join(", ")}
          </Typography>
        </div>
      )}
      {weapon.defenseBonus > 0 && (
        <div>
          <Typography as="dt" className="text-xs text-muted-foreground">
            Defense bonus
          </Typography>
          <Typography as="dd">+{weapon.defenseBonus}</Typography>
        </div>
      )}
    </dl>
    {weapon.sharpness && (
      <div className="space-y-1.5">
        <Typography as="h4" className="text-xs text-muted-foreground">
          Sharpness
        </Typography>
        <SharpnessBar sharpness={weapon.sharpness} />
      </div>
    )}
  </section>
);

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
          <WeaponStatusPreview weapon={weapon} />
        </div>
      )}
      <BuildStats status={status} />
    </HunterPanel>
  );
};
