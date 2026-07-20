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
  { to: "/", label: "Loadout Optimizer" },
  { to: "/talismans", label: "My Talismans" },
] as const;

/** Top application bar: brand mark, page title, page nav, and the Discord auth control. */
export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
      <BrandStar size={20} className="text-primary" />
      <Typography
        as="span"
        className="text-sm font-bold tracking-[0.12em] text-primary"
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
                  className="h-full flex items-center rounded-none font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground px-4"
                  activeProps={{ className: "bg-secondary text-primary" }}
                >
                  {link.label}
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
