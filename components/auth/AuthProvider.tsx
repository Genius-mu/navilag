"use client";

/**
 * NaviLag — Global Auth Provider
 *
 * Mounted once at the root layout. Responsibilities:
 *   1. On mount, fetch the current session from Supabase and seed
 *      the auth store.
 *   2. Subscribe to Supabase's onAuthStateChange and keep the store
 *      in sync (sign-in, sign-out, token refresh).
 *   3. Render its children unchanged.
 *
 * Why a provider instead of a hook in each component?
 *   - One subscription, not N
 *   - Single source of truth (the Zustand store)
 *   - The rest of the app just reads from useUser() / useAuthStatus()
 */

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setSession = useAuthStore((s) => s.setSession);
  const setReady = useAuthStore((s) => s.setReady);

  // Only create the Supabase client once per provider lifetime
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  useEffect(() => {
    let mounted = true;

    // ---- Initial session check -----------------------------------------
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setReady();
    });

    // ---- Subscribe to auth changes -------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setReady();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, setSession, setReady]);

  return <>{children}</>;
}
