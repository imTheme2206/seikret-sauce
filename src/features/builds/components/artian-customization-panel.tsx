import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import { withReinforcement } from "../artian";
import type {
  ArtianCustomization,
  ArtianElement,
  ArtianReinforcementLevel,
  ArtianReinforcementType,
  EditorArtianPanel,
} from "../types";
import { titleCase } from "../weapon-rows";
import { BonusSelect, type BonusOption } from "./weapon-bonus-row";

/** Sentinel for "none" — Radix Select forbids an empty-string item value. */
const NONE = "__none__";

type ArtianCustomizationPanelProps = {
  panel: EditorArtianPanel;
  setBonusId: string | null;
  groupBonusId: string | null;
  setBonusOptions: BonusOption[];
  groupBonusOptions: BonusOption[];
  onChange: (config: ArtianCustomization) => void;
  onBonus: (kind: "setBonusId" | "groupBonusId", bonusId: string | null) => void;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <div className="min-w-0 space-y-1.5">
    <Typography
      as="div"
      className="text-[11px] uppercase tracking-widest text-muted-foreground"
    >
      {label}
    </Typography>
    {children}
  </div>
);

type PartsFieldProps = {
  label: string;
  value: number;
  /** How many of the forged parts are still unassigned to the other bonus. */
  free: number;
  onChange: (value: number) => void;
};

