import { DecorationSlotIcon } from "@/components/gear/decoration-slot-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import { SkillLevelControl } from "@/features/loadout/components/skill-level-stepper";
import { CATEGORY_CONFIG } from "@/features/loadout/config";
import type { SkillCatalog } from "@/features/skills/skill-catalog";
import { SlotIcon } from "@/components/gear/slot-icon";
import { CircleAlert, Loader2, Plus, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import {
  MAX_SKILLS_PER_TALISMAN,
  MAX_SLOTS_PER_TALISMAN,
  type CreateTalismanInput,
  type TalismanSkillInput,
  type TalismanSlot,
} from "../types";
import { SkillCombobox } from "./skill-combobox";

type TalismanFormProps = {
  catalog: SkillCatalog | undefined;
  isLoadingSkills: boolean;
  /** The box is full; forging is blocked until a talisman is deleted. */
  isAtLimit: boolean;
  onCreate: (input: CreateTalismanInput) => Promise<void>;
};

type FormErrors = {
  name?: string;
  /** Index-aligned with the skill rows. */
  skills: (string | undefined)[];
};

const NAME_LIMIT = 100;
const EMPTY_SKILL_ROW: TalismanSkillInput = { skillId: "", level: 1 };
const EMPTY_SLOT_ROW: TalismanSlot = { type: "armor", size: 1 };

const validate = (name: string, skillRows: TalismanSkillInput[]): FormErrors => ({
  name: name.trim() ? undefined : "Enter a name for this talisman",
  skills: skillRows.map((row) => (row.skillId ? undefined : "Choose a skill, or remove this row")),
});

const hasErrors = (errors: FormErrors) => Boolean(errors.name) || errors.skills.some(Boolean);

/** Create form for a custom talisman: name, 1–3 skills, up to 3 decoration slots. */
export const TalismanForm = ({
  catalog,
  isLoadingSkills,
  isAtLimit,
  onCreate,
}: TalismanFormProps) => {
  const formId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [skillRows, setSkillRows] = useState<TalismanSkillInput[]>([{ ...EMPTY_SKILL_ROW }]);
  const [slotRows, setSlotRows] = useState<TalismanSlot[]>([]);
  // Errors stay hidden until the first submit, then track the fields live so they clear when fixed.
  const [showErrors, setShowErrors] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skills = catalog
    ? [...catalog.byId.values()].sort((a, b) => a.name.localeCompare(b.name))
    : [];
  const errors = showErrors ? validate(name, skillRows) : { skills: [] };

  const updateSkill = (index: number, patch: Partial<TalismanSkillInput>) =>
    setSkillRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const updateSlot = (index: number, patch: Partial<TalismanSlot>) =>
    setSlotRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || isAtLimit) return;

    const validation = validate(name, skillRows);
    if (hasErrors(validation)) {
      setShowErrors(true);
      if (validation.name) nameRef.current?.focus();
      else {
        const firstBad = validation.skills.findIndex(Boolean);
        document.getElementById(`${formId}-skill-${firstBad}`)?.focus();
      }
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onCreate({ name: name.trim(), skills: skillRows, slots: slotRows });
      setName("");
      setSkillRows([{ ...EMPTY_SKILL_ROW }]);
      setSlotRows([]);
      setShowErrors(false);
    } catch (error) {
      // Keep everything the hunter entered so they can retry.
      setSubmitError(error instanceof Error ? error.message : "Failed to create talisman.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="frame-corners min-w-0 gap-0 rounded-sm border-border bg-card py-0 shadow-none">
      <CardHeader className="flex-row items-start gap-3 border-b border-border p-5">
        <span className="grid size-10 shrink-0 rotate-45 place-items-center border border-gold/60 bg-background">
          <span className="-rotate-45">
            <SlotIcon position="talisman" color="var(--primary)" size={22} />
          </span>
        </span>
        <div className="ml-1">
          <Typography as="h2" className="font-display text-lg font-semibold tracking-wide">
            Forge a talisman
          </Typography>
          <Typography className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Copy a talisman you own in-game: its name, skills and decoration slots.
          </Typography>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <form noValidate onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-6">
          <Typography className="text-xs text-muted-foreground">
            Fields marked <span className="text-destructive">*</span> are required.
          </Typography>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label htmlFor={`${formId}-name`} className="text-sm font-medium">
                Name <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <Typography as="span" className="text-xs tabular-nums text-muted-foreground" aria-hidden="true">
                {name.length}/{NAME_LIMIT}
              </Typography>
            </div>
            <Input
              id={`${formId}-name`}
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Challenger Charm"
              maxLength={NAME_LIMIT}
              required
              aria-required="true"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${formId}-name-error` : undefined}
              className="rounded-sm bg-background/70"
            />
            {errors.name && <FieldError id={`${formId}-name-error`}>{errors.name}</FieldError>}
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 flex w-full items-baseline justify-between text-sm font-medium">
              <span>
                Skills <span className="text-destructive" aria-hidden="true">*</span>
              </span>
              <span className="text-xs font-normal tabular-nums text-muted-foreground">
                {skillRows.length}/{MAX_SKILLS_PER_TALISMAN}
              </span>
            </legend>

            {skillRows.map((row, index) => {
              const skill = catalog?.byId.get(row.skillId);
              const errorId = `${formId}-skill-${index}-error`;
              const takenIds = new Set(
                skillRows.filter((_, i) => i !== index).map((other) => other.skillId),
              );
              return (
                <div key={index} className="rounded-sm border border-border bg-background/30 p-3">
                  <div className="flex items-center gap-2">
                    <SkillCombobox
                      id={`${formId}-skill-${index}`}
                      skills={skills}
                      value={row.skillId}
                      takenIds={takenIds}
                      disabled={isLoadingSkills}
                      invalid={Boolean(errors.skills[index])}
                      describedBy={errors.skills[index] ? errorId : undefined}
                      ariaLabel={`Skill ${index + 1}`}
                      onChange={(skillId) => updateSkill(index, { skillId, level: 1 })}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label={`Remove skill ${index + 1}`}
                      title="Remove skill"
                      disabled={skillRows.length <= 1}
                      onClick={() => setSkillRows((rows) => rows.filter((_, i) => i !== index))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X />
                    </Button>
                  </div>
                  {skill && (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Typography as="span" className="text-xs text-muted-foreground">
                        Level
                      </Typography>
                      <SkillLevelControl
                        skillName={skill.name}
                        level={row.level}
                        maxLevel={skill.maxLevel}
                        color={CATEGORY_CONFIG[skill.category].color}
                        onChange={(level) => updateSkill(index, { level })}
                      />
                    </div>
                  )}
                  {errors.skills[index] && <FieldError id={errorId}>{errors.skills[index]}</FieldError>}
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={skillRows.length >= MAX_SKILLS_PER_TALISMAN}
              onClick={() => setSkillRows((rows) => [...rows, { ...EMPTY_SKILL_ROW }])}
              className="self-start"
            >
              <Plus /> Add skill
            </Button>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 flex w-full items-baseline justify-between text-sm font-medium">
              <span>
                Decoration slots <span className="font-normal text-muted-foreground">(optional)</span>
              </span>
              <span className="text-xs font-normal tabular-nums text-muted-foreground">
                {slotRows.length}/{MAX_SLOTS_PER_TALISMAN}
              </span>
            </legend>

            {slotRows.map((slot, index) => (
              <div
                key={index}
                role="group"
                aria-label={`Slot ${index + 1}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm border border-border bg-background/30 p-3"
              >
                <ToggleGroup
                  type="single"
                  value={slot.type}
                  aria-label={`Slot ${index + 1} type`}
                  // Radix allows clearing the active item; keep a type selected.
                  onValueChange={(type) => type && updateSlot(index, { type: type as TalismanSlot["type"] })}
                  className="gap-1"
                >
                  <ToggleGroupItem value="armor" className={SEGMENT}>
                    Armor
                  </ToggleGroupItem>
                  {/* Only the first slot may be a weapon slot. */}
                  {index === 0 && (
                    <ToggleGroupItem value="weapon" className={SEGMENT}>
                      Weapon
                    </ToggleGroupItem>
                  )}
                </ToggleGroup>

                <ToggleGroup
                  type="single"
                  value={String(slot.size)}
                  aria-label={`Slot ${index + 1} level`}
                  onValueChange={(size) => size && updateSlot(index, { size: Number(size) })}
                  className="gap-1"
                >
                  {[1, 2, 3, 4].map((size) => (
                    <ToggleGroupItem
                      key={size}
                      value={String(size)}
                      aria-label={`Level ${size}`}
                      title={`Level ${size} slot`}
                      className={`${SEGMENT} px-1`}
                    >
                      <DecorationSlotIcon level={size} size={20} decorative />
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  aria-label={`Remove slot ${index + 1}`}
                  title="Remove slot"
                  onClick={() => setSlotRows((rows) => rows.filter((_, i) => i !== index))}
                  className="ml-auto text-muted-foreground hover:text-destructive"
                >
                  <X />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={slotRows.length >= MAX_SLOTS_PER_TALISMAN}
              onClick={() => setSlotRows((rows) => [...rows, { ...EMPTY_SLOT_ROW }])}
              className="self-start"
            >
              <Plus /> Add slot
            </Button>
          </fieldset>

          {submitError && (
            <Typography
              role="alert"
              className="flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-foreground"
            >
              <CircleAlert className="mt-px size-3.5 shrink-0 text-destructive" aria-hidden="true" />
              {submitError}
            </Typography>
          )}

          <div>
            <Button
              type="submit"
              className="h-10 w-full font-semibold"
              disabled={isSubmitting || isAtLimit}
              aria-describedby={isAtLimit ? `${formId}-limit` : undefined}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Forging talisman…" : "Forge talisman"}
            </Button>
            {isAtLimit && (
              <Typography id={`${formId}-limit`} className="mt-2 text-center text-xs text-muted-foreground">
                Your talisman box is full. Delete one to forge another.
              </Typography>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

/** Segmented-control item styling shared by the slot type and size toggles. */
const SEGMENT =
  "h-8 min-w-0 rounded-sm border border-border px-2.5 text-xs text-muted-foreground data-[state=on]:border-primary/70 data-[state=on]:bg-primary/10 data-[state=on]:text-primary";

const FieldError = ({ id, children }: React.PropsWithChildren<{ id: string }>) => (
  <Typography id={id} className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
    <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
    {children}
  </Typography>
);
