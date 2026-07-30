import type { LucideIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface BuildPageHeaderProps {
  /** Glyph shown beside the eyebrow, naming the kind of page. */
  icon: LucideIcon;
  /** Small accented line above the title. */
  eyebrow: string;
  title: string;
  description?: string | null;
  /** Right-aligned call to action. */
  action?: React.ReactNode;
  /** Extra content below the description, e.g. the revision line. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * The banner every builds page opens with. The hub, the permalink and any future
 * builds page share it so their eyebrow, title scale and spacing stay identical.
 * Flat surface by design — no gradient washes anywhere in this feature.
 */
export function BuildPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: BuildPageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-border bg-card px-5 py-9 md:px-10",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Typography
            as="div"
            className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.28em] text-primary"
          >
            <Icon className="size-3.5" />
            {eyebrow}
          </Typography>
          <Typography
            as="h1"
            className="text-3xl font-semibold tracking-wide md:text-4xl"
          >
            {title}
          </Typography>
          {description && (
            <Typography className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </Typography>
          )}
          {children}
        </div>
        {action}
      </div>
    </header>
  );
}
