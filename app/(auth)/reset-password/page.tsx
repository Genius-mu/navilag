"use client";

/**
 * NaviLag — Reset Password
 *
 * Step 2 of the password reset flow.
 *
 * The user lands here after clicking the reset link in their email.
 * By the time they get here, /auth/callback has already exchanged the
 * code for a session — so we're signed in with a special, time-limited
 * session that has permission to call updateUser({ password }).
 *
 * After a successful password update we sign them out (so they have to
 * sign in fresh with the new password — feels more secure to most users)
 * and redirect to /sign-in with a small success flag.
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStatus } from "@/lib/store/useAuthStore";
import AuthCard from "@/components/auth/AuthCard";
import {
  PasswordField,
  PasswordStrength,
  isPasswordAcceptable,
} from "@/components/auth/AuthFields";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const authStatus = useAuthStatus();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard: if someone lands here without a session (e.g. opened the URL
  // directly or the recovery code expired), bounce them to forgot-password
  // with a clear message. We wait until auth state has settled.
  useEffect(() => {
    if (authStatus === "signed-out") {
      router.replace("/forgot-password?expired=1");
    }
  }, [authStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordAcceptable(password)) {
      setError(
        "Use at least 8 characters with a mix of letters and numbers.",
      );
      return;
    }

    if (password !== confirm) {
      setError("Those two passwords don't match.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      const msg = updateError.message.includes("same")
        ? "Your new password can't match your old one. Try another."
        : updateError.message;
      setError(msg);
      setIsSubmitting(false);
      return;
    }

    // Sign them out so they have to sign in with the new password.
    await supabase.auth.signOut();
    router.push("/sign-in?reset=1");
  };

  // ---------- Loading state ----------
  if (authStatus === "loading") {
    return (
      <AuthCard
        eyebrow="Reset password"
        title="One moment…"
        subtitle="Verifying your reset link."
      >
        <div className="flex items-center justify-center py-6 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AuthCard>
    );
  }

  // While the redirect fires for signed-out users, render nothing
  if (authStatus === "signed-out") return null;

  return (
    <AuthCard
      eyebrow="Set a new password"
      title="Pick something you'll remember."
      subtitle="You're signed in via the reset link. Choose a new password — we'll sign you out so you can sign back in fresh."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            show={showPassword}
            onToggleShow={() => setShowPassword((s) => !s)}
            disabled={isSubmitting}
            required
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordField
          id="confirm"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Re-enter the same password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          show={showConfirm}
          onToggleShow={() => setShowConfirm((s) => !s)}
          disabled={isSubmitting}
          required
        />

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !password || !confirm}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating password…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Update password
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}