import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** The feature's panel surface: a squared-off card with a lit top edge. */
export function HunterPanel({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-none border-border bg-card shadow-none",
        // Flat top hairline in place of the old gradient sheen.
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-primary/40",
        className,
      )}
    >
      {children}
    </Card>
  );
}
