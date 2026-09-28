import { RankSelector } from "./rank-selector";
import { WeaponSelector } from "./weapon-selector";
import type { LoadoutOptimizerController } from "../hooks/use-loadout-optimizer";

export const OptimizerSettings = ({
  controller: c,
}: {
  controller: LoadoutOptimizerController;
}) => (
  <section
    aria-label="Search settings"
    className="mb-6 grid gap-5 rounded-md border border-border bg-card/40 px-6 py-5 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start xl:gap-8"
  >
    <RankSelector value={c.rank} onChange={c.setRank} disabled={c.isSearching} />
    <WeaponSelector
      value={c.weapon}
      onChange={c.setWeaponSkill}
      options={c.weaponOptions}
      disabled={c.isSearching}
    />
  </section>
);
