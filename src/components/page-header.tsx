import { PageContainer } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  /** Glyph shown beside the eyebrow, naming the kind of page. */
  icon: LucideIcon;
  /** Small accented line above the title. */
  eyebrow: string;
  title: string;
  description?: string | null;
  /** Right-aligned call to action. */
  action?: React.ReactNode;
  /** Extra content below the description, e.g. a revision line. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * The banner every document page opens with, so eyebrow, title scale and
 * spacing stay identical across the app. Flat surface by design — no gradient
 * washes. The band spans the viewport; only its content sits on the page
 * column, which keeps it aligned with the `<main>` below it.
 */
export const PageHeader = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) => (
  <header
    className={cn("border-b border-border bg-card py-8 md:py-10", className)}
  >
    <PageContainer className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <div className="min-w-0">
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
      {action && <div className="shrink-0">{action}</div>}
    </PageContainer>
  </header>
);
