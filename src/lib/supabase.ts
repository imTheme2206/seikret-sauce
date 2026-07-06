import { createClient } from "@supabase/supabase-js";

const url = process.env.BUN_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Missing BUN_PUBLIC_SUPABASE_URL or BUN_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the environment.",
  );
}

/**
 * Must point at the same Supabase project as the enlightened-fellows-discord-bot
 * API — that project's Auth Hook stamps `app_metadata.discord_id` into the JWT
 * (see that repo's docs/adr/0003), which the API requires on every `/api/talismans`
 * request.
 */
export const supabase = createClient(url, publishableKey);
