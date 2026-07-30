/**
 * Single source of truth for build-time public configuration.
 *
 * Bun's bundler inlines `process.env.BUN_PUBLIC_*` at build time, so these must
 * be present in the environment of whoever runs `bun run build` (locally: `.env`;
 * on Vercel: the project's Environment Variables). Reading them in one place means
 * a missing value fails loudly at startup instead of silently pointing the app at
 * the wrong origin.
 */

const apiBaseUrl = process.env.BUN_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "Missing BUN_PUBLIC_API_BASE_URL in the environment. See .env.example.",
  );
}

/** Origin of the search/talisman API, e.g. `http://localhost:3003`. No trailing slash. */
export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, "");
