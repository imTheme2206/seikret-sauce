import type {
  ArtianCustomization,
  Weapon,
} from "@/features/builds/types";

/** A hunter-owned Artian or Gogma Artian configuration, reusable in builds. */
export type CustomWeapon = {
  id: string;
  userId: string;
  name: string;
  weaponId: string;
  customization: ArtianCustomization;
  setBonusId: string | null;
  groupBonusId: string | null;
  createdAt: string;
};

export type CreateCustomWeaponInput = Omit<CustomWeapon, "id" | "userId" | "createdAt">;

export type CustomWeaponWithCatalog = CustomWeapon & {
  weapon: Weapon;
};

export const MAX_CUSTOM_WEAPONS_PER_USER = 50;
