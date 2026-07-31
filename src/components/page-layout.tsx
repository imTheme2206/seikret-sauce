import { cn } from "@/lib/utils";
import { Outlet } from "@tanstack/react-router";

type PageContainerProps = React.PropsWithChildren<{ className?: string }>;

/**
 * Route-level frame for document pages. It owns scrolling only, so a page can
 * render full-bleed bands (page headers, hero sections) whose background and
 * border reach the viewport edge.
 */
export const PageLayout = ({ children }: React.PropsWithChildren) => (
  <div className="h-full overflow-y-auto">{children ?? <Outlet />}</div>
);

/**
 * Horizontal frame for page content: max width and gutters. Wrap the content
 * of every band with it — inside a full-bleed header as well as around a
 * page's `<main>` — so everything lines up on the same column.
 */
export const PageContainer = ({ className, children }: PageContainerProps) => (
  <div className={cn("mx-auto w-full max-w-7xl px-5 md:px-10", className)}>
    {children}
  </div>
);
