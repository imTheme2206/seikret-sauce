/**
 * Encapsulates the "find optimal sets" request against `POST /api/mh-wilds/search`.
 * The rest of the app depends on this hook's small interface, not on fetch/endpoint
 * details (DIP).
 *
 * The endpoint is synchronous and CPU-heavy (~15s worst case) behind a 10 req/min/IP
 * limit, so this hook:
 *  - aborts the previous request when a new one starts (and on unmount), so a late
 *    response can never overwrite newer state;
 *  - enforces a client-side timeout slightly above the backend's worst case;
 *  - surfaces every failure through a discriminated `status` + typed `error` rather
 *    than masking it (there is intentionally no offline mock fallback — see
 *    `docs/adr/0001-*` and CONTEXT.md).
 */

import { ApiError } from "openapi-typescript-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { paths } from "@/vendor/openapi";
import type {
  LoadoutResult,
  Rank,
  SearchError,
  SearchStatus,
  SelectedSkillMap,
  WeaponSkills,
} from "../types";

/** Slightly above the backend's ~15s worst case so we only trip on genuine hangs. */
const TIMEOUT_MS = 20_000;

/** Request body shape taken straight from the OpenAPI schema, so backend drift is a type error. */
type SearchRequestBody =
  paths["/api/mh-wilds/search"]["post"]["requestBody"]["content"]["application/json"];

/**
 * Split the selection map into the category buckets the endpoint expects, and
 * fold the equipped weapon's contribution into the Pre-owned Piece Counts.
 *
 * A `weapon` carries up to one Set Skill and one Group Skill, each contributing a
 * single piece, sent as `initialSetCounts`/`initialGroupCounts`. This is a
 * different axis from the desired Activation Level in `setSkills`/`groupSkills` —
 * see CONTEXT.md. Skills the weapon doesn't carry leave the count maps empty.
 */
function toRequestBody(
  selected: SelectedSkillMap,
  rank: Rank,
  weapon: WeaponSkills,
): SearchRequestBody {
  const skills: Record<string, number> = {};
  const setSkills: Record<string, number> = {};
  const groupSkills: Record<string, number> = {};
  const initialSetCounts: Record<string, number> = {};
  const initialGroupCounts: Record<string, number> = {};

  for (const [name, sel] of Object.entries(selected)) {
    if (sel.category === "set") setSkills[name] = sel.level;
    else if (sel.category === "group") groupSkills[name] = sel.level;
    else skills[name] = sel.level;
  }

  if (weapon.set) initialSetCounts[weapon.set] = 1;
  if (weapon.group) initialGroupCounts[weapon.group] = 1;

  return {
    skills,
    setSkills,
    groupSkills,
    initialSetCounts,
    initialGroupCounts,
    rank,
  };
}

export interface UseSearchSets {
  status: SearchStatus;
  results: LoadoutResult[];
  error: SearchError | null;
  search: (
    selected: SelectedSkillMap,
    rank: Rank,
    weapon: WeaponSkills,
  ) => Promise<void>;
  reset: () => void;
}

export function useSearchSets(): UseSearchSets {
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<LoadoutResult[]>([]);
  const [error, setError] = useState<SearchError | null>(null);

  // `useApi` returns a fresh fetcher each render; hold the latest in a ref so the
  // memoised `search` can stay stable (`[]` deps) without going stale.
  const { api } = useApi();
  const apiRef = useRef(api);
  apiRef.current = api;

  /** Controller for the in-flight request, so a re-submit or unmount can cancel it. */
  const activeController = useRef<AbortController | null>(null);

  // Abort any in-flight search if the component unmounts.
  useEffect(() => () => activeController.current?.abort(), []);

  const search = useCallback(async (
    selected: SelectedSkillMap,
    rank: Rank,
    weapon: WeaponSkills,
  ) => {
    if (!Object.keys(selected).length) return;

    // Supersede any in-flight request — its late response must not win.
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setStatus("searching");
    setResults([]);
    setError(null);

    try {
      const searchSets = apiRef.current("/api/mh-wilds/search")
        .method("post")
        .create();

      // `data` is typed off the OpenAPI response schema — no cast, no drift.
      // No `baseUrl` override — `useApi()` already configured it from the environment.
      const { data } = await searchSets(toRequestBody(selected, rank, weapon), {
        signal: controller.signal,
      });

      setResults(data);
      setStatus(data.length > 0 ? "success" : "empty");
    } catch (e) {
      // Abort rejects here too. If it was our timeout, report it; if it was a
      // supersede/unmount, the newer call (or none) owns the state — stay quiet.
      if (controller.signal.aborted) {
        if (timedOut) {
          setError({
            kind: "timeout",
            message:
              "Search timed out. Try narrowing your requirements and retry.",
          });
          setStatus("error");
        }
        return;
      }

      // The fetcher throws `ApiError` on any non-2xx, carrying the HTTP status.
      if (e instanceof ApiError) {
        if (e.status === 429) {
          setError({
            kind: "rate-limit",
            message:
              "Too many searches in a short time. Wait a moment and try again.",
          });
        } else if (e.status === 422) {
          setError({
            kind: "validation",
            message:
              "The search request was rejected. Adjust your skill selection and retry.",
          });
        } else {
          setError({
            kind: "network",
            message: `Search failed (${e.status}). Please try again.`,
          });
        }
        setStatus("error");
        return;
      }

      setError({
        kind: "network",
        message:
          "Couldn't reach the search service. Check your connection and retry.",
      });
      setStatus("error");
    } finally {
      clearTimeout(timeout);
      if (activeController.current === controller)
        activeController.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    activeController.current?.abort();
    setResults([]);
    setStatus("idle");
    setError(null);
  }, []);

  return { status, results, error, search, reset };
}
