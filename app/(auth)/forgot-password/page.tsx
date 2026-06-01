"use client";

/**
 * NaviLag — Forgot Password
 *
 * Step 1 of the password reset flow.
 *
 * The user submits their email; Supabase generates a one-time code and
 * emails them a link. The link points at our /auth/callback route with
 * ?next=/reset-password, so after the code is exchanged for a session
 * the user lands on the new-password page and can update their pw.
 *
 * We deliberately do NOT reveal whether the email was found. Supabase's
 * resetPasswordForEmail doesn't error on unknown addresses either — it
 * just silently no-ops. This prevents user enumeration attacks.
 */

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import { Field } from "@/components/auth/AuthFields";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Show the "check your email" confirmation card once submitted. */
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Build redirect URL on the client so it works for both
    // navilag.vercel.app and localhost:3000 without env vars.
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo },
    );

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setSent(true);
    setIsSubmitting(false);
  };

  // ---------- Success state ----------
  if (sent) {
    return (
      <AuthCard
        eyebrow="Reset link sent"
        title="Check your email."
        subtitle="If an account exists for that address, we just sent a password reset link."
        footer={{
          text: "Remembered it after all?",
          linkText: "Back to sign in",
          href: "/sign-in",
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-md border border-success/40 bg-success/10 px-3 py-3 text-sm leading-relaxed text-success">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">Email sent to {email}</span>
              <span className="text-success/80">
                The link expires in about an hour. Check spam if you don&apos;t
                see it within a minute or two.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border-default bg-bg-elevated px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            Send to a different email
          </button>
        </div>
      </AuthCard>
    );
  }

  // ---------- Form state ----------
  return (
    <AuthCard
      eyebrow="Password reset"
      title="Forgot your password?"
      subtitle="Type the email you signed up with. We'll send a link you can use to set a new one."
      footer={{
        text: "Got it back to you?",
        linkText: "Back to sign in",
        href: "/sign-in",
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {expired && (
          <div className="flex items-start gap-2 rounded-md border border-border-default bg-bg-elevated/60 px-3 py-2 text-sm text-text-secondary">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
            <span>
              That reset link expired or was already used. Send a fresh one
              below.
            </span>
          </div>
        )}

        <Field
          id="email"
          label="Email"
          icon={<Mail className="h-3.5 w-3.5" />}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
        />

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending link…
            </>
          ) : (
            "Send reset link"
          )}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-text-muted">
          For your security, we don&apos;t reveal whether an email is
          registered. If you have an account, you&apos;ll get an email.
        </p>
      </form>
    </AuthCard>
  );
}