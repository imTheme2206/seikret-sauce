import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * The feature's panel surface. Built on the shared shadcn `Card`, styled to
 * match the loadout optimizer's `ResultCard` (quiet border, no
 * drop shadow) so build cards and result cards read as one system.
 */
export const HunterPanel = ({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <Card className={cn("overflow-hidden rounded-sm border-border bg-card shadow-none", className)}>
      {children}
    </Card>
  );
};
