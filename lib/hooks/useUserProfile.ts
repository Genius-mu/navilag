"use client";

/**
 * NaviLag — User profile hook
 *
 * Reads + writes the user's "profile" — currently just a single field
 * (`faculty`) — stored in Supabase's user metadata. We use user_metadata
 * (NOT app_metadata) because user_metadata is editable from the client,
 * which is exactly what we want for a self-service profile.
 *
 * No new tables required. The data lives on the auth user.
 *
 * Reads are reactive — the hook subscribes to the auth store, so when
 * the user updates their profile we get fresh data on the next render.
 */

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser, useAuthStore } from "@/lib/store/useAuthStore";

export type UserProfile = {
  faculty: string | null;
};

export type UseUserProfileReturn = {
  profile: UserProfile;
  isUpdating: boolean;
  error: string | null;
  /** Update the faculty. Pass null to clear it. */
  updateFaculty: (faculty: string | null) => Promise<void>;
};

export function useUserProfile(): UseUserProfileReturn {
  const user = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pull faculty out of user_metadata. We're conservative: only accept
  // a string, fall back to null otherwise. This survives schema drift.
  const rawFaculty = user?.user_metadata?.faculty;
  const faculty = typeof rawFaculty === "string" ? rawFaculty : null;

  const profile: UserProfile = { faculty };

  const updateFaculty = useCallback(
    async (newFaculty: string | null) => {
      if (!user) {
        setError("You must be signed in to update your profile.");
        return;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error: supaErr } = await supabase.auth.updateUser({
          data: { faculty: newFaculty },
        });

        if (supaErr) throw supaErr;

        // Push the freshly-updated user object into our auth store so any
        // component that reads useUser() re-renders with the new metadata
        // without waiting for the onAuthStateChange event.
        if (data.user) {
          useAuthStore.setState({ user: data.user });
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Couldn't update your faculty. Try again.";
        setError(message);
      } finally {
        setIsUpdating(false);
      }
    },
    [user]
  );

  return { profile, isUpdating, error, updateFaculty };
}