/** Parts carrying one Artian bonus (0-3); choices beyond the unassigned parts are disabled. */
const PartsField = ({ label, value, free, onChange }: PartsFieldProps) => (
  <Field label={label}>
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={String(value)}
      aria-label={label}
      onValueChange={(next) => next && onChange(Number(next))}
    >
      {[0, 1, 2, 3].map((count) => (
        <ToggleGroupItem
          key={count}
          value={String(count)}
          disabled={count > value + free}
          aria-label={`${count} ${label.toLowerCase()}`}
        >
          {count}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </Field>
);

type ReinforcementRowProps = {
  index: number;
  panel: EditorArtianPanel;
  onChange: (config: ArtianCustomization) => void;
};

const reinforcementLabel = (type: ArtianReinforcementType): string =>
  type === "ammo" ? "Ammo capacity" : `${titleCase(type)} boost`;

/** One reinforcement slot: its type, then its level (plain Artian weapons only roll level I). */
const ReinforcementRow = ({ index, panel, onChange }: ReinforcementRowProps) => {
  const current = panel.config.reinforcements[index] ?? null;
  const levels = current ? panel.levels[current.type] : [];

  const selectType = (value: string) => {
    if (value === NONE) {
      onChange(withReinforcement(panel.config, index, null));
      return;
    }
    const type = value as ArtianReinforcementType;
    const options = panel.levels[type];
    const level: ArtianReinforcementLevel =
      current && options.includes(current.level)
        ? current.level
        : (options[0] ?? "I");
    onChange(withReinforcement(panel.config, index, { type, level }));
  };

  const selectLevel = (value: string) => {
    if (!current) return;
    onChange(
      withReinforcement(panel.config, index, {
        type: current.type,
        level: value as ArtianReinforcementLevel,
      }),
    );
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-2">
      <Select value={current?.type ?? NONE} onValueChange={selectType}>
        <SelectTrigger
          aria-label={`Reinforcement ${index + 1} type`}
          className="w-full rounded-none bg-background/70"
        >
          <SelectValue placeholder="Empty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>Empty</SelectItem>
          {panel.reinforcementTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {reinforcementLabel(type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={current?.level ?? ""}
        onValueChange={selectLevel}
        disabled={!current}
      >
        <SelectTrigger
          aria-label={`Reinforcement ${index + 1} level`}
          className="w-full rounded-none bg-background/70"
        >
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          {levels.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const familyLabel = (panel: EditorArtianPanel): string =>
  panel.family === "gogma"
    ? `Gogma Artian · ${titleCase(panel.focus ?? "")} Focus`
    : `Artian · Rarity ${panel.tier}`;

/**
 * The in-game Artian / Gogma Artian customization under the weapon row: element,
 * the Artian bonus of each forged part, element infusion and the reinforcements
 * (levels I / II / III / EX on a Gogma Artian), plus a Gogma Artian's rolled Set
 * and Group Bonus. The derived stats it produces are shown in the weapon's own
 * stat block; the rules behind them come from the backend (ADR-0014).
 */
export const ArtianCustomizationPanel = ({
  panel,
  setBonusId,
  groupBonusId,
  setBonusOptions,
  groupBonusOptions,
  onChange,
  onBonus,
}: ArtianCustomizationPanelProps) => {
  const { config } = panel;
  const free = 3 - config.attackParts - config.affinityParts;

  const setElement = (value: string) =>
    onChange({
      ...config,
      element: value === NONE ? null : (value as ArtianElement),
      // Element-only picks disappear with the element they depend on.
      elementInfusion: value === NONE ? false : config.elementInfusion,
      reinforcements:
        value === NONE
          ? config.reinforcements.filter((item) => item.type !== "element")
          : config.reinforcements,
    });

  return (
    <section
      aria-label="Artian customization"
      className="space-y-4 border-t border-border pt-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Typography as="h3" className="text-sm font-semibold text-foreground">
          Artian customization
        </Typography>
        <Badge variant="secondary">{familyLabel(panel)}</Badge>
        {panel.sharpnessBonus > 0 && (
          <Badge variant="outline">Sharpness +{panel.sharpnessBonus}</Badge>
        )}
        {panel.ammoBonus > 0 && (
          <Badge variant="outline">Ammo +{panel.ammoBonus}</Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Element">
          <Select value={config.element ?? NONE} onValueChange={setElement}>
            <SelectTrigger
              aria-label="Artian element"
              className="w-full rounded-none bg-background/70"
            >
              <SelectValue placeholder="No element" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>No element</SelectItem>
              {panel.elements.map((element) => (
                <SelectItem key={element} value={element}>
                  {titleCase(element)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Element infusion">
          <Toggle
            variant="outline"
            pressed={config.elementInfusion}
            disabled={!panel.canInfuse}
            onPressedChange={(pressed) =>
              onChange({ ...config, elementInfusion: pressed })
            }
            aria-label="Element infusion (three matching parts)"
            className="w-full"
          >
            {config.elementInfusion ? "Infused" : "Not infused"}
          </Toggle>
        </Field>

        <PartsField
          label="Attack parts"
          value={config.attackParts}
          free={free}
          onChange={(attackParts) => onChange({ ...config, attackParts })}
        />
        <PartsField
          label="Affinity parts"
          value={config.affinityParts}
          free={free}
          onChange={(affinityParts) => onChange({ ...config, affinityParts })}
        />
      </div>

      <Field label={`Reinforcements (max ${panel.maxReinforcements})`}>
        <div className="space-y-2">
          {Array.from({ length: panel.maxReinforcements }, (_, index) => (
            <ReinforcementRow
              key={index}
              index={index}
              panel={panel}
              onChange={onChange}
            />
          ))}
        </div>
      </Field>

      {panel.family === "gogma" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <BonusSelect
            label="Set Bonus"
            placeholder="Choose a set bonus"
            value={setBonusId}
            options={setBonusOptions}
            onChange={(bonusId) => onBonus("setBonusId", bonusId)}
          />
          <BonusSelect
            label="Group Bonus"
            placeholder="Choose a group bonus"
            value={groupBonusId}
            options={groupBonusOptions}
            onChange={(bonusId) => onBonus("groupBonusId", bonusId)}
          />
        </div>
      )}

      {panel.issue && (
        <Typography role="alert" className="text-sm text-destructive">
          {panel.issue}
        </Typography>
      )}
    </section>
  );
};
