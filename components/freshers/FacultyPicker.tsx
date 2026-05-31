"use client";

/**
 * NaviLag — Faculty Picker
 *
 * Compact form letting a signed-in user pick their faculty. Once they save,
 * the freshers page personalizes around their pick.
 *
 * Rendering states:
 *   - signed-out:     small "sign in to personalize" CTA
 *   - signed-in, no faculty set:    full picker
 *   - signed-in, faculty set:       compact "Your faculty: X · Change"
 *
 * Storage: Supabase user_metadata via useUserProfile().
 */

import Link from "next/link";
import { useState } from "react";
import { LogIn, Loader2, AlertTriangle, Pencil, Check } from "lucide-react";
import { useIsSignedIn } from "@/lib/store/useAuthStore";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

/** Canonical faculty names — must match the `faculty` field used in locations.ts. */
export const FACULTY_OPTIONS = [
  "Science",
  "Arts",
  "Engineering",
  "Law",
  "Social Sciences",
  "Education",
  "Management Sciences",
  "Environmental Sciences",
] as const;

export default function FacultyPicker() {
  const isSignedIn = useIsSignedIn();
  const { profile, isUpdating, error, updateFaculty } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(profile.faculty ?? "");

  // ---------- Signed-out state ----------
  if (!isSignedIn) {
    return (
      <div className="rounded-lg border border-border-default bg-bg-elevated/40 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-base font-semibold tracking-tight text-text-primary">
              Get a guide built for your faculty.
            </div>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-text-secondary">
              Sign in and pick your faculty — we&apos;ll show you exactly
              what&apos;s around your building.
            </p>
          </div>
          <Link
            href="/sign-in?next=/freshers"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            <LogIn className="h-4 w-4" />
            Sign in to personalize
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!pending) return;
    await updateFaculty(pending);
    setIsEditing(false);
  };

  // ---------- Signed-in, faculty already set (compact view) ----------
  if (profile.faculty && !isEditing) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
            Your faculty
          </div>
          <div className="mt-0.5 font-display text-lg font-semibold tracking-tight text-text-primary">
            Faculty of {profile.faculty}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setPending(profile.faculty ?? "");
            setIsEditing(true);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border-default bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          <Pencil className="h-3 w-3" />
          Change
        </button>
      </div>
    );
  }

  // ---------- Signed-in, picker open ----------
  return (
    <div className="rounded-lg border border-border-default bg-bg-elevated/40 p-5">
      <div className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
        Pick your faculty
      </div>
      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
        We&apos;ll highlight your faculty building and the essentials around
        it. You can change this any time.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          disabled={isUpdating}
          className="flex-1 rounded-md border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent disabled:opacity-60"
        >
          <option value="">Select your faculty…</option>
          {FACULTY_OPTIONS.map((f) => (
            <option key={f} value={f}>
              Faculty of {f}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!pending || isUpdating}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60 sm:flex-initial"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save
          </button>
          {profile.faculty && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setPending(profile.faculty ?? "");
              }}
              disabled={isUpdating}
              className="rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-60"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-1.5 text-[11px] text-danger">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}