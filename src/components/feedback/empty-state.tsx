import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
  tone?: "default" | "error";
  className?: string;
};

/**
 * Reusable empty / gated / error state. A dashed, framed panel so it reads as
 * "nothing here yet" rather than floating between page rules.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  tone = "default",
  className,
}: EmptyStateProps) => {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "grid place-items-center rounded-sm border border-dashed px-6 py-10 text-center",
        tone === "error" ? "border-destructive/50" : "border-border",
        compact ? "min-h-48" : "min-h-64",
        className,
      )}
    >
      <div className="max-w-md">
        {Icon && (
          <div
            className={cn(
              "mx-auto mb-4 grid size-10 rotate-45 place-items-center border",
              tone === "error"
                ? "border-destructive/50 text-destructive"
                : "border-gold/60 text-primary",
            )}
          >
            <Icon className="size-4 -rotate-45" aria-hidden="true" />
          </div>
        )}
        <Typography
          as="h2"
          className={cn(
            "text-lg font-medium",
            tone === "error" ? "text-destructive" : "text-foreground",
          )}
        >
          {title}
        </Typography>
        <Typography className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </Typography>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
};
