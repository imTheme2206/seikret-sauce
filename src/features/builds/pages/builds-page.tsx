import { Boxes, Users } from "lucide-react";
import { PageContainer } from "@/components/page-layout";
import { PageHeader } from "@/components/page-header";
import { BuildsHub } from "../components/builds-hub";
import type { BuildsView } from "../hooks/use-builds-hub";

const HEADERS = {
  mine: {
    icon: Boxes,
    eyebrow: "Hunter equipment box",
    title: "My loadouts",
    description:
      "Every set you have forged, ready to revise, share, or take on the next hunt.",
  },
  shared: {
    icon: Users,
    eyebrow: "Community equipment archive",
    title: "Shared loadouts",
    description:
      "Study loadouts shared by fellow hunters and duplicate a promising setup into your own equipment box.",
  },
} as const satisfies Record<BuildsView, unknown>;

type BuildsPageProps = {
  view?: BuildsView;
};

/** `/builds` and `/builds/shared`: route shell for the build feeds. */
export const BuildsPage = ({ view = "mine" }: BuildsPageProps) => {
  const header = HEADERS[view];

  return (
    <>
      <PageHeader
        icon={header.icon}
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.description}
      />
      <PageContainer>
        <main className="py-5 md:py-10">
          <BuildsHub view={view} />
        </main>
      </PageContainer>
    </>
  );
};
