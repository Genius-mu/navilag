/**
 * NaviLag — Auth store (Zustand)
 *
 * Holds the current Supabase session and a derived "user" object.
 * Components subscribe to slices instead of polling Supabase directly,
 * so a re-render only happens when the auth state actually changes.
 *
 * The store is fed by <AuthProvider /> at the root, which subscribes
 * to Supabase's onAuthStateChange and writes through to here.
 */

import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Three states the auth UI cares about:
 *   - "loading":  initial check still in flight (don't flash sign-in UI)
 *   - "signed-in": session is valid
 *   - "signed-out": no session
 */
export type AuthStatus = "loading" | "signed-in" | "signed-out";

type AuthState = {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  setSession: (session: Session | null) => void;
  /** Mark the initial check as complete (called by AuthProvider). */
  setReady: () => void;
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: "loading",

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? "signed-in" : "signed-out",
    }),

  setReady: () =>
    set((state) => ({
      // Only flip from "loading" to a resolved state if we haven't already
      status:
        state.status === "loading"
          ? state.session
            ? "signed-in"
            : "signed-out"
          : state.status,
    })),
}));

// ---------------------------------------------------------------------------
// Selector hooks — components subscribe to just what they need
// ---------------------------------------------------------------------------

export const useUser = () => useAuthStore((s) => s.user);
export const useSession = () => useAuthStore((s) => s.session);
export const useAuthStatus = () => useAuthStore((s) => s.status);
export const useIsSignedIn = () =>
  useAuthStore((s) => s.status === "signed-in");
