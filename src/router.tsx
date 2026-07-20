import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "./components/theme-provider";
import { AppHeader } from "./components/app-header";
import { LoadoutOptimizer } from "./features/loadout";
import { TalismansTab } from "./features/talismans";

/** Shared shell (theme, header + nav) for every route. */
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="mh-wilds-theme">
      <div className="flex h-screen flex-col bg-background">
        <AppHeader />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoadoutOptimizer,
});

const talismansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/talismans",
  component: TalismansTab,
});

const routeTree = rootRoute.addChildren([indexRoute, talismansRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
