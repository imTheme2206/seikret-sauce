import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "./components/theme-provider";
import { AppHeader } from "./components/app-header";
import { Toaster } from "./components/ui/toaster";
import { HomePage } from "./features/home";
import { LoadoutOptimizer } from "./features/loadout";
import { TalismansTab } from "./features/talismans";
import {
  BuildDetailPage,
  BuildEditorPage,
  BuildsPage,
} from "./features/builds";

/** Shared shell (theme, header + nav) for every route. */
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="mh-wilds-theme">
      <div className="flex h-screen flex-col bg-background">
        <AppHeader />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const optimizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/optimizer",
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
  component: BuildsPage,
});

const sharedBuildsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builds/shared",
  component: () => <BuildsPage view="shared" />,
});

const newBuildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builds/new",
  component: BuildEditorPage,
});

const editBuildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builds/$buildId/edit",
  component: () => {
    const { buildId } = editBuildRoute.useParams();
    return <BuildEditorPage buildId={buildId} />;
  },
});

const buildDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/b/$buildId",
  component: () => {
    const { buildId } = buildDetailRoute.useParams();
    return <BuildDetailPage buildId={buildId} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  optimizerRoute,
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
