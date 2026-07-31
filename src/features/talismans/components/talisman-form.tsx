import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import type { SkillCatalog } from "@/features/skills/skill-catalog";
import { SkillGlyph } from "@/features/skills/skill-glyph";
import { Gem, Loader2, Plus, Sparkles, X } from "lucide-react";
import { useState } from "react";
import {
  MAX_SKILLS_PER_TALISMAN,
  MAX_SLOTS_PER_TALISMAN,
  type CreateTalismanInput,
  type TalismanSkillInput,
  type TalismanSlot,
} from "../types";

type TalismanFormProps = {
  catalog: SkillCatalog | undefined;
  isLoadingSkills: boolean;
  onCreate: (input: CreateTalismanInput) => Promise<void>;
};

const EMPTY_SKILL_ROW: TalismanSkillInput = { skillId: "", level: 1 };
const EMPTY_SLOT_ROW: TalismanSlot = { type: "armor", size: 1 };

/** Create form for a custom talisman: name, 1-3 skills, up to 3 decoration slots. */
export const TalismanForm = ({
  catalog,
  isLoadingSkills,
  onCreate,
}: TalismanFormProps) => {
  const flatSkills = catalog
    ? [...catalog.byId.values()].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const [name, setName] = useState("");
  const [skillRows, setSkillRows] = useState<TalismanSkillInput[]>([
    { ...EMPTY_SKILL_ROW },
  ]);
  const [slotRows, setSlotRows] = useState<TalismanSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skillById = catalog?.byId;

  const canSubmit =
    name.trim().length > 0 &&
    skillRows.length > 0 &&
    skillRows.every((r) => r.skillId && r.level >= 1) &&
    !isSubmitting &&
    !isLoadingSkills;

  const reset = () => {
    setName("");
    setSkillRows([{ ...EMPTY_SKILL_ROW }]);
    setSlotRows([]);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate({ name: name.trim(), skills: skillRows, slots: slotRows });
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create talisman.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="gap-0 rounded-none border-border py-0 shadow-none">
      <CardHeader className="border-b border-border bg-secondary/35 p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center border border-primary/30 bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Forge a talisman</CardTitle>
            <Typography className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Name it, add its skills, then match its decoration slots.
            </Typography>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-5">
        <label className="block" htmlFor="talisman-name">
          <span className="mb-2 flex items-center justify-between gap-3">
            <Typography
              as="span"
              className="text-[10px] font-bold uppercase tracking-[.18em] text-foreground"
            >
              Talisman name
            </Typography>
            <Typography
              as="span"
              className="text-[10px] tabular-nums text-muted-foreground"
            >
              {name.length}/100
            </Typography>
          </span>
          <Input
            id="talisman-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Challenger Charm"
            maxLength={100}
            className="rounded-none bg-background/70"
          />
        </label>

        <fieldset className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <Typography
              as="legend"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]"
            >
              <Sparkles className="size-3.5 text-primary" />
              Skills
            </Typography>
            <Typography as="span" className="text-[10px] text-muted-foreground">
              {skillRows.length}/{MAX_SKILLS_PER_TALISMAN}
            </Typography>
          </div>
          {skillRows.map((row, i) => {
            const maxLevel = skillById?.get(row.skillId)?.maxLevel ?? 1;
            return (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_72px_32px] items-center gap-2"
              >
                <Select
                  value={row.skillId}
                  disabled={isLoadingSkills}
                  onValueChange={(skillId) =>
                    setSkillRows((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { skillId, level: 1 } : r,
                      ),
                    )
                  }
                >
                  <SelectTrigger
                    className="h-9 w-full rounded-none bg-background/70 text-xs"
                    size="sm"
                    aria-label={`Skill ${i + 1}`}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingSkills ? "Loading skills…" : "Choose a skill"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {flatSkills.map((s) => {
                      const chosenElsewhere = skillRows.some(
                        (candidate, index) =>
                          index !== i && candidate.skillId === s.id,
                      );
                      return (
                        <SelectItem
                          key={s.id}
                          value={s.id}
                          disabled={chosenElsewhere}
                        >
                          <span className="flex items-center gap-2">
                            <SkillGlyph
                              icon={s.icon}
                              category={s.category}
                              label={s.name}
                              className="size-6"
                            />
                            {s.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select
                  value={String(row.level)}
                  onValueChange={(level) =>
                    setSkillRows((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { ...r, level: Number(level) } : r,
                      ),
                    )
                  }
                >
                  <SelectTrigger
                    className="h-9 w-full rounded-none bg-background/70 text-xs"
                    size="sm"
                    aria-label={`Skill ${i + 1} level`}
                  >
                    <SelectValue placeholder="Lv." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxLevel }, (_, lvl) => (
                      <SelectItem key={lvl} value={String(lvl + 1)}>
                        {lvl + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  aria-label={`Remove skill ${i + 1}`}
                  disabled={skillRows.length <= 1}
                  onClick={() =>
                    setSkillRows((rows) => rows.filter((_, idx) => idx !== i))
                  }
                >
                  <X />
                </Button>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={skillRows.length >= MAX_SKILLS_PER_TALISMAN}
            onClick={() =>
              setSkillRows((rows) => [...rows, { ...EMPTY_SKILL_ROW }])
            }
            className="self-start rounded-none"
          >
            <Plus /> Add skill
          </Button>
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <Typography
              as="legend"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]"
            >
              <Gem className="size-3.5 text-primary" />
              Decoration slots
            </Typography>
            <Typography as="span" className="text-[10px] text-muted-foreground">
              Optional · {slotRows.length}/{MAX_SLOTS_PER_TALISMAN}
            </Typography>
          </div>
          {slotRows.map((slot, i) => (
            <div
              key={i}
              className="grid grid-cols-[minmax(0,1fr)_72px_32px] items-center gap-2"
            >
              <Select
                value={slot.type}
                onValueChange={(type) =>
                  setSlotRows((rows) =>
                    rows.map((r, idx) =>
                      idx === i
                        ? { ...r, type: type as TalismanSlot["type"] }
                        : r,
                    ),
                  )
                }
              >
                <SelectTrigger
                  className="h-9 w-full rounded-none bg-background/70 text-xs"
                  size="sm"
                  aria-label={`Slot ${i + 1} type`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="armor">Armor</SelectItem>
                  {/* Only the first slot may be a weapon slot. */}
                  <SelectItem value="weapon" disabled={i !== 0}>
                    Weapon
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(slot.size)}
                onValueChange={(size) =>
                  setSlotRows((rows) =>
                    rows.map((r, idx) =>
                      idx === i ? { ...r, size: Number(size) } : r,
                    ),
                  )
                }
              >
                <SelectTrigger
                  className="h-9 w-full rounded-none bg-background/70 text-xs"
                  size="sm"
                  aria-label={`Slot ${i + 1} level`}
                >
                  <SelectValue placeholder="Lv." />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((lvl) => (
                    <SelectItem key={lvl} value={String(lvl)}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label={`Remove slot ${i + 1}`}
                onClick={() =>
                  setSlotRows((rows) => rows.filter((_, idx) => idx !== i))
                }
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
            onClick={() =>
              setSlotRows((rows) => [...rows, { ...EMPTY_SLOT_ROW }])
            }
            className="self-start rounded-none"
          >
            <Plus /> Add slot
          </Button>
        </fieldset>

        {error && (
          <Typography
            role="alert"
            className="border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            {error}
          </Typography>
        )}

        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="rounded-none"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {isSubmitting ? "Forging talisman…" : "Forge talisman"}
        </Button>
      </CardContent>
    </Card>
  );
};
