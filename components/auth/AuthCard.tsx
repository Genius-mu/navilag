/**
 * NaviLag — Auth Card
 *
 * Shared visual shell for sign-in / sign-up / check-email pages.
 * Pure presentation, no logic. Keeps the auth pages slim.
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

      {/* Form / body slot */}
      <div className="rounded-xl border border-border-default bg-bg-elevated/40 p-6 backdrop-blur-sm md:p-7">
        {children}
      </div>

      {/* Footer link */}
      {footer && (
        <div className="text-center text-sm text-text-muted">
          {footer.text}{" "}
          <Link
            href={footer.href}
            className="font-medium text-text-primary transition-colors hover:text-accent"
          >
            {footer.linkText}
          </Link>
        </div>
      )}
    </div>
  );
}
