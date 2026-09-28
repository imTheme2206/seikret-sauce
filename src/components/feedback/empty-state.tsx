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

/** Quiet, reusable empty state for document pages and collection panels. */
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
      className={cn(
        "grid place-items-center border-y border-border px-6 py-10 text-center",
        compact ? "min-h-48" : "min-h-64",
        className,
      )}
    >
      <div className="max-w-md">
        {Icon && <Icon className="mx-auto mb-4 size-5 text-muted-foreground" />}
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
