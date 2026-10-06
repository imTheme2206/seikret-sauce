import { useTalismans } from "@/features/talismans/hooks/use-talismans";
import { useCustomWeapons } from "@/features/custom-weapons/hooks/use-custom-weapons";
import { toast } from "@/hooks/use-toast";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_DRAFT } from "../config";
import { draftFromBuild, snapshotFromDraft } from "../draft";
import { buildErrorMessage, isRevisionConflict } from "../errors";
import { buildGearRows } from "../gear-rows";
import { createHunterStatus } from "../hunter-status";
import {
  dropStrayBonuses,
  equipWeapon,
  weaponProblem,
  withWeaponBonus,
  withWeaponCustomization,
} from "../weapon-selection";
import { buildWeaponRow } from "../weapon-rows";
import {
  clearWorkingBuild,
  loadWorkingBuild,
  saveWorkingBuild,
} from "../working-build";
import type {
  ArmorPosition,
  ArtianCustomization,
  BuildDraft,
  DecorationAssignment,
  PositionKey,
  WeaponKind,
} from "../types";
import { decodeTalismanValue, hasAnyPiece, toCreateBody } from "../utils";
import { useBuildApi } from "./use-build-api";

/** Field-level problems that block saving, keyed by what the page renders them under. */
export type DraftErrors = {
  name?: string;
  equipment?: string;
};

const validateDraft = (draft: BuildDraft): DraftErrors => ({
  name: draft.name.trim() ? undefined : "Enter a name for this loadout",
  equipment: hasAnyPiece(draft) ? undefined : "Equip at least one piece",
});
import { useCatalog } from "./use-catalog";
import { useSavedBuild } from "./use-saved-build";

