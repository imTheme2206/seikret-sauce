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
    className="frame-corners mb-6 grid gap-5 rounded-sm border border-border bg-card px-6 py-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-8"
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
