"use client";

/**
 * NaviLag — Sign up
 *
 * Email + password registration via Supabase.
 * Flow:
 *   1. Submit → supabase.auth.signUp() with emailRedirectTo
 *   2. Supabase emails them a confirmation link
 *   3. Redirect to /check-email so they know to check their inbox
 *   4. They click the link → /auth/callback exchanges the code → signed in
 *
 * Email confirmation is required by your Supabase project settings.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import { Field, PasswordField } from "@/components/auth/AuthFields";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    // Stash the email so the check-email page can display it
    sessionStorage.setItem("navilag-pending-email", email);
    router.push("/check-email");
  };

  return (
    <AuthCard
      eyebrow="Sign up"
      title="Create your account."
      subtitle="Save your favourite spots, set your faculty, sync across devices."
      footer={{
        text: "Already have an account?",
        linkText: "Sign in",
        href: "/sign-in",
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          id="email"
          label="Email"
          icon={<Mail className="h-4 w-4" />}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          show={showPassword}
          onToggleShow={() => setShowPassword((s) => !s)}
          disabled={isSubmitting}
          hint="Use 6 or more characters."
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
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>

        <p className="text-center text-[11px] leading-relaxed text-text-muted">
          By creating an account you agree to keep things friendly. We
          don&apos;t sell your data — this is a student project.
        </p>
      </form>
    </AuthCard>
  );
}
