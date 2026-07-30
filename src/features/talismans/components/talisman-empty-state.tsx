import type { LucideIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function TalismanEmptyState({
  icon: Icon,
  title,
  body,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center border border-dashed border-border bg-card/40 p-8 text-center",
        compact ? "min-h-56" : "min-h-72",
      )}
    >
      <div>
        <div className="mx-auto mb-4 grid size-11 place-items-center border border-primary/30 bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <Typography as="h2" className="text-xl font-semibold">
          {title}
        </Typography>
        <Typography className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {body}
        </Typography>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
