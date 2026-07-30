import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { Link } from "@tanstack/react-router";
import { BrandStar } from "@/components/brand-star";
import { AuthControl } from "@/components/auth-control";

const NAV_LINKS = [
  { to: "/", label: "Loadout Optimizer", shortLabel: "Optimize" },
  { to: "/builds", label: "My Loadouts", shortLabel: "Loadouts" },
  { to: "/builds/shared", label: "Gathering Hub", shortLabel: "Hub" },
  { to: "/talismans", label: "My Talismans", shortLabel: "Talismans" },
] as const;

/** Top application bar: brand mark, page title, page nav, and the Discord auth control. */
export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-1 border-b border-border px-2 sm:gap-2.5 sm:px-5">
      <BrandStar size={20} className="text-primary" />
      <Typography
        as="span"
        className="hidden text-sm font-bold tracking-[0.12em] text-primary sm:inline"
      >
        MH WILDS
      </Typography>
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
                  className="flex h-full items-center rounded-none px-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground sm:px-4 sm:text-sm"
                  activeProps={{ className: "bg-secondary text-primary" }}
                >
                  <span className="sm:hidden">{link.shortLabel}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="ml-auto">
        <AuthControl />
      </div>
    </header>
  );
}
