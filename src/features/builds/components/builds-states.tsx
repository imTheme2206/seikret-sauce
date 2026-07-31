/**
 * Non-content states shared by the builds screens: empty boxes, whole-screen
 * loading and load failures, plus the card-grid skeleton.
 */

import { AlertTriangle, Loader2, PackageOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

/** Empty state for a list that loaded fine but has nothing in it. */
export const BuildsEmptyState = ({
  icon: Icon = PackageOpen,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="grid min-h-72 place-items-center border border-dashed border-border bg-card/40 p-8 text-center">
      <div>
        <Icon className="mx-auto mb-4 size-7 text-primary/70" />
        <Typography as="h3" className="text-xl">
          {title}
        </Typography>
        <Typography className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {body}
        </Typography>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
};

/** Placeholder grid matching the summary-card layout while builds load. */
export const BuildsGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-52 rounded-none border border-border" />
      ))}
    </div>
  );
};

/** Full-height spinner for a screen that cannot render until its record arrives. */
export const ScreenLoader = () => {
  return (
    <div className="grid h-full place-items-center" aria-busy="true">
      <Loader2 className="size-7 animate-spin text-primary" />
    </div>
  );
};

/** Full-height failure state for a screen whose record could not be loaded. */
export const ScreenError = ({
  icon: Icon = AlertTriangle,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div>
        <Icon className="mx-auto mb-4 size-7 text-destructive" />
        <Typography as="h1" className="text-2xl">
          {title}
        </Typography>
        {body && (
          <Typography className="mt-2 text-sm text-muted-foreground">
            {body}
          </Typography>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
};
