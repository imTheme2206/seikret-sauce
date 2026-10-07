import { AuthControl } from "@/components/layout/auth-control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { to: "/optimizer", label: "Loadout Optimizer", shortLabel: "Optimizer" },
  {
    label: "Inventory",
    children: [
      { to: "/talismans", label: "My Talismans" },
      { to: "/custom-weapons", label: "My Weapons" },
    ],
  },
  {
    label: "Loadouts",
    children: [
      { to: "/builds", label: "My Loadouts" },
      { to: "/builds/new", label: "New Build" },
    ],
    activePaths: ["/b/"],
  },
  { to: "/monsters", label: "Monsters", shortLabel: "Monsters" },
] as const;

const matchesPath = (pathname: string, path: string) =>
  pathname === path ||
  pathname.startsWith(path.endsWith("/") ? path : `${path}/`);

export const AppHeader = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <header className="z-10 flex h-16 shrink-0 items-center gap-5 border-b border-gold/40 bg-card px-4 sm:px-6 lg:px-8">
      <Link
        to="/"
        aria-label="Seikret Sauce home and Gathering Hub"
        className="flex shrink-0 items-center gap-2.5 text-foreground hover:text-primary"
      >
        <img src="/favicon.svg" alt="" className="size-8 rounded-md" />
        <span className="hidden font-display text-base font-bold tracking-[0.12em] sm:inline">
          SEIKRET SAUCE
        </span>
      </Link>

      <nav
        aria-label="Primary navigation"
        className="flex gap-4 h-full min-w-0 flex-1 items-stretch overflow-x-auto sm:ml-5"
      >
        {NAV_LINKS.map((item) => {
          if ("children" in item) {
            const activePaths = [
              ...item.children.map((child) => child.to),
              ...("activePaths" in item ? item.activePaths : []),
            ];
            const isActive = activePaths.some((path) =>
              matchesPath(pathname, path),
            );

            return (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  className={cn(
                    "flex h-full w-full max-w-40 min-w-0 items-center justify-center gap-1 border-b-2 border-transparent px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-sm",
                    isActive && "border-primary text-foreground",
                  )}
                >
                  {item.label}{" "}
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.to} asChild>
                      <Link to={child.to}>{child.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              // Active styling keys off the `data-status` TanStack sets: `activeProps`
              // classes are appended without tailwind-merge, so `border-transparent`
              // and `text-muted-foreground` would win over them.
              className="flex h-full w-full max-w-40 min-w-0 items-center justify-center border-b-2 border-transparent px-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:text-foreground sm:px-3 sm:text-sm"
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto shrink-0">
        <AuthControl />
      </div>
    </header>
  );
};
