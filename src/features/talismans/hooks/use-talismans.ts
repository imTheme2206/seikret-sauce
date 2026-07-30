import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import useSWR from "node_modules/swr/dist/index";
import { ApiError } from "openapi-typescript-fetch";
import type { CreateTalismanInput, CustomTalisman } from "../types";

export interface UseTalismans {
  talismans: CustomTalisman[];
  isLoading: boolean;
  error: Error | null;
  create: (input: CreateTalismanInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * The backend doesn't publish response schemas for `/api/talismans` yet, so the
 * generated OpenAPI types leave `data` as `unknown` here — cast at this one edge
 * rather than threading `unknown` through the rest of the feature.
 */
function toError(e: unknown, fallback: string): Error {
  if (e instanceof ApiError) {
    const body = e.data as { error?: string } | undefined;
    return new Error(body?.error ?? `${fallback} (${e.status})`);
  }
  return new Error(fallback);
}

/** CRUD over the signed-in user's custom talismans; scoped to their Discord ID by the API. */
export function useTalismans(): UseTalismans {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const { api } = useApi();

  const { data, isLoading, error, mutate } = useSWR<CustomTalisman[]>(
    userId ? ["talismans", userId] : null,
    async () => {
      try {
        const { data } = await api("/api/talismans").method("get").create()({});
        return data as unknown as CustomTalisman[];
      } catch (e) {
        throw toError(e, "Failed to load talismans.");
      }
    },
    { revalidateOnFocus: false },
  );

  const create = async (input: CreateTalismanInput) => {
    try {
      const { data: created } = await api("/api/talismans")
        .method("post")
        .create()(input);
      await mutate(
        (prev) => [...(prev ?? []), created as unknown as CustomTalisman],
        { revalidate: false },
      );
    } catch (e) {
      throw toError(e, "Failed to create talisman.");
    }
  };

  const remove = async (id: string) => {
    try {
      await api("/api/talismans/{id}").method("delete").create()({ id });
      await mutate((prev) => prev?.filter((t) => t.id !== id), {
        revalidate: false,
      });
    } catch (e) {
      throw toError(e, "Failed to delete talisman.");
    }
  };

  return {
    talismans: data ?? [],
    isLoading,
    error: error ?? null,
    create,
    remove,
  };
}
