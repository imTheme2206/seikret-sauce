import type { Middleware } from "openapi-typescript-fetch";
import { newFetcher } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { type paths } from "@/vendor/openapi";

/** Attaches the signed-in user's Supabase JWT so per-user routes (e.g. `/api/talismans`) can identify the Discord user. */
const withAuth: Middleware = async (url, init, next) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    init.headers.set("Authorization", `Bearer ${token}`);
  }

  return next(url, init);
};

const newApi = () => {
  const endpoint =
    process.env.BUN_PUBLIC_API_BASE_URL ??
    (process.env.NODE_ENV === "production"
      ? window.location.origin
      : "http://localhost:3003");

  return {
    api: newFetcher<paths>(endpoint, [withAuth]).path,
  };
};

export const useApi = () => {
  return newApi();
};
