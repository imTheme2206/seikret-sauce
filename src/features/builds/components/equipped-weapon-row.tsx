import { CircleSlash, Swords } from "lucide-react";
import { DecorationSlotIcon } from "@/components/gear/decoration-slot-icon";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { decorationColor } from "@/lib/decoration-sprite";
import { weaponKindConfig } from "../config";
import { formatAffinity, formatSpecial, titleCase } from "../weapon-rows";
import { GearSkillLine } from "./gear-skill-line";
import { HunterPanel } from "./hunter-panel";
import { RarityPips } from "./rarity-pips";
import { SharpnessBar } from "./sharpness-bar";
import { SlotPips } from "./slot-pips";
import type { ArtianReinforcement, SnapshotWeapon } from "../types";

type EquippedWeaponRowProps = {
  weapon: SnapshotWeapon | null;
};

const weaponBonuses = (weapon: SnapshotWeapon | null) =>
  [weapon?.setBonus, weapon?.groupBonus].flatMap((bonus) =>
    bonus ? [{ name: bonus.name }] : [],
  );

/** Legacy bonus-only weapons (saved before the weapon catalog) have no item to show. */
const WeaponBonusSummary = ({ weapon }: EquippedWeaponRowProps) => {
  const bonuses = weaponBonuses(weapon);

  return bonuses.length > 0 ? (
    <GearSkillLine skills={[]} bonuses={bonuses} />
  ) : (
    <Typography
      as="div"
      className="flex items-center gap-2 text-xs uppercase tracking-[.16em] text-muted-foreground"
    >
      <CircleSlash className="size-3.5" /> No bonus contribution
    </Typography>
  );
};

const WeaponImage = ({ kind }: { kind: NonNullable<SnapshotWeapon["kind"]> }) => (
  <img
    src={weaponKindConfig(kind).image}
    alt=""
    aria-hidden="true"
    className="size-7 object-contain"
  />
);

const WeaponDecorations = ({ weapon }: { weapon: SnapshotWeapon }) => {
  const decorations = weapon.decorations ?? [];
  if (decorations.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {decorations.map((decoration) => (
        <Typography
          as="span"
          key={`${decoration.slotIndex}-${decoration.decorationId}`}
          className="flex items-center gap-1.5 border border-border bg-background/40 py-0.5 pl-1 pr-2 text-xs text-foreground/85"
        >
          <DecorationSlotIcon
            level={weapon.slots?.[decoration.slotIndex] ?? decoration.slotSize}
            jewel={{
              level: decoration.slotSize,
              color: decorationColor(decoration.name),
            }}
            size={18}
            decorative
          />
          {decoration.name}
        </Typography>
      ))}
    </div>
  );
};

/** "Attack EX", "Affinity III", "Ammo capacity I" - one saved reinforcement. */
const reinforcementText = (
  reinforcement: ArtianReinforcement,
): string =>
  `${reinforcement.type === "ammo" ? "Ammo capacity" : titleCase(reinforcement.type)} ${reinforcement.level}`;

/** The saved Artian / Gogma Artian configuration, as badges under the weapon's stats. */
const CustomizationSummary = ({
  customization,
}: {
  customization: NonNullable<SnapshotWeapon["customization"]>;
}) => {
  const { config } = customization;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary">
        {customization.family === "gogma"
          ? `Gogma Artian · ${titleCase(customization.focus ?? "")} Focus`
          : `Artian · Rarity ${customization.tier}`}
      </Badge>
      {config.element && (
        <Badge variant="outline">
          {titleCase(config.element)}
          {config.elementInfusion ? " (infused)" : ""}
        </Badge>
      )}
      {config.attackParts > 0 && (
        <Badge variant="outline">Attack parts {config.attackParts}</Badge>
      )}
      {config.affinityParts > 0 && (
        <Badge variant="outline">Affinity parts {config.affinityParts}</Badge>
      )}
      {config.reinforcements.map((reinforcement, index) => (
        <Badge key={`${reinforcement.type}-${index}`} variant="outline">
          {reinforcementText(reinforcement)}
        </Badge>
      ))}
      {customization.sharpnessBonus > 0 && (
        <Badge variant="outline">Sharpness +{customization.sharpnessBonus}</Badge>
      )}
      {customization.ammoBonus > 0 && (
        <Badge variant="outline">Ammo +{customization.ammoBonus}</Badge>
      )}
    </div>
  );
};

