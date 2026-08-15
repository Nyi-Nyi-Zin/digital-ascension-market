import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthValue = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrate = async (next: Session | null) => {
      if (!active) return;
      setSession(next);
      if (!next?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", next.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setIsAdmin(Boolean(data));
      setLoading(false);

      // Keep a profile row in sync for admin customer listings.
      await supabase.from("profiles").upsert(
        {
          id: next.user.id,
          email: next.user.email ?? null,
          full_name: (next.user.user_metadata?.["full_name"] as string) ?? null,
        },
        { onConflict: "id" },
      );
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      void hydrate(next);
    });

    void supabase.auth.getSession().then(({ data }) => void hydrate(data.session));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, isAdmin, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
