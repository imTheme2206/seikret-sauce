import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

function DiscordGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.211.375-.444.879-.608 1.278a18.27 18.27 0 0 0-5.487 0A12.6 12.6 0 0 0 9.182 3a19.74 19.74 0 0 0-4.435 1.372C1.582 8.958.885 13.423 1.233 17.825a19.9 19.9 0 0 0 5.993 3.03c.483-.66.913-1.36 1.284-2.098a12.9 12.9 0 0 1-2.024-.978c.17-.125.336-.255.497-.39a14.19 14.19 0 0 0 12.034 0c.163.135.328.265.497.39-.642.383-1.322.71-2.028.98.372.737.8 1.436 1.284 2.096a19.86 19.86 0 0 0 5.997-3.028c.41-5.093-.7-9.518-2.95-13.457ZM8.518 15.164c-.978 0-1.78-.9-1.78-2.004 0-1.105.783-2.005 1.78-2.005 1.005 0 1.798.908 1.78 2.005 0 1.104-.783 2.004-1.78 2.004Zm6.964 0c-.978 0-1.78-.9-1.78-2.004 0-1.105.783-2.005 1.78-2.005 1.005 0 1.798.908 1.78 2.005 0 1.104-.775 2.004-1.78 2.004Z" />
    </svg>
  );
}

/** Discord sign-in/out control, backed by Supabase's Discord OAuth provider (see enlightened-fellows-discord-bot docs/adr/0003). */
export function AuthControl() {
  const { session, isLoading, discordUser, signInWithDiscord, signOut } = useAuth();

  if (isLoading) return <Skeleton className="size-8 rounded-full" />;

  if (!session) {
    return (
      <Button variant="outline" size="sm" onClick={() => void signInWithDiscord()}>
        <DiscordGlyph />
        Log in with Discord
      </Button>
    );
  }

  const initials = discordUser?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-8">
            <AvatarImage src={discordUser?.avatarUrl ?? undefined} alt={discordUser?.name ?? "Discord user"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void signOut()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
