"use client";

/**
 * NaviLag — Sign in
 *
 * Email + password authentication via Supabase.
 * On success, redirect to wherever the user was trying to go (read
 * from ?next=...), defaulting to the map page.
 */

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import { Field, PasswordField } from "@/components/auth/AuthFields";

export default function SignInPage() {
  return (
    // useSearchParams needs a Suspense boundary at the page level
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // ?next=/some/path lets us redirect users back where they came from
  // after signing in (e.g. they clicked "Save" on a map marker)
  const nextPath = searchParams.get("next") || "/map";

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
      // Common Supabase messages we want to make friendlier
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

    // Hard-refresh to the next path so server components re-render
    // with the new auth state
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
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          show={showPassword}
          onToggleShow={() => setShowPassword((s) => !s)}
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
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </AuthCard>
  );
}