export const useBuildEditor = (buildId?: string) => {
  const navigate = useNavigate();
  const catalog = useCatalog();
  const talismans = useTalismans();
  const customWeapons = useCustomWeapons();
  const existing = useSavedBuild(buildId);
  const { createBuild, replaceBuild } = useBuildApi();

  // A new build resumes the locally persisted Working Build; an existing one is hydrated from the server.
  const [draft, setDraft] = useState<BuildDraft>(() =>
    buildId ? EMPTY_DRAFT : loadWorkingBuild(),
  );
  // Weapon type picked in the UI. Only matters while no weapon is equipped (see `buildWeaponRow`).
  const [chosenWeaponKind, setChosenWeaponKind] = useState<WeaponKind | null>(
    null,
  );
  // The last saved (or freshly opened) draft; edits are "unsaved" until they match it again.
  const [baseline, setBaseline] = useState<BuildDraft>(EMPTY_DRAFT);
  // Errors stay hidden until the first save attempt, then track the draft live so they clear when fixed.
  const [showErrors, setShowErrors] = useState(false);
  const [hydratedId, setHydratedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasRevisionConflict, setHasRevisionConflict] = useState(false);
  // Kept across retries of this logical create action; replaced only after success.
  const idempotencyKey = useRef(crypto.randomUUID());

  useEffect(() => {
    if (!buildId) saveWorkingBuild(draft);
  }, [buildId, draft]);

  useEffect(() => {
    if (existing.build && hydratedId !== existing.build.id) {
      const hydrated = draftFromBuild(existing.build);
      setDraft(hydrated);
      setBaseline(hydrated);
      setHydratedId(existing.build.id);
    }
  }, [existing.build, hydratedId]);

  // Drafts and saved builds from before the Gogma-only bonus rule may pair bonuses with another weapon.
  useEffect(() => {
    const cleaned = dropStrayBonuses(draft.composition.weapon, catalog.weapons);
    if (cleaned === draft.composition.weapon) return;
    setDraft((current) => ({
      ...current,
      composition: {
        ...current.composition,
        weapon: dropStrayBonuses(current.composition.weapon, catalog.weapons),
      },
    }));
  }, [draft.composition.weapon, catalog.weapons]);

  useEffect(() => {
    if (buildId && existing.error) {
      toast({
        variant: "destructive",
        title: "Could not open loadout",
        description: buildErrorMessage(
          existing.error,
          "The equipment record is unavailable.",
        ),
      });
    }
  }, [buildId, existing.error]);

  // ── Draft edits ───────────────────────────────────────────────────────────
  const patchDraft = (patch: Partial<Omit<BuildDraft, "composition">>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const setArmor = (position: ArmorPosition, armorId: string) =>
    setDraft((current) => ({
      ...current,
      composition: {
        ...current.composition,
        [position]: armorId ? { armorId, decorations: [] } : null,
      },
    }));

  const setTalisman = (value: string) =>
    setDraft((current) => {
      const decoded = decodeTalismanValue(value);
      return {
        ...current,
        composition: {
          ...current.composition,
          talisman: decoded ? { ...decoded, decorations: [] } : null,
        },
      };
    });

  /** Empty `decorationId` clears the slot. */
  const assignDecoration = (
    position: PositionKey,
    assignment: DecorationAssignment,
  ) =>
    setDraft((current) => {
      const piece = current.composition[position];
      if (!piece) return current;
      const decorations = piece.decorations.filter(
        (item) => item.slotIndex !== assignment.slotIndex,
      );
      if (assignment.decorationId) decorations.push(assignment);
      return {
        ...current,
        composition: {
          ...current.composition,
          [position]: { ...piece, decorations },
        },
      };
    });

  /** Routes a row's `Select` change to the right setter. */
  const selectGear = (position: PositionKey, value: string) =>
    position === "talisman" ? setTalisman(value) : setArmor(position, value);

  /** Set (or clear, with `null`) the weapon's Set or Group Bonus, by id. */
  const setWeaponBonus = (
    kind: "setBonusId" | "groupBonusId",
    bonusId: string | null,
  ) =>
    setDraft((current) => ({
      ...current,
      composition: {
        ...current.composition,
        weapon: withWeaponBonus(current.composition.weapon, kind, bonusId),
      },
    }));

  /** Switching weapon type drops an equipped weapon of another type. */
  const setWeaponKind = (kind: WeaponKind) => {
    setChosenWeaponKind(kind);
    const equipped = catalog.weapons.find(
      (weapon) => weapon.id === draft.composition.weapon.weaponId,
    );
    if (equipped && equipped.kind !== kind) setWeapon("");
  };

  /** Empty `weaponId` unequips the weapon (see `equipWeapon` for what carries over). */
  const setWeapon = (weaponId: string) =>
    setDraft((current) => ({
      ...current,
      composition: {
        ...current.composition,
        weapon: equipWeapon(
          current.composition.weapon,
          weaponId,
          catalog.weapons,
          catalog.artianRules,
        ),
      },
    }));

  /** Copy a saved Artian roll into this build as a snapshot. */
  const setSavedWeapon = (savedWeaponId: string) => {
    const saved = customWeapons.weapons.find((weapon) => weapon.id === savedWeaponId);
    if (!saved) return;
    const base = catalog.weapons.find((weapon) => weapon.id === saved.weaponId);
    if (base) setChosenWeaponKind(base.kind);
    setDraft((current) => ({
      ...current,
      composition: {
        ...current.composition,
        weapon: {
          weaponId: saved.weaponId,
          decorations: [],
          setBonusId: saved.setBonusId,
          groupBonusId: saved.groupBonusId,
          customization: saved.customization,
        },
      },
    }));
  };

  /** Replace the Artian / Gogma Artian configuration of the equipped weapon. */
  const setWeaponCustomization = (customization: ArtianCustomization) =>
    setDraft((current) => ({
      ...current,
      composition: {
        ...current.composition,
        weapon: withWeaponCustomization(
          current.composition.weapon,
          customization,
        ),
      },
    }));

  /** Empty `decorationId` clears the weapon slot. */
  const assignWeaponDecoration = (assignment: DecorationAssignment) =>
    setDraft((current) => {
      const { weapon } = current.composition;
      if (!weapon.weaponId) return current;
      const decorations = weapon.decorations.filter(
        (item) => item.slotIndex !== assignment.slotIndex,
      );
      if (assignment.decorationId) decorations.push(assignment);
      return {
        ...current,
        composition: {
          ...current.composition,
          weapon: { ...weapon, decorations },
        },
      };
    });

  // A weapon can carry any Set or Group Skill; the shared catalog owns grouping.
  const bonusOptions = catalog.skillCatalog?.bonuses ?? { set: [], group: [] };

  // ── Derived view data ─────────────────────────────────────────────────────
  const snapshot = useMemo(
    () =>
      snapshotFromDraft(
        draft,
        catalog.armors,
        catalog.decorations,
        catalog.skillCatalog?.response,
        talismans.talismans,
        catalog.weapons,
        catalog.artianRules,
      ),
    [
      draft,
      catalog.armors,
      catalog.decorations,
      catalog.skillCatalog,
      talismans.talismans,
      catalog.weapons,
      catalog.artianRules,
    ],
  );

  const rows = useMemo(
    () =>
      buildGearRows(
        draft,
        catalog.armors,
        catalog.decorations,
        talismans.talismans,
        catalog.skillCatalog?.response,
      ),
    [
      draft,
      catalog.armors,
      catalog.decorations,
      catalog.skillCatalog,
      talismans.talismans,
    ],
  );

  const weaponRow = useMemo(
    () =>
      buildWeaponRow(
        draft,
        catalog.weapons,
        chosenWeaponKind,
        catalog.decorations,
        catalog.artianRules,
      ),
    [
      draft,
      catalog.weapons,
      chosenWeaponKind,
      catalog.decorations,
      catalog.artianRules,
    ],
  );

  const hunterStatus = useMemo(
    () => createHunterStatus(snapshot, catalog.skillCatalog),
    [snapshot, catalog.skillCatalog],
  );

  // ── Dirty state & leave guard ─────────────────────────────────────────────
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );
  const errors = showErrors ? validateDraft(draft) : {};

  // Read through refs: a successful save navigates before React re-renders.
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;
  const isLeavingAfterSave = useRef(false);
  const leaveGuard = useBlocker({
    shouldBlockFn: () => isDirtyRef.current && !isLeavingAfterSave.current,
    enableBeforeUnload: () => isDirtyRef.current,
    withResolver: true,
  });

  // ── Save ──────────────────────────────────────────────────────────────────
  const findWeaponProblem = (): string | null =>
    weaponProblem(weaponRow.artian, draft.composition.weapon);

  /** Resolves to the first invalid field, if any, so the page can move focus to it. */
  const save = async (): Promise<keyof DraftErrors | null> => {
    if (isSaving) return null;
    const validation = validateDraft(draft);
    if (validation.name || validation.equipment) {
      setShowErrors(true);
      setMessage(null);
      return validation.name ? "name" : "equipment";
    }

    const weaponProblem = findWeaponProblem();
    if (weaponProblem) {
      setMessage(weaponProblem);
      toast({
        variant: "destructive",
        title: "Check the weapon",
        description: weaponProblem,
      });
      return null;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const saved =
        buildId && existing.build
          ? await replaceBuild(
              buildId,
              existing.build.revision,
              toCreateBody(draft),
            )
          : await createBuild(toCreateBody(draft), idempotencyKey.current);
      idempotencyKey.current = crypto.randomUUID();
      isLeavingAfterSave.current = true;
      setBaseline(draft);
      if (!buildId) clearWorkingBuild();
      toast({
        variant: "success",
        title: buildId ? "Loadout updated" : "Loadout forged",
        description: `${draft.name.trim()} was saved to your equipment box.`,
      });
      await navigate({ to: "/b/$buildId", params: { buildId: saved.id } });
    } catch (error) {
      if (isRevisionConflict(error)) {
        // The conflict dialog explains the choice; a toast on top would repeat it.
        setHasRevisionConflict(true);
        return null;
      }
      const errorMessage = buildErrorMessage(
        error,
        "The forge could not save this loadout.",
      );
      setMessage(errorMessage);
      toast({
        variant: "destructive",
        title: "Could not save loadout",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  const reloadNewest = async () => {
    setHydratedId(null);
    await existing.mutate();
    setHasRevisionConflict(false);
    const conflictMessage =
      "Loaded the newest revision. Review it before saving again.";
    setMessage(conflictMessage);
    toast({
      title: "Newest revision loaded",
      description: conflictMessage,
    });
  };

  return {
    isEditing: Boolean(buildId),
    draft,
    rows,
    weaponRow,
    hunterStatus,
    message,
    errors,
    isDirty,
    leaveGuard,
    hasRevisionConflict,
    isSaving,
    isLoadingCatalog: catalog.isLoading,
    isLoadingBuild: Boolean(buildId) && existing.isLoading,
    loadError: buildId ? existing.error : null,
    bonusOptions,
    savedWeapons: customWeapons.weapons,
    isLoadingSavedWeapons: customWeapons.isLoading,
    excludedWeaponIds: catalog.weapons.filter((weapon) => weapon.artian).map((weapon) => weapon.id),
    weaponCatalog: catalog.weapons,
    artianRules: catalog.artianRules,
    patchDraft,
    selectGear,
    assignDecoration,
    setWeaponBonus,
    setWeaponKind,
    setWeapon,
    setSavedWeapon,
    setWeaponCustomization,
    assignWeaponDecoration,
    setHasRevisionConflict,
    reloadNewest,
    save,
  };
};

export type BuildEditorController = ReturnType<typeof useBuildEditor>;
