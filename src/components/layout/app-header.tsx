import { AuthControl } from "@/components/layout/auth-control";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { to: "/optimizer", label: "Loadout Optimizer", shortLabel: "Optimizer" },
  { to: "/talismans", label: "My Talismans", shortLabel: "Talismans" },
] as const;

export const AppHeader = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isLoadoutsRoute = pathname.startsWith("/builds") || pathname.startsWith("/b/");

  return (
    <header className="z-10 flex h-16 shrink-0 items-center gap-5 border-b border-border bg-background px-4 sm:px-6 lg:px-8">
      <Link to="/" aria-label="Seikret Sauce home and Gathering Hub" className="flex shrink-0 items-center gap-2.5 text-foreground hover:text-primary">
        <img src="/favicon.svg" alt="" className="size-8 rounded-md" />
        <span className="hidden text-sm font-semibold tracking-[0.1em] sm:inline">SEIKRET SAUCE</span>
      </Link>

      <nav aria-label="Primary navigation" className="flex h-full min-w-0 items-stretch gap-1 overflow-x-auto sm:ml-5">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeOptions={{ exact: true }}
            className="flex h-full shrink-0 items-center border-b-2 border-transparent px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3 sm:text-sm"
            activeProps={{ className: "border-primary text-foreground" }}
          >
            <span className="hidden sm:inline">{link.label}</span>
            <span className="sm:hidden">{link.shortLabel}</span>
          </Link>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "flex h-full shrink-0 items-center gap-1 border-b-2 border-transparent px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-sm",
            isLoadoutsRoute && "border-primary text-foreground",
          )}>
            Loadouts <ChevronDown className="size-3.5" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuItem asChild><Link to="/builds">My Loadouts</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/builds/new">New Build</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <div className="ml-auto shrink-0"><AuthControl /></div>
    </header>
  );
};
