import { AuthControl } from "@/components/auth-control";
import { BrandStar } from "@/components/brand-star";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

const NAV_LINKS = [
  {
    to: "/optimizer",
    label: "Loadout Optimizer",
    shortLabel: "Optimize",
  },
  {
    to: "/talismans",
    label: "My Talismans",
    shortLabel: "Talismans",
  },
] as const;

/** Top application bar: brand mark, page title, page nav, and the Discord auth control. */
export function AppHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isLoadoutsRoute = pathname.startsWith("/builds");

  return (
    <header className="flex h-16 shrink-0 items-center gap-1 border-b border-border px-2 sm:gap-2.5 sm:px-5">
      <Link
        to="/"
        aria-label="Go to home and Gathering Hub"
        className="flex shrink-0 items-center gap-2 text-primary transition-colors hover:text-primary/80"
      >
        <BrandStar size={20} />
        <Typography
          as="span"
          className="hidden text-sm font-bold tracking-[0.12em] sm:inline"
        >
          MH WILDS
        </Typography>
      </Link>
      <NavigationMenu
        viewport={false}
        className="max-w-none items-stretch justify-start"
      >
        <NavigationMenuList className="h-full gap-0">
          {NAV_LINKS.map((link) => (
            <NavigationMenuItem
              key={link.to}
              className="h-full flex items-stretch"
            >
              <Separator orientation="vertical" className="h-full shrink-0" />
              <NavigationMenuLink asChild>
                <Link
                  to={link.to}
                  activeOptions={{ exact: true }}
                  className="flex h-full flex-row items-center gap-1.5 rounded-none px-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground sm:px-4 sm:text-sm"
                  activeProps={{
                    className: "bg-secondary text-primary",
                  }}
                >
                  <span className="sm:hidden">{link.shortLabel}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem className="h-full flex items-stretch">
            <Separator orientation="vertical" className="h-full shrink-0" />
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex h-full items-center gap-1 rounded-none px-2 text-[10px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-4 sm:text-sm",
                  isLoadoutsRoute && "bg-secondary text-primary",
                )}
              >
                <span>Loadouts</span>
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-40">
                <DropdownMenuItem asChild>
                  <Link
                    to="/builds"
                    activeOptions={{ exact: true }}
                    activeProps={{
                      className: "bg-accent text-accent-foreground",
                    }}
                  >
                    My Loadouts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/builds/new"
                    activeOptions={{ exact: true }}
                    activeProps={{
                      className: "bg-accent text-accent-foreground",
                    }}
                  >
                    New Build
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="ml-auto">
        <AuthControl />
      </div>
    </header>
  );
}
