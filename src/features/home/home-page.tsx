import { Link } from "@tanstack/react-router";
import { ArrowRight, Hammer, SlidersHorizontal, Users } from "lucide-react";
import { BrandStar } from "@/components/brand-star";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { BuildsHub } from "@/features/builds";

export function HomePage() {
  return (
    <div className="h-full overflow-y-auto">
      <section className="border-b border-border bg-card px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-primary">
            <BrandStar size={16} />
            <Typography
              as="span"
              className="text-[10px] font-bold uppercase tracking-[.28em]"
            >
              Hunter preparation desk
            </Typography>
          </div>

          <Typography
            as="h1"
            className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl"
          >
            Plan the hunt. Forge the loadout.
          </Typography>
          <Typography className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Optimize armor skills for the hunt ahead, or assemble and save a
            complete equipment set for your next expedition.
          </Typography>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-none">
              <Link to="/optimizer">
                <SlidersHorizontal className="size-4" />
                Go to optimizer
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-none"
            >
              <Link to="/builds/new">
                <Hammer className="size-4" />
                Open set builder
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl p-5 md:p-10">
        <section aria-labelledby="gathering-hub-heading">
          <div className="mb-6 border-b border-border pb-5">
            <Typography
              as="div"
              className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-primary"
            >
              <Users className="size-3.5" />
              Community equipment archive
            </Typography>
            <Typography
              id="gathering-hub-heading"
              as="h2"
              className="text-2xl font-semibold md:text-3xl"
            >
              Gathering Hub
            </Typography>
            <Typography className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Study loadouts shared by fellow hunters, inspect their equipment,
              and duplicate a promising setup into your own equipment box.
            </Typography>
          </div>

          <BuildsHub view="shared" showFullSets />
        </section>
      </main>
    </div>
  );
}
