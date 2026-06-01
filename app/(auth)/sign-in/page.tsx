"use client";

/**
 * NaviLag — Sign in
 *
 * Email + password authentication via Supabase.
 * On success, redirect to wherever the user was trying to go (read
 * from ?next=...), defaulting to the map page.
 *
 * Also handles two query flags coming back from related flows:
 *   - ?reset=1       → user just finished setting a new password
 *   - ?auth_error=1  → auth callback failed (e.g. expired link)
 */

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import { Field, PasswordField } from "@/components/auth/AuthFields";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const nextPath = searchParams.get("next") || "/map";
  const justReset = searchParams.get("reset") === "1";
  const authError = searchParams.get("auth_error") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const msg = signInError.message;
      if (msg.includes("Email not confirmed")) {
        setError(
          "Please confirm your email first — check your inbox for the link we sent.",
        );
      } else if (msg.includes("Invalid login credentials")) {
        setError("Wrong email or password. Try again.");
      } else {
        setError(msg);
      }
      setIsSubmitting(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  return (
    <AuthCard
      eyebrow="Sign in"
      title="Welcome back."
      subtitle="Sign in to access your saved spots and personal freshers view."
      footer={{
        text: "Don't have an account yet?",
        linkText: "Sign up",
        href: "/sign-up",
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Inline banners from sibling flows */}
        {justReset && (
          <div className="flex items-start gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Password updated. Sign in with your new password.</span>
          </div>
        )}
        {authError && (
          <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              That link expired or was already used. Try signing in below.
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

        <div className="flex flex-col gap-1.5">
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            show={showPassword}
            onToggleShow={() => setShowPassword((s) => !s)}
            disabled={isSubmitting}
            required
          />

          {/* Forgot password — real link now */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[11px] text-text-muted underline-offset-2 transition-colors hover:text-text-secondary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthCard>
  );
}