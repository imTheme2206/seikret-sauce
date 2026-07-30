/**
 * Controller for the build editor: owns the draft, resolves it into rows and
 * live totals, and performs the save. Mirrors the optimizer's controller shape —
 * the editor components below it are stateless.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTalismans } from "@/features/talismans/hooks/use-talismans";
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

const RELOAD_PROMPT =
  "This loadout was changed elsewhere. Reload the newest revision? Your unsaved edits will be replaced.";

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
  // Kept across retries of this logical create action; replaced only after success.
  const idempotencyKey = useRef(crypto.randomUUID());

  useEffect(() => {
    if (existing.build && hydratedId !== existing.build.id) {
      setDraft(draftFromBuild(existing.build));
      setHydratedId(existing.build.id);
    }
  }, [existing.build, hydratedId]);

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
      setMessage("Give this loadout a name before saving.");
      return;
    }
    if (!hasAnyPiece(draft)) {
      setMessage("Equip at least one piece before saving.");
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
      await navigate({ to: "/b/$buildId", params: { buildId: saved.id } });
    } catch (error) {
      if (isRevisionConflict(error) && window.confirm(RELOAD_PROMPT)) {
        setHydratedId(null);
        await existing.mutate();
        setMessage("Loaded the newest revision. Review it before saving again.");
        return;
      }
      setMessage(
        buildErrorMessage(error, "The forge could not save this loadout."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing: Boolean(buildId),
    draft,
    rows,
    snapshot,
    message,
    isSaving,
    isLoadingCatalog: catalog.isLoading,
    isLoadingBuild: Boolean(buildId) && existing.isLoading,
    loadError: buildId ? existing.error : null,
    patchDraft,
    selectGear,
    assignDecoration,
    save,
  };
}

export type BuildEditorController = ReturnType<typeof useBuildEditor>;
