/**
 * Owns all interactive state for the optimizer (selected skills, the active
 * pool tab, the search query, result expansion) and exposes intent-named
 * actions plus derived view data. Presentation components stay stateless and
 * receive everything through props (SRP + DIP).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORY_CONFIG, CATEGORY_ORDER, categoryOf } from "../config";
import { loadOptimizerParams, saveOptimizerParams } from "../persistence";
import type {
  GroupedSkills,
  PoolSkill,
  Rank,
  SelectedSkill,
  SelectedSkillMap,
  SkillCategory,
  WeaponSkills,
} from "../types";
import { useSearchSets } from "./use-search-sets";

const EMPTY_SKILLS: GroupedSkills = {
  armorSkills: [],
  weaponSkills: [],
  setSkills: [],
  groupSkills: [],
};

/** Compute the visible skill pool given the active tab / search query. */
function buildPool(
  skills: GroupedSkills,
  activeTab: SkillCategory,
  query: string,
): PoolSkill[] {
  const q = query.toLowerCase().trim();

  if (q.length > 0) {
    return CATEGORY_ORDER.flatMap((category) =>
      skills[CATEGORY_CONFIG[category].groupKey]
        .filter((s) => s.name.toLowerCase().includes(q))
        .map((s) => ({ ...s, category })),
    );
  }

  return skills[CATEGORY_CONFIG[activeTab].groupKey].map((s) => ({
    ...s,
    category: activeTab,
  }));
}

interface UseLoadoutOptimizerArgs {
  skills?: GroupedSkills;
  isLoadingSkills?: boolean;
}

export function useLoadoutOptimizer({
  skills = EMPTY_SKILLS,
  isLoadingSkills = false,
}: UseLoadoutOptimizerArgs) {
  // Search params are restored from localStorage so a returning user keeps the
  // skills / rank / weapon they last picked (see `../persistence`).
  const [persisted] = useState(loadOptimizerParams);

  const [selected, setSelected] = useState<SelectedSkillMap>(persisted.selected);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SkillCategory>("armor");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [rank, setRank] = useState<Rank>(persisted.rank);
  // The Set/Group Skills the equipped weapon contributes a Pre-owned Piece toward.
  const [weapon, setWeapon] = useState<WeaponSkills>(persisted.weapon);

  useEffect(() => {
    saveOptimizerParams({ selected, rank, weapon });
  }, [selected, rank, weapon]);

  const { results, status, error, search } = useSearchSets();
  const isSearching = status === "searching";

  // ── Skill selection ──────────────────────────────────────────────────────
  const addSkill = useCallback((skill: PoolSkill) => {
    setSelected((prev) => {
      if (prev[skill.name]) return prev;
      const category = categoryOf(skill);
      const sel: SelectedSkill = {
        name: skill.name,
        level: 1,
        maxLevel: skill.maxLevel,
        category,
        icon: skill.icon,
      };
      return { ...prev, [skill.name]: sel };
    });
  }, []);

  const removeSkill = useCallback((name: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setLevel = useCallback((name: string, level: number) => {
    setSelected((prev) => {
      const sel = prev[name];
      if (!sel) return prev;
      const clamped = Math.max(1, Math.min(sel.maxLevel, level));
      return { ...prev, [name]: { ...sel, level: clamped } };
    });
  }, []);

  const clearAll = useCallback(() => setSelected({}), []);

  /** Set (or clear, with `null`) the skill of one kind the equipped weapon carries. */
  const setWeaponSkill = useCallback(
    (kind: keyof WeaponSkills, name: string | null) =>
      setWeapon((prev) => ({ ...prev, [kind]: name })),
    [],
  );

  // ── Result expansion ──────────────────────────────────────────────────────
  const toggleExpand = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const runSearch = useCallback(() => {
    if (isSearching) return;
    setExpanded(new Set());
    void search(selected, rank, weapon);
  }, [search, selected, rank, weapon, isSearching]);

  // ── Derived view data ─────────────────────────────────────────────────────
  const pool = useMemo(
    () => buildPool(skills, activeTab, searchQuery),
    [skills, activeTab, searchQuery],
  );

  const selectedList = useMemo<SelectedSkill[]>(
    () => Object.values(selected),
    [selected],
  );

  // A weapon can carry any Set or Group Skill; those are the picker's options.
  const weaponOptions = useMemo(
    () => ({
      set: skills.setSkills.map((s) => s.name),
      group: skills.groupSkills.map((s) => s.name),
    }),
    [skills],
  );

  const requestedNames = useMemo(
    () => new Set(Object.keys(selected)),
    [selected],
  );

  const selectedCount = selectedList.length;
  const isSearchActive = searchQuery.trim().length > 0;

  return {
    // state
    selected,
    selectedList,
    selectedCount,
    requestedNames,
    searchQuery,
    activeTab,
    isSearchActive,
    pool,
    isLoadingSkills,
    expanded,
    results,
    status,
    error,
    isSearching,
    rank,
    weapon,
    weaponOptions,
    // actions
    setSearchQuery,
    setActiveTab,
    addSkill,
    removeSkill,
    setLevel,
    clearAll,
    toggleExpand,
    runSearch,
    setRank,
    setWeaponSkill,
  };
}

export type LoadoutOptimizerController = ReturnType<typeof useLoadoutOptimizer>;
