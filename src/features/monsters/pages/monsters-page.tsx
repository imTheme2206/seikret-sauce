import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PageContainer } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Crosshair, TriangleAlert } from "lucide-react";
import { HitzoneTable } from "../components/hitzone-table";
import { MonsterOverview } from "../components/monster-overview";
import { MonsterPicker } from "../components/monster-picker";
import { useHuntTarget } from "../hooks/use-hunt-target";
import { useMonster, useMonsterList } from "../hooks/use-monsters";

/** `/monsters`: pick a target monster and study its part hitzones and weaknesses. */
export const MonstersPage = () => {
  const { target, selectMonster, selectPart } = useHuntTarget();
  const list = useMonsterList();
  // A stored id the catalog no longer lists is treated as no target.
  const monsterId = list.monsters.some((item) => item.id === target?.monsterId)
    ? (target?.monsterId ?? null)
    : null;
  const { monster, isLoading, error } = useMonster(monsterId);

  return (
    <>
      <PageHeader
        icon={Crosshair}
        eyebrow="Hunt intel"
        title="Monster hitzones"
        description="Choose a target to see how each part takes slash, blunt, pierce, elemental and stun damage, plus part HP and weaknesses. Your target is remembered with your working build."
      />
      <PageContainer>
        <main className="flex flex-col gap-6 py-5 md:py-10">
          <MonsterPicker
            monsters={list.monsters}
            value={monsterId}
            isLoading={list.isLoading}
            onChange={selectMonster}
          />

          {(list.error || error) && (
            <EmptyState
              tone="error"
              icon={TriangleAlert}
              title="Could not load monster data"
              description="The Guild archive is unreachable. Try again in a moment."
              compact
            />
          )}

          {!list.error && !monsterId && !list.isLoading && (
            <EmptyState
              icon={Crosshair}
              title="No target chosen"
              description="Pick a monster above to see its hitzones and weaknesses."
              compact
            />
          )}

          {monsterId && isLoading && <Skeleton className="h-96 w-full" />}

          {monster && (
            <>
              <MonsterOverview monster={monster} />
              <Card>
                <CardHeader>
                  <CardTitle>Hitzones</CardTitle>
                  <CardDescription>
                    Damage multipliers per part (0 to 1). Target a part to remember it for
                    damage calculations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HitzoneTable
                    parts={monster.parts}
                    selectedPartId={target?.partId ?? null}
                    onSelectPart={selectPart}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </PageContainer>
    </>
  );
};
