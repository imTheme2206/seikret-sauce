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
import type { GroupedSkills } from "@/features/loadout/types";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import {
  MAX_SKILLS_PER_TALISMAN,
  MAX_SLOTS_PER_TALISMAN,
  type CreateTalismanInput,
  type TalismanSkillInput,
  type TalismanSlot,
} from "../types";

interface FlatSkill {
  id: string;
  name: string;
  maxLevel: number;
}

function flattenSkills(skills: GroupedSkills | undefined): FlatSkill[] {
  if (!skills) return [];
  const byId = new Map<string, FlatSkill>();
  for (const bucket of [
    skills.armorSkills,
    skills.weaponSkills,
    skills.setSkills,
    skills.groupSkills,
  ]) {
    for (const s of bucket)
      byId.set(s.id, { id: s.id, name: s.name, maxLevel: s.maxLevel });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

interface TalismanFormProps {
  skills: GroupedSkills | undefined;
  onCreate: (input: CreateTalismanInput) => Promise<void>;
}

const EMPTY_SKILL_ROW: TalismanSkillInput = { skillId: "", level: 1 };
const EMPTY_SLOT_ROW: TalismanSlot = { type: "armor", size: 1 };

/** Create form for a custom talisman: name, 1-3 skills, up to 3 decoration slots. */
export function TalismanForm({ skills, onCreate }: TalismanFormProps) {
  const flatSkills = flattenSkills(skills);

  const [name, setName] = useState("");
  const [skillRows, setSkillRows] = useState<TalismanSkillInput[]>([
    { ...EMPTY_SKILL_ROW },
  ]);
  const [slotRows, setSlotRows] = useState<TalismanSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skillById = new Map(flatSkills.map((s) => [s.id, s]));

  const canSubmit =
    name.trim().length > 0 &&
    skillRows.length > 0 &&
    skillRows.every((r) => r.skillId && r.level >= 1) &&
    !isSubmitting;

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
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">
          New Custom Talisman
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Talisman name"
          maxLength={100}
        />

        <div className="flex flex-col gap-1.5">
          <Typography as="span" className="text-xs text-muted-foreground">
            Skills
          </Typography>
          {skillRows.map((row, i) => {
            const maxLevel = skillById.get(row.skillId)?.maxLevel ?? 1;
            return (
              <div key={i} className="flex items-center gap-1.5">
                <Select
                  value={row.skillId}
                  onValueChange={(skillId) =>
                    setSkillRows((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { skillId, level: 1 } : r,
                      ),
                    )
                  }
                >
                  <SelectTrigger className="h-8 flex-1 text-xs" size="sm">
                    <SelectValue placeholder="Choose a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {flatSkills.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
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
                  <SelectTrigger className="h-8 w-16 text-xs" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxLevel }, (_, lvl) => (
                      <SelectItem key={lvl} value={String(lvl + 1)}>
                        Lv.{lvl + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon-sm"
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
            disabled={skillRows.length >= MAX_SKILLS_PER_TALISMAN}
            onClick={() =>
              setSkillRows((rows) => [...rows, { ...EMPTY_SKILL_ROW }])
            }
            className="self-start"
          >
            <Plus /> Add skill
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Typography as="span" className="text-xs text-muted-foreground">
            Slots (optional)
          </Typography>
          {slotRows.map((slot, i) => (
            <div key={i} className="flex items-center gap-1.5">
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
                <SelectTrigger className="h-8 flex-1 text-xs" size="sm">
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
                <SelectTrigger className="h-8 w-16 text-xs" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((lvl) => (
                    <SelectItem key={lvl} value={String(lvl)}>
                      Lv.{lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon-sm"
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
            disabled={slotRows.length >= MAX_SLOTS_PER_TALISMAN}
            onClick={() =>
              setSlotRows((rows) => [...rows, { ...EMPTY_SLOT_ROW }])
            }
            className="self-start"
          >
            <Plus /> Add slot
          </Button>
        </div>

        {error && (
          <Typography className="text-xs text-destructive">
            {error}
          </Typography>
        )}

        <Button onClick={() => void handleSubmit()} disabled={!canSubmit}>
          {isSubmitting ? "Creating…" : "Create Talisman"}
        </Button>
      </CardContent>
    </Card>
  );
}
