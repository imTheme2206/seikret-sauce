import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE_URL } from "@/lib/env";
import { cn } from "@/lib/utils";
import type { MonsterListItem } from "../types";

type MonsterIconProps = {
  monster: Pick<MonsterListItem, "name" | "iconUrl">;
  size?: "default" | "sm" | "lg";
  className?: string;
};

/** The monster's portrait (served by the API at `iconUrl`), falling back to its initial. */
export const MonsterIcon = ({
  monster,
  size = "default",
  className,
}: MonsterIconProps) => (
  <Avatar size={size} className={cn("rounded-sm", className)}>
    <AvatarImage src={`${API_BASE_URL}${monster.iconUrl}`} alt="" />
    <AvatarFallback className="rounded-sm">{monster.name[0]}</AvatarFallback>
  </Avatar>
);
