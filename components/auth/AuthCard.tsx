/**
 * NaviLag — Auth Card
 *
 * Shared visual shell for sign-in / sign-up / check-email pages.
 * Pure presentation, no logic. Keeps the auth pages slim.
 *
 * Visual: a subtle accent gradient bar runs across the top edge of the
 * card to give it identity without shouting. The card body is a soft
 * elevated surface with a 1px inner ring for depth.
 */

import Link from "next/link";

type AuthCardProps = {
  /** Big display title. */
  title: string;
  /** Supporting paragraph below the title. */
  subtitle?: string;
  /** Small chip at the top, e.g. "Sign up". */
  eyebrow?: string;
  children: React.ReactNode;
  /** Optional link row at the bottom (e.g. "Already have an account? Sign in"). */
  footer?: {
    text: string;
    linkText: string;
    href: string;
  };
};

export default function AuthCard({
  title,
  subtitle,
  eyebrow,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Eyebrow */}
      {eyebrow && (
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span className="font-display text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
            {eyebrow}
          </span>
        </div>
      )}

      {/* Title + subtitle */}
      <div>
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-text-primary md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {/* Form / body slot — with accent topline */}
      <div className="relative overflow-hidden rounded-xl border border-border-default bg-bg-elevated/40 backdrop-blur-sm">
        {/* Accent topline */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, color-mix(in srgb, var(--accent) 80%, transparent) 25%, color-mix(in srgb, var(--accent) 80%, transparent) 75%, transparent 100%)",
          }}
        />
        {/* Soft top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-12 h-16 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 100%, color-mix(in srgb, var(--accent) 30%, transparent), transparent)",
          }}
        />

        <div className="relative p-6 md:p-7">{children}</div>
      </div>

      {/* Footer link */}
      {footer && (
        <div className="text-center text-sm text-text-muted">
          {footer.text}{" "}
          <Link
            href={footer.href}
            className="font-medium text-text-primary underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            {footer.linkText}
          </Link>
        </div>
      )}
    </div>
  );
}