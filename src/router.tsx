import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "./components/providers/theme-provider";
import { AppHeader } from "./components/layout/app-header";
import { PageLayout } from "./components/layout/page-layout";
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

/** Shared document-page frame. The optimizer stays outside as a full workspace. */
const pageLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "page-layout",
  component: PageLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: "/",
  component: HomePage,
});

const optimizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/optimizer",
  component: LoadoutOptimizer,
});

const talismansRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: "/talismans",
  component: TalismansTab,
});

const buildsRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: "/builds",
  component: BuildsPage,
});

const sharedBuildsRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: "/builds/shared",
  component: () => <BuildsPage view="shared" />,
});

const newBuildRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: "/builds/new",
  component: BuildEditorPage,
});

const editBuildRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: "/builds/$buildId/edit",
  component: () => {
    const { buildId } = editBuildRoute.useParams();
    return <BuildEditorPage buildId={buildId} />;
  },
});

const buildDetailRoute = createRoute({
  getParentRoute: () => pageLayoutRoute,
  path: "/b/$buildId",
  component: () => {
    const { buildId } = buildDetailRoute.useParams();
    return <BuildDetailPage buildId={buildId} />;
  },
});

const routeTree = rootRoute.addChildren([
  optimizerRoute,
  pageLayoutRoute.addChildren([
    indexRoute,
    talismansRoute,
    buildsRoute,
    sharedBuildsRoute,
    newBuildRoute,
    editBuildRoute,
    buildDetailRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
