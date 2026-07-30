/**
 * Controller for the build editor: owns the draft, resolves it into rows and
 * live totals, and performs the save. Mirrors the optimizer's controller shape —
 * the editor components below it are stateless.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTalismans } from "@/features/talismans/hooks/use-talismans";
import { toast } from "@/hooks/use-toast";
import { EMPTY_DRAFT } from "../config";
import { draftFromBuild, snapshotFromDraft } from "../draft";
import { buildErrorMessage, isRevisionConflict } from "../errors";
import { buildGearRows } from "../gear-rows";
import {
  decodeTalismanValue,
  hasAnyPiece,
  toCreateBody,
} from "../utils";
import { useBuildApi } from "./use-build-api";
import { useCatalog } from "./use-catalog";
import { useSavedBuild } from "./use-saved-build";
import type {
  ArmorPosition,
  BuildDraft,
  DecorationAssignment,
  PositionKey,
} from "../types";

export function useBuildEditor(buildId?: string) {
  const navigate = useNavigate();
  const catalog = useCatalog();
  const talismans = useTalismans();
  const existing = useSavedBuild(buildId);
  const { createBuild, replaceBuild } = useBuildApi();

  const [draft, setDraft] = useState<BuildDraft>(EMPTY_DRAFT);
  const [hydratedId, setHydratedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasRevisionConflict, setHasRevisionConflict] = useState(false);
  // Kept across retries of this logical create action; replaced only after success.
  const idempotencyKey = useRef(crypto.randomUUID());

  useEffect(() => {
    if (existing.build && hydratedId !== existing.build.id) {
      setDraft(draftFromBuild(existing.build));
      setHydratedId(existing.build.id);
    }
  }, [existing.build, hydratedId]);

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
    position === "talisman"
      ? setTalisman(value)
      : setArmor(position, value);

  // ── Derived view data ─────────────────────────────────────────────────────
  const snapshot = useMemo(
    () =>
      snapshotFromDraft(
        draft,
        catalog.armors,
        catalog.decorations,
        catalog.skills,
        talismans.talismans,
      ),
    [draft, catalog.armors, catalog.decorations, catalog.skills, talismans.talismans],
  );

  const rows = useMemo(
    () =>
      buildGearRows(draft, catalog.armors, catalog.decorations, talismans.talismans),
    [draft, catalog.armors, catalog.decorations, talismans.talismans],
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!draft.name.trim()) {
      const validationMessage = "Give this loadout a name before saving.";
      setMessage(validationMessage);
      toast({
        variant: "destructive",
        title: "Loadout needs a name",
        description: validationMessage,
      });
      return;
    }
    if (!hasAnyPiece(draft)) {
      const validationMessage = "Equip at least one piece before saving.";
      setMessage(validationMessage);
      toast({
        variant: "destructive",
        title: "Loadout is empty",
        description: validationMessage,
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const saved =
        buildId && existing.build
          ? await replaceBuild(buildId, existing.build.revision, toCreateBody(draft))
          : await createBuild(toCreateBody(draft), idempotencyKey.current);
      idempotencyKey.current = crypto.randomUUID();
      toast({
        variant: "success",
        title: buildId ? "Loadout updated" : "Loadout forged",
        description: `${draft.name.trim()} was saved to your equipment box.`,
      });
      await navigate({ to: "/b/$buildId", params: { buildId: saved.id } });
    } catch (error) {
      if (isRevisionConflict(error)) {
        setHasRevisionConflict(true);
        toast({
          variant: "destructive",
          title: "A newer revision exists",
          description:
            "Choose whether to keep editing or reload the latest saved version.",
        });
        return;
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
    snapshot,
    message,
    hasRevisionConflict,
    isSaving,
    isLoadingCatalog: catalog.isLoading,
    isLoadingBuild: Boolean(buildId) && existing.isLoading,
    loadError: buildId ? existing.error : null,
    patchDraft,
    selectGear,
    assignDecoration,
    setHasRevisionConflict,
    reloadNewest,
    save,
  };
}

export type BuildEditorController = ReturnType<typeof useBuildEditor>;
