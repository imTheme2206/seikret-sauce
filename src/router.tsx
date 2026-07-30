import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "./components/theme-provider";
import { AppHeader } from "./components/app-header";
import { LoadoutOptimizer } from "./features/loadout";
import { TalismansTab } from "./features/talismans";
import { BuildDetail, BuildEditor, BuildsHub } from "./features/builds";

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

const buildsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builds",
  component: BuildsHub,
});

const sharedBuildsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builds/shared",
  component: () => <BuildsHub view="shared" />,
});

const newBuildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builds/new",
  component: BuildEditor,
});

const editBuildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builds/$buildId/edit",
  component: () => {
    const { buildId } = editBuildRoute.useParams();
    return <BuildEditor buildId={buildId} />;
  },
});

const buildDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/b/$buildId",
  component: () => {
    const { buildId } = buildDetailRoute.useParams();
    return <BuildDetail buildId={buildId} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  talismansRoute,
  buildsRoute,
  sharedBuildsRoute,
  newBuildRoute,
  editBuildRoute,
  buildDetailRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
