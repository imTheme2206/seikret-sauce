import { PageContainer } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { BuildsHub } from "@/features/builds";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Hammer, SlidersHorizontal, Users } from "lucide-react";

export const HomePage = () => (
  <>
    <section className="border-b border-border bg-card py-10 md:py-14">
      <PageContainer>
        <Typography as="p" className="mb-4 text-xs font-medium text-primary">
          Monster Hunter Wilds loadout optimizer
        </Typography>

        <Typography
          as="h1"
          className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-wide md:text-5xl"
        >
          Plan the hunt. Forge the loadout.
        </Typography>
        <Typography className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Optimize armor skills for the hunt ahead, or assemble and save a
          complete equipment set for your next expedition.
        </Typography>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/optimizer">
              <SlidersHorizontal className="size-4" />
              Go to optimizer
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/builds/new">
              <Hammer className="size-4" />
              Open set builder
            </Link>
          </Button>
        </div>
      </PageContainer>
    </section>

    <PageContainer>
      <main className="py-5 md:py-10">
        <section aria-labelledby="gathering-hub-heading">
          <div className="mb-6 border-b border-border pb-5">
            <Typography
              as="div"
              className="mb-2 flex items-center gap-2 text-xs font-medium text-primary"
            >
              <Users className="size-3.5" aria-hidden="true" />
              Community equipment archive
            </Typography>
            <Typography
              id="gathering-hub-heading"
              as="h2"
              className="font-display text-2xl font-semibold tracking-wide md:text-3xl"
            >
              Gathering Hub
            </Typography>
            <Typography className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Study loadouts shared by fellow hunters, inspect their
              equipment, and duplicate a promising setup into your own
              equipment box.
            </Typography>
          </div>

          <BuildsHub view="shared" showFullSets />
        </section>
      </main>
    </PageContainer>
  </>
);
