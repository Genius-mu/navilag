/**
 * NaviLag — Auth layout
 *
 * Wraps sign-in / sign-up / check-email pages. The (auth) folder is
 * a route group — the parentheses tell Next.js this is for grouping
 * only and shouldn't appear in URLs. So /sign-in stays /sign-in.
 *
 * Provides:
 *   - Centered card layout
 *   - Subtle grid backdrop matching the rest of the app
 *   - A minimal top bar with logo + back-home link
 */

import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Backdrop grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 30%, black 35%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 30%, black 35%, transparent 80%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative grid h-7 w-7 place-items-center rounded-md bg-accent">
            <MapPin className="h-4 w-4 text-accent-fg" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            NaviLag
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
      </header>

      {/* Centered card area */}
      <div className="relative z-10 flex min-h-[calc(100dvh-80px)] items-start justify-center px-6 pt-8 pb-20 md:pt-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
