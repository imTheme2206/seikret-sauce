import { ApiError } from "openapi-typescript-fetch";

export class BuildApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Converts the generated client's transport error into the domain envelope used by build UI. */
export const toBuildApiError = (error: unknown): BuildApiError => {
  if (error instanceof BuildApiError) return error;
  if (error instanceof ApiError) {
    const body = error.data as {
      error?: { code?: string; message?: string } | string;
    } | null;
    const nested = typeof body?.error === "object" ? body.error : null;
    return new BuildApiError(
      error.status,
      nested?.code ?? "REQUEST_FAILED",
      nested?.message ??
        (typeof body?.error === "string"
          ? body.error
          : `Request failed (${error.status}).`),
    );
  }
  return new BuildApiError(
    0,
    "NETWORK_ERROR",
    error instanceof Error ? error.message : "The Guild connection failed.",
  );
};

/**
 * Hunter-facing copy per API error code — the single place these strings live,
 * so every screen reports the same failure the same way.
 */
const CODE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Sign in with Discord before saving a loadout.",
  SAVED_BUILD_LIMIT_REACHED: "Your equipment box is full (50 saved builds).",
  SHARED_BUILD_LIMIT_REACHED:
    "Only five loadouts can be posted to the Gathering Hub at once.",
  REVISION_CONFLICT:
    "This build changed elsewhere. Reload it before saving again.",
  IDEMPOTENCY_KEY_REQUIRED: "The save token was missing. Try the save again.",
};

/** Resolves any thrown value to a message worth showing, falling back to `fallback`. */
export const buildErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof BuildApiError) {
    const known =
      CODE_MESSAGES[error.code] ??
      (error.status === 401 ? CODE_MESSAGES.UNAUTHORIZED : undefined);
    return known ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

/** True when the save failed because someone else revised the build first. */
export const isRevisionConflict = (error: unknown): boolean => {
  return error instanceof BuildApiError && error.code === "REVISION_CONFLICT";
};
