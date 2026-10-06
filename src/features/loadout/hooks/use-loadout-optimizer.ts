/**
 * Owns all interactive state for the optimizer (selected skills, the active
 * pool tab, the search query, result expansion) and exposes intent-named
 * actions plus derived view data. Presentation components stay stateless and
 * receive everything through props (SRP + DIP).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { WeaponCatalog } from "@/features/builds/hooks/use-catalog";
import type {
  ArtianCustomization,
  WeaponKind,
} from "@/features/builds/types";
import { buildWeaponRowFor } from "@/features/builds/weapon-rows";
import {
  dropStrayBonuses,
  equipWeapon,
  weaponProblem as findWeaponProblem,
  withWeaponBonus,
  withWeaponCustomization,
} from "@/features/builds/weapon-selection";
import { CATEGORY_CONFIG, CATEGORY_ORDER, categoryOf } from "../config";
import { loadOptimizerParams, saveOptimizerParams } from "../persistence";
import type {
  GroupedSkills,
  PoolSkill,
  Rank,
  SelectedSkill,
  SelectedSkillMap,
  SkillCategory,
} from "../types";
import { weaponSkillsOf } from "../weapon";
import { useSearchSets } from "./use-search-sets";

const EMPTY_SKILLS: GroupedSkills = {
  armorSkills: [],
  weaponSkills: [],
  setSkills: [],
  groupSkills: [],
};

/** Compute the visible skill pool given the active tab / search query. */
const buildPool = (
  skills: GroupedSkills,
  activeTab: SkillCategory,
  query: string,
): PoolSkill[] => {
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
};

type UseLoadoutOptimizerArgs = {
  skills?: GroupedSkills;
  isLoadingSkills?: boolean;
  /** Weapons, Artian rules and bonus names the equipped weapon is resolved against. */
  weaponCatalog: WeaponCatalog;
};

export const useLoadoutOptimizer = ({
  skills = EMPTY_SKILLS,
  isLoadingSkills = false,
  weaponCatalog,
}: UseLoadoutOptimizerArgs) => {
  // Search params are restored from localStorage so a returning user keeps the
  // skills / rank / weapon they last picked (see `../persistence`).
  const [persisted] = useState(loadOptimizerParams);

  const [selected, setSelected] = useState<SelectedSkillMap>(persisted.selected);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SkillCategory>("armor");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [rank, setRank] = useState<Rank>(persisted.rank);
  // The equipped weapon (a catalog weapon, plus a Gogma Artian's rolled bonuses and any Artian
  // configuration). Its Set/Group Bonuses are the search's Pre-owned Piece Count.
  const [weapon, setWeaponSelection] = useState(persisted.weapon);
  // Weapon type picked in the UI. Only matters while no weapon is equipped.
  const [chosenWeaponKind, setChosenWeaponKind] = useState<WeaponKind | null>(
    null,
  );
  const { weapons, artianRules, skillCatalog } = weaponCatalog;

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

  // ── Weapon ───────────────────────────────────────────────────────────────
  // Saved state may name a weapon the catalog no longer has, or pair bonuses with a weapon that
  // cannot carry them (only a Gogma Artian does); clean up once the catalog can say so.
  useEffect(() => {
    if (weapons.length === 0) return;
    setWeaponSelection((current) => {
      if (current.weaponId && !weapons.some((item) => item.id === current.weaponId)) {
        return equipWeapon(current, "", weapons, artianRules);
      }
      return dropStrayBonuses(current, weapons);
    });
  }, [weapons, artianRules]);

  /** Switching weapon type drops an equipped weapon of another type. */
  const setWeaponKind = useCallback(
    (kind: WeaponKind) => {
      setChosenWeaponKind(kind);
      setWeaponSelection((current) => {
        const equipped = weapons.find((item) => item.id === current.weaponId);
        return equipped && equipped.kind !== kind
          ? equipWeapon(current, "", weapons, artianRules)
          : current;
      });
    },
    [weapons, artianRules],
  );

  /** Empty `weaponId` unequips the weapon. */
  const setWeapon = useCallback(
    (weaponId: string) =>
      setWeaponSelection((current) =>
        equipWeapon(current, weaponId, weapons, artianRules),
      ),
    [weapons, artianRules],
  );

  const setWeaponCustomization = useCallback(
    (customization: ArtianCustomization) =>
      setWeaponSelection((current) =>
        withWeaponCustomization(current, customization),
      ),
    [],
  );

  /** Set (or clear, with `null`) a Gogma Artian's rolled Set or Group Bonus, by id. */
  const setWeaponBonus = useCallback(
    (kind: "setBonusId" | "groupBonusId", bonusId: string | null) =>
      setWeaponSelection((current) => withWeaponBonus(current, kind, bonusId)),
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
  // The weapon's bonuses come from the catalog; searching before it loads would silently drop them.
  const isWeaponPending = Boolean(weapon.weaponId) && weapons.length === 0;
  const weaponSkills = useMemo(
    () => weaponSkillsOf(weapon, weapons, skillCatalog?.response.bonuses ?? []),
    [weapon, weapons, skillCatalog],
  );

  const runSearch = useCallback(() => {
    if (isSearching || isWeaponPending) return;
    setExpanded(new Set());
    void search(selected, rank, weaponSkills);
  }, [search, selected, rank, weaponSkills, isSearching, isWeaponPending]);

  // ── Derived view data ─────────────────────────────────────────────────────
  const pool = useMemo(
    () => buildPool(skills, activeTab, searchQuery),
    [skills, activeTab, searchQuery],
  );

  const selectedList = useMemo<SelectedSkill[]>(
    () => Object.values(selected),
    [selected],
  );

  const weaponRow = useMemo(
    () => buildWeaponRowFor(weapon, weapons, chosenWeaponKind, [], artianRules),
    [weapon, weapons, chosenWeaponKind, artianRules],
  );

  // A Gogma Artian's rolled bonuses are picked from the shared bonus catalog.
  const weaponBonusOptions = useMemo(
    () => skillCatalog?.bonuses ?? { set: [], group: [] },
    [skillCatalog],
  );

  /** A weapon rule the API would reject on save, as a sentence; `null` when fine. */
  const weaponProblem = findWeaponProblem(weaponRow.artian, weapon);

  const requestedNames = useMemo(
    () => new Set(Object.keys(selected)),
    [selected],
  );

  const selectedCount = selectedList.length;
  const canSearch = selectedCount > 0 && !isSearching && !isWeaponPending;
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
    weaponRow,
    weaponSkills,
    weaponBonusOptions,
    weaponProblem,
    isLoadingWeapons: weaponCatalog.isLoading,
    canSearch,
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
    setWeaponKind,
    setWeapon,
    setWeaponCustomization,
    setWeaponBonus,
  };
};

export type LoadoutOptimizerController = ReturnType<typeof useLoadoutOptimizer>;
