import { AlertTriangle } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Inline failure notice — the one way this feature reports a failed action. */
export function AlertBanner({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2",
        className,
      )}
    >
      <AlertTriangle className="size-4 shrink-0 text-destructive" />
      <Typography as="span" className="text-sm">
        {message}
      </Typography>
    </div>
  );
}
