import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import useSWR from "swr";
import { ApiError } from "openapi-typescript-fetch";
import type { CreateCustomWeaponInput, CustomWeapon } from "../types";

export type UseCustomWeapons = {
  weapons: CustomWeapon[];
  isLoading: boolean;
  error: Error | null;
  create: (input: CreateCustomWeaponInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  retry: () => void;
};

const toError = (error: unknown, fallback: string): Error => {
  if (error instanceof ApiError) {
    const body = error.data as { error?: string } | undefined;
    return new Error(body?.error ?? `${fallback} (${error.status})`);
  }
  return new Error(fallback);
};

/** CRUD for saved Artian / Gogma Artian configurations owned by the signed-in hunter. */
export const useCustomWeapons = (): UseCustomWeapons => {
  const { session } = useAuth();
  const { api } = useApi();
  const userId = session?.user.id ?? null;

  const { data, isLoading, error, mutate } = useSWR<CustomWeapon[]>(
    userId ? ["custom-weapons", userId] : null,
    async () => {
      try {
        const { data } = await api("/api/custom-weapons").method("get").create()({});
        return data as unknown as CustomWeapon[];
      } catch (requestError) {
        throw toError(requestError, "Failed to load saved weapons.");
      }
    },
    { revalidateOnFocus: false },
  );

  const create = async (input: CreateCustomWeaponInput) => {
    try {
      const { data: created } = await api("/api/custom-weapons")
        .method("post")
        .create()(input);
      await mutate((previous) => [...(previous ?? []), created as unknown as CustomWeapon], {
        revalidate: false,
      });
    } catch (requestError) {
      throw toError(requestError, "Failed to save weapon.");
    }
  };

  const remove = async (id: string) => {
    try {
      await api("/api/custom-weapons/{id}").method("delete").create()({ id });
      await mutate((previous) => previous?.filter((weapon) => weapon.id !== id), {
        revalidate: false,
      });
    } catch (requestError) {
      throw toError(requestError, "Failed to delete saved weapon.");
    }
  };

  return {
    weapons: data ?? [],
    isLoading,
    error: error ?? null,
    create,
    remove,
    retry: () => void mutate(),
  };
};
