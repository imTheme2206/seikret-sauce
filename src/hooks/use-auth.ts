import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface UseAuth {
  session: Session | null;
  isLoading: boolean;
  discordUser: { name: string | null; avatarUrl: string | null } | null;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
}

/** Reads the Discord identity fields Supabase's Discord OAuth provider stores on the user. */
function toDiscordUser(session: Session | null): UseAuth["discordUser"] {
  const identity = session?.user.identities?.find((i) => i.provider === "discord");
  if (!identity) return null;

  const data = identity.identity_data ?? {};
  return {
    name: (data.full_name as string) ?? (data.name as string) ?? null,
    avatarUrl: (data.avatar_url as string) ?? null,
  };
}

/** Session state backed by Supabase's Discord OAuth provider; see enlightened-fellows-discord-bot docs/adr/0003. */
export function useAuth(): UseAuth {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, isLoading, discordUser: toDiscordUser(session), signInWithDiscord, signOut };
}
