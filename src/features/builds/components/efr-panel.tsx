import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import {
  adaptWeapon,
  computeEfr,
  GAME_VERSION,
  RETRIEVED_AT,
  SHARPNESS_COLORS,
  type EfrResult,
  type SharpnessColor,
  type SkillRow,
} from "@/features/damage";
import { useSelectedTarget } from "@/features/monsters";
import { MonsterTargetDialog } from "@/features/monsters/components/monster-target-dialog";
import { partLabels } from "@/features/monsters/hitzone";
import { Crosshair } from "lucide-react";
import { useMemo, useState } from "react";
import type { HunterStatusSkill } from "../hunter-status";
import { titleCase } from "../weapon-rows";
import type { Weapon } from "../types";
import { efrBonusLines, skillsByName } from "../efr-view";
import { HunterPanel } from "./hunter-panel";
import { PanelHeading } from "./panel-heading";

/** Conditional skills start at an even split until the hunter says otherwise. */
export const DEFAULT_UPTIME = 0.5;
const AUTO_SHARPNESS = "auto";

type EfrPanelViewProps = {
  weapon: Weapon | null;
  skills: HunterStatusSkill[];
  target: {
    monsterName: string;
    partLabel: string;
    multipliers: Record<string, number>;
  } | null;
  uptimes: Record<string, number>;
  onUptime: (key: string, uptime: number) => void;
  sharpness: SharpnessColor | null;
  onSharpness: (color: SharpnessColor | null) => void;
};

