/**
 * NaviLag — Reusable auth form field components
 *
 * Two pieces shared between sign-up and sign-in:
 *   - <Field>          a labeled input with an icon
 *   - <PasswordField>  a password input with show/hide toggle
 */

"use client";

import { Lock, Eye, EyeOff } from "lucide-react";

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
      <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg-base px-3 transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30">
        <span className="text-text-muted">{icon}</span>
        <input
          id={id}
          {...props}
          className="flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-60"
        />
      </div>
    </div>
  );
}

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
      <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg-base px-3 transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30">
        <Lock className="h-4 w-4 text-text-muted" />
        <input
          id={id}
          type={show ? "text" : "password"}
          {...props}
          className="flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onToggleShow}
          tabIndex={-1}
          className="grid h-7 w-7 place-items-center rounded text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {hint && <p className="text-[11px] text-text-muted">{hint}</p>}
    </div>
  );
}
