"use client";

/**
 * NaviLag — Check email
 *
 * The page users land on after sign-up. Reminds them to check their
 * inbox and click the verification link. Also offers a "resend"
 * action in case the first email didn't arrive.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";

export default function CheckEmailPage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string>("");
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  // The sign-up page stashes the email in sessionStorage so we can
  // both display it AND use it for the resend action.
  useEffect(() => {
    const pending = sessionStorage.getItem("navilag-pending-email");
    if (pending) setEmail(pending);
  }, []);

  const handleResend = async () => {
    if (!email) {
      setResendError(
        "We don't know which email to resend to. Try signing up again.",
      );
      setResendState("error");
      return;
    }
    setResendState("sending");
    setResendError(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setResendError(error.message);
      setResendState("error");
      return;
    }
    setResendState("sent");
  };

  return (
    <AuthCard
      eyebrow="Almost there"
      title="Check your email."
      subtitle={
        email
          ? `We sent a confirmation link to ${email}. Click it to finish creating your account.`
          : "We sent a confirmation link to your email. Click it to finish creating your account."
      }
      footer={{
        text: "Already confirmed?",
        linkText: "Sign in",
        href: "/sign-in",
      }}
    >
      <div className="flex flex-col gap-5">
        {/* Email icon + reminder list */}
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border-default bg-bg-base text-accent">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="text-text-primary">
              The email should arrive within a minute.
            </div>
            <div className="text-text-muted">
              If you don&apos;t see it, check your spam folder.
            </div>
          </div>
        </div>

        <div className="h-px bg-border-subtle" />

        {/* Resend */}
        <div className="flex flex-col gap-3">
          <div className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
            Didn&apos;t receive it?
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === "sending" || resendState === "sent"}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-bg-base px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover disabled:opacity-60"
          >
            {resendState === "sending" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {resendState === "sent" && (
              <CheckCircle2 className="h-4 w-4 text-accent" />
            )}
            {resendState === "sending"
              ? "Sending…"
              : resendState === "sent"
                ? "Email sent again"
                : "Resend confirmation email"}
          </button>

          {resendState === "error" && resendError && (
            <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{resendError}</span>
            </div>
          )}
        </div>

        <div className="h-px bg-border-subtle" />

        {/* What happens next */}
        <div>
          <div className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
            What happens next
          </div>
          <ol className="mt-2 space-y-1.5 text-sm text-text-secondary">
            <Step number="1">Click the link in the email we sent.</Step>
            <Step number="2">Your account gets activated.</Step>
            <Step number="3">You&apos;ll land back here, signed in.</Step>
          </ol>
        </div>

        <Link
          href="/"
          className="text-center text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          ← Back to home
        </Link>
      </div>
    </AuthCard>
  );
}

function Step({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border-subtle bg-bg-base font-display text-[10px] font-semibold text-text-secondary">
        {number}
      </span>
      <span>{children}</span>
    </li>
  );
}
