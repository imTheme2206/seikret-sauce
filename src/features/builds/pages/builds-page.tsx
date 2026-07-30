import { BuildsHub } from "../components/builds-hub";
import type { BuildsView } from "../hooks/use-builds-hub";

/** `/builds` and `/builds/shared`: route shell for the build feeds. */
export function BuildsPage({ view = "mine" }: { view?: BuildsView }) {
  return (
    <div className="h-full overflow-y-auto">
      <main className="mx-auto max-w-7xl p-5 md:p-10">
        <BuildsHub view={view} />
      </main>
    </div>
  );
}