/** Full saved-weapon detail: stats, sharpness, skills, bonuses and seated jewels. */
const WeaponDetail = ({ weapon }: { weapon: SnapshotWeapon }) => {
  const specials = weapon.specials ?? [];
  return (
    <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <Typography as="h3" className="font-medium">
            {weapon.name}
          </Typography>
          {weapon.rarity !== undefined && <RarityPips value={weapon.rarity} />}
        </div>
        <Typography as="div" className="mt-2 text-sm tabular-nums text-muted-foreground">
          {[
            weapon.damage
              ? `Raw ${weapon.damage.raw} (${weapon.damage.display})`
              : null,
            weapon.affinity !== undefined
              ? `Affinity ${formatAffinity(weapon.affinity)}`
              : null,
            ...specials.map(formatSpecial),
          ]
            .filter(Boolean)
            .join(" · ")}
        </Typography>
        {weapon.sharpness && (
          <div className="mt-2 max-w-xs">
            <SharpnessBar sharpness={weapon.sharpness} />
          </div>
        )}
        {weapon.customization && (
          <CustomizationSummary customization={weapon.customization} />
        )}
        <GearSkillLine
          skills={weapon.skills ?? []}
          bonuses={weaponBonuses(weapon)}
          className="mt-3"
        />
        <WeaponDecorations weapon={weapon} />
      </div>
      <SlotPips slots={weapon.slots ?? []} />
    </div>
  );
};

/**
 * Read-only counterpart of the editor's weapon card, rendered from a saved
 * snapshot. A snapshot with a `weaponId` shows the full weapon; a legacy one
 * (bonuses only, ADR-0005) keeps its original bonus-only rendering.
 */
export const EquippedWeaponRow = ({ weapon }: EquippedWeaponRowProps) => {
  return (
    <HunterPanel className="grid min-h-28 sm:grid-cols-[145px_1fr]">
      <div className="flex items-center gap-3 border-b border-border bg-secondary/40 p-4 sm:border-b-0 sm:border-r">
        <div className="grid size-10 shrink-0 place-items-center border border-primary/30 bg-primary/[.08]">
          {weapon?.kind ? (
            <WeaponImage kind={weapon.kind} />
          ) : (
            <Swords className="size-5 text-primary" />
          )}
        </div>
        <div>
          <Typography
            as="div"
            className="text-[11px] uppercase tracking-[.2em] text-muted-foreground"
          >
            Equipped
          </Typography>
          <Typography as="div" className="font-semibold">
            {weapon?.kind ? titleCase(weapon.kind) : "Weapon"}
          </Typography>
        </div>
      </div>

      {weapon?.weaponId ? (
        <WeaponDetail weapon={weapon} />
      ) : (
        <div className="flex items-center justify-center p-4 sm:justify-start">
          <WeaponBonusSummary weapon={weapon} />
        </div>
      )}
    </HunterPanel>
  );
};

/** Compact saved-weapon presentation used inside the expanded Build card. */
export const EquippedWeaponCell = ({ weapon }: EquippedWeaponRowProps) => {
  return (
    <div className="flex min-h-24 gap-3 bg-card p-3 sm:col-span-2">
      <div className="grid size-9 shrink-0 place-items-center border border-primary/25 bg-primary/[.06]">
        <Swords className="size-[18px] text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <Typography
          as="div"
          className="text-[11px] uppercase tracking-[.18em] text-muted-foreground"
        >
          Equipped
        </Typography>
        <Typography
          as="div"
          className="mt-0.5 truncate text-sm font-medium"
          title={weapon?.name}
        >
          {weapon?.name ?? "Weapon"}
        </Typography>
        {weapon?.weaponId && (weapon.decorations ?? []).length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {(weapon.decorations ?? []).map((decoration) => (
              <li
                key={`${decoration.slotIndex}-${decoration.decorationId}`}
                className="flex min-w-0 items-center gap-1 text-xs text-foreground/85"
              >
                <DecorationSlotIcon
                  level={weapon.slots?.[decoration.slotIndex] ?? decoration.slotSize}
                  jewel={{
                    level: decoration.slotSize,
                    color: decorationColor(decoration.name),
                  }}
                  size={18}
                  decorative
                />
                <span className="truncate">{decoration.name}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <WeaponBonusSummary weapon={weapon} />
        </div>
      </div>
    </div>
  );
};
