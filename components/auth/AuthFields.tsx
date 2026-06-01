/**
 * NaviLag — Reusable auth form field components
 *
 * Pieces shared between sign-up and sign-in:
 *   - <Field>            labeled input with an icon container
 *   - <PasswordField>    password input with show/hide toggle
 *   - <PasswordStrength> visual strength meter (4 segments + label)
 *   - <FormHint>         small icon + text guidance below an input
 *
 * Visual design:
 *   - Inputs are h-11 tall (≈44px) — comfortable touch target
 *   - Icon sits in its own subtle container, not floating in the field
 *   - Focus state: 2px accent ring (no harsh outline)
 *   - Autofill colors handled in globals.css so Chrome doesn't
 *     paint the inputs yellow/white over our dark theme
 */

"use client";

import { Lock, Eye, EyeOff, Info } from "lucide-react";
import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Field — generic labeled input with icon container
// ---------------------------------------------------------------------------

export function Field({
  id,
  label,
  icon,
  ...props
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted"
      >
        {label}
      </label>
      <div className="group flex h-11 items-center gap-2 rounded-md border border-border-default bg-bg-base/60 pl-2 pr-3 transition-all focus-within:border-accent focus-within:bg-bg-base focus-within:ring-2 focus-within:ring-accent/25">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-border-subtle bg-bg-elevated text-text-secondary transition-colors group-focus-within:border-accent/50 group-focus-within:text-accent">
          {icon}
        </span>
        <input
          id={id}
          {...props}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-60"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PasswordField — same layout, with show/hide toggle
// ---------------------------------------------------------------------------

export function PasswordField({
  id,
  label,
  show,
  onToggleShow,
  hint,
  ...props
}: {
  id: string;
  label: string;
  show: boolean;
  onToggleShow: () => void;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted"
      >
        {label}
      </label>
      <div className="group flex h-11 items-center gap-2 rounded-md border border-border-default bg-bg-base/60 pl-2 pr-1 transition-all focus-within:border-accent focus-within:bg-bg-base focus-within:ring-2 focus-within:ring-accent/25">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-border-subtle bg-bg-elevated text-text-secondary transition-colors group-focus-within:border-accent/50 group-focus-within:text-accent">
          <Lock className="h-3.5 w-3.5" />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          {...props}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onToggleShow}
          tabIndex={-1}
          className="grid h-8 w-8 shrink-0 place-items-center rounded text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
      {hint && <FormHint>{hint}</FormHint>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormHint — small icon + text under a field
// ---------------------------------------------------------------------------

export function FormHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] leading-snug text-text-muted">
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// ---------------------------------------------------------------------------
// PasswordStrength — 4-segment meter + label
// ---------------------------------------------------------------------------

type StrengthScore = 0 | 1 | 2 | 3 | 4;

/**
 * Dead simple, no library. We assign one point for each of:
 *   - 8+ chars
 *   - mixed-case letters
 *   - a digit
 *   - a symbol
 * Score is the count of matched criteria (0–4). Good-enough heuristic
 * for guiding users without false confidence — we deliberately don't
 * claim "strong" until all four are met.
 */
function scorePassword(pw: string): StrengthScore {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4) as StrengthScore;
}

const LABELS: Record<StrengthScore, string> = {
  0: "Too short",
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};

const COLORS: Record<StrengthScore, string> = {
  0: "var(--text-muted)",
  1: "var(--danger)",
  2: "#fbbf24",
  3: "var(--accent)",
  4: "var(--success)",
};

export function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);
  const label = LABELS[score];
  const color = COLORS[score];

  // Only show once the user has typed something
  if (!password) {
    return (
      <FormHint>
        8+ characters with a mix of letters, numbers, and symbols.
      </FormHint>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((segment) => {
          const filled = score >= segment;
          return (
            <div
              key={segment}
              className="h-1 flex-1 rounded-full bg-border-subtle transition-colors"
              style={filled ? { backgroundColor: color } : undefined}
              aria-hidden
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span style={{ color }}>{label}</span>
        <span className="text-text-muted tabular">
          {password.length} chars
        </span>
      </div>
    </div>
  );
}

/**
 * Helper to check from outside the component whether a password
 * meets our minimum bar. Used by sign-up's submit validation.
 */
export function isPasswordAcceptable(password: string): boolean {
  return scorePassword(password) >= 2 && password.length >= 8;
}