const fmt = (value: number): string => value.toFixed(1);
const signed = (value: number): string =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}`;

const EmptyState = ({ weapon }: { weapon: boolean }) => (
  <div className="flex flex-col items-start gap-3 py-2">
    <Typography className="text-sm text-muted-foreground">
      {weapon
        ? "Pick a target monster part to see effective damage against it."
        : "Equip a weapon to see its effective damage."}
    </Typography>
  </div>
);

const SkillUptimeCell = ({
  row,
  uptimes,
  onUptime,
}: {
  row: SkillRow;
  uptimes: Record<string, number>;
  onUptime: (key: string, uptime: number) => void;
}) => (
  <div className="flex min-w-48 flex-col gap-2">
    {row.parts.map((part) =>
      part.condition === null ? (
        <Badge key={part.key} variant="secondary">
          {part.applies ? "Always on" : part.inactiveReason}
        </Badge>
      ) : (
        <div key={part.key} className="flex flex-col gap-1">
          <Typography as="span" className="text-[11px] text-muted-foreground">
            {part.condition}
          </Typography>
          <div className="flex items-center gap-2">
            <Slider
              min={0}
              max={100}
              step={5}
              value={[Math.round((uptimes[part.key] ?? DEFAULT_UPTIME) * 100)]}
              onValueChange={([value]) => onUptime(part.key, (value ?? 0) / 100)}
              disabled={!part.applies}
              aria-label={`${row.skill} uptime${part.key.includes("/") ? ` (${part.key.split("/")[1]})` : ""}`}
            />
            <Typography
              as="span"
              className="w-10 text-right text-xs tabular-nums"
            >
              {Math.round((uptimes[part.key] ?? DEFAULT_UPTIME) * 100)}%
            </Typography>
          </div>
          {!part.applies && (
            <Typography as="span" className="text-[11px] text-muted-foreground">
              {part.inactiveReason}
            </Typography>
          )}
        </div>
      ),
    )}
  </div>
);

const Summary = ({ result }: { result: EfrResult }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Per hit at 100 MV</TableHead>
        <TableHead className="text-right">Damage</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Effective raw</TableCell>
        <TableCell className="text-right tabular-nums">
          {fmt(result.effectiveRaw)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Effective element</TableCell>
        <TableCell className="text-right tabular-nums">
          {fmt(result.effectiveElement)}
        </TableCell>
      </TableRow>
      <TableRow className="font-semibold">
        <TableCell>Total</TableCell>
        <TableCell className="text-right tabular-nums">
          {fmt(result.total)}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

/** The panel's presentation, driven entirely by props (rendered directly in tests). */
export const EfrPanelView = ({
  weapon,
  skills,
  target,
  uptimes,
  onUptime,
  sharpness,
  onSharpness,
}: EfrPanelViewProps) => {
  const adapted = useMemo(
    () => (weapon ? adaptWeapon(weapon, sharpness) : null),
    [weapon, sharpness],
  );

  const result = useMemo(() => {
    if (!adapted?.ok || !target) return null;
    const m = target.multipliers;
    return computeEfr({
      weapon: adapted.weapon,
      multipliers: {
        slash: m.slash ?? 0,
        blunt: m.blunt ?? 0,
        pierce: m.pierce ?? 0,
        fire: m.fire ?? 0,
        water: m.water ?? 0,
        thunder: m.thunder ?? 0,
        ice: m.ice ?? 0,
        dragon: m.dragon ?? 0,
      },
      skills: skillsByName(skills),
      uptimes,
      defaultUptime: DEFAULT_UPTIME,
    });
  }, [adapted, target, skills, uptimes]);

  return (
    <HunterPanel className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <PanelHeading icon={Crosshair} className="mb-1">
            Effective damage
          </PanelHeading>
          <Typography as="h2" className="font-display text-lg font-semibold tracking-wide">
            {target ? `${target.monsterName} - ${target.partLabel}` : "No target selected"}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <MonsterTargetDialog />
          <Badge variant="outline" title={`Retrieved ${RETRIEVED_AT}`}>
            Game {GAME_VERSION}
          </Badge>
        </div>
      </div>

      {!weapon || !target ? (
        <EmptyState weapon={Boolean(weapon)} />
      ) : adapted && !adapted.ok ? (
        <Typography className="text-sm text-muted-foreground">
          {adapted.reason}
        </Typography>
      ) : result && adapted?.ok ? (
        <div className="flex flex-col gap-5">
          <Summary result={result} />

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">
              {titleCase(result.damageType)} hitzone {Math.round(result.hitzone * 100)}
            </Badge>
            {result.elementHitzone !== null && (
              <Badge variant="secondary">
                Element hitzone {Math.round(result.elementHitzone * 100)}
              </Badge>
            )}
            <Badge variant={result.weakPoint ? "default" : "outline"}>
              {result.weakPoint ? "Weak point" : "Not a weak point"}
            </Badge>
            <Badge variant="outline">Attack {fmt(result.attack)}</Badge>
            <Badge variant="outline">
              Affinity {Math.round(result.affinity * 100)}%
            </Badge>
            <Badge variant="outline">Crit x{result.critMultiplier.toFixed(3)}</Badge>
            <Badge variant="outline">EFR {fmt(result.efr)}</Badge>
            {result.approximate && <Badge variant="destructive">Approximate (ranged)</Badge>}
          </div>

          {adapted.weapon.sharpness !== null && (
            <div className="flex flex-wrap items-center gap-3">
              <Typography as="span" className="text-xs font-medium text-muted-foreground">
                Sharpness colour
              </Typography>
              <Select
                value={sharpness ?? AUTO_SHARPNESS}
                onValueChange={(value) =>
                  onSharpness(value === AUTO_SHARPNESS ? null : (value as SharpnessColor))
                }
              >
                <SelectTrigger size="sm" className="w-48" aria-label="Sharpness colour">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUTO_SHARPNESS}>
                    Weapon max ({adapted.maxSharpness ?? "none"})
                  </SelectItem>
                  {SHARPNESS_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {titleCase(color)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Typography as="span" className="text-xs text-muted-foreground">
                Handicraft and Artian sharpness reinforcement do not recolour the bar.
              </Typography>
            </div>
          )}

          {result.skills.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Adds</TableHead>
                  <TableHead className="text-right">Raw</TableHead>
                  <TableHead className="text-right">Element</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.skills.map((row) => (
                  <TableRow key={row.skill}>
                    <TableCell className="font-medium">
                      {row.skill} {row.level}
                      {row.approximate && (
                        <Badge variant="outline" className="ml-2">
                          approx.
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <SkillUptimeCell row={row} uptimes={uptimes} onUptime={onUptime} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {efrBonusLines(row.applied).join(", ") || "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {signed(row.rawDelta)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {signed(row.elementDelta)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {result.notModelled.length > 0 && (
            <div className="flex flex-col gap-2">
              <Typography as="div" className="text-xs font-medium text-muted-foreground">
                Not modelled (no effect on these numbers)
              </Typography>
              <div className="flex flex-wrap gap-2">
                {result.notModelled.map((item) => (
                  <Badge key={item.skill} variant="outline" title={item.reason}>
                    {item.skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Typography className="text-[11px] leading-relaxed text-muted-foreground">
            Uptime weights each skill's bonuses linearly (0% is the skill absent,
            100% always active), so overlapping skills are treated as independent.
            Motion value is fixed at 100, quest and rage modifiers at 1, and the
            elemental attack cap is not applied. Raw and element deltas are
            leave-one-out.
          </Typography>
        </div>
      ) : null}
    </HunterPanel>
  );
};

type EfrPanelProps = {
  /** The equipped weapon with effective (Artian-derived) stats; `null` when none. */
  weapon: Weapon | null;
  skills: HunterStatusSkill[];
};

/** Effective damage against the selected target part, with per-skill uptime sliders. */
export const EfrPanel = ({ weapon, skills }: EfrPanelProps) => {
  const { monster, part } = useSelectedTarget();
  const [uptimes, setUptimes] = useState<Record<string, number>>({});
  const [sharpness, setSharpness] = useState<SharpnessColor | null>(null);

  const target = useMemo(
    () =>
      monster && part
        ? {
            monsterName: monster.name,
            partLabel: partLabels(monster.parts).get(part.id) ?? part.name,
            multipliers: part.multipliers as Record<string, number>,
          }
        : null,
    [monster, part],
  );

  return (
    <EfrPanelView
      weapon={weapon}
      skills={skills}
      target={target}
      uptimes={uptimes}
      onUptime={(key, uptime) =>
        setUptimes((current) => ({ ...current, [key]: uptime }))
      }
      sharpness={sharpness}
      onSharpness={setSharpness}
    />
  );
};
