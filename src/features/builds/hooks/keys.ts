/**
 * SWR cache keys for the Builds feature, in one place so the mutate-by-prefix
 * calls in `use-build-api` can never drift from the keys the readers use.
 */

export const buildKeys = {
  catalog: (part: "armors" | "decorations" | "weapons") => `build-catalog/${part}`,
  mine: (userId: string) => `builds/mine/${userId}`,
  detail: (id: string) => `builds/detail/${id}`,
  shared: "builds/shared",
} as const;

const startsWith = (prefix: string) => (key: unknown) =>
  typeof key === "string" && key.startsWith(prefix);

/** Matchers for `mutate(filter)` — invalidate every page of a list. */
export const buildKeyMatchers = {
  anyMine: startsWith("builds/mine/"),
  anyShared: startsWith(buildKeys.shared),
};
