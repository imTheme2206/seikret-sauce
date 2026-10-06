import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { MonsterDetail } from "../types";
import { MonsterIcon } from "./monster-icon";
import { WeaknessList } from "./weakness-list";

type MonsterOverviewProps = {
  monster: MonsterDetail;
};

const speciesLabel = (species: string): string =>
  species.replace(/-/g, " ").replace(/^./, (first) => first.toUpperCase());

/** Name, species, base HP and weaknesses of the target monster. */
export const MonsterOverview = ({ monster }: MonsterOverviewProps) => (
  <Card>
    <CardHeader className="flex-row items-center gap-4">
      <MonsterIcon monster={monster} size="lg" className="size-16" />
      <div className="min-w-0">
        <CardTitle className="font-display text-xl">{monster.name}</CardTitle>
        <CardDescription>
          {speciesLabel(monster.species)} - Base HP{" "}
          <Typography as="span" className="font-medium tabular-nums text-foreground">
            {monster.baseHealth.toLocaleString()}
          </Typography>
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-4">
      {monster.description && (
        <Typography className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {monster.description}
        </Typography>
      )}
      <WeaknessList weaknesses={monster.weaknesses} />
    </CardContent>
  </Card>
);
