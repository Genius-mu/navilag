"use client";

/**
 * NaviLag — Site Header
 *
 * Auth-aware navigation that appears at the top of public pages.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  LogIn,
  UserPlus,
  Map as MapIcon,
  LogOut,
  Star,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStatus, useUser } from "@/lib/store/useAuthStore";

export default function SiteHeader() {
  const status = useAuthStatus();
  const user = useUser();

  return (
    <header className="relative z-30 flex items-center justify-between gap-3 px-5 py-4 md:px-10 md:py-5">
      <Link
        href="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <div className="relative grid h-7 w-7 place-items-center rounded-md bg-accent">
          <MapPin className="h-4 w-4 text-accent-fg" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">
          NaviLag
        </span>
      </Link>

      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/freshers"
          className="hidden rounded-md px-3 py-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary md:inline-block"
        >
          Freshers
        </Link>
        <Link
          href="/map"
          className="hidden rounded-md px-3 py-1.5 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary md:inline-block"
        >
          Map
        </Link>

        {status === "loading" && <AuthSkeleton />}
        {status === "signed-out" && <SignedOutActions />}
        {status === "signed-in" && user && (
          <UserMenu email={user.email ?? ""} />
        )}
      </nav>
    </header>
  );
}

function SignedOutActions() {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border-default bg-bg-elevated/50 backdrop-blur-sm text-text-primary transition-colors hover:bg-bg-elevated h-9 w-9 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
        aria-label="Sign in"
      >
        <LogIn className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>

      <Link
        href="/sign-up"
        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent font-medium text-accent-fg transition-colors hover:bg-accent-hover h-9 w-9 sm:h-auto sm:w-auto sm:px-4 sm:py-1.5"
        aria-label="Sign up"
      >
        <UserPlus className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Sign up</span>
      </Link>
    </div>
  );
}

function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-elevated/60 backdrop-blur-sm transition-colors hover:bg-bg-elevated h-9 pl-1 pr-1 sm:pr-2.5"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent font-display text-xs font-semibold text-accent-fg">
          {initial}
        </span>
        <ChevronDown
          className={`hidden h-3.5 w-3.5 text-text-secondary transition-transform sm:inline-block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-lg border border-border-default bg-bg-overlay/95 shadow-lg backdrop-blur-xl"
        >
          <div className="border-b border-border-subtle px-3 py-2.5">
            <div className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
              Signed in as
            </div>
            <div className="mt-0.5 truncate text-sm text-text-primary">
              {email}
            </div>
          </div>

          <div className="p-1">
            <MenuItem
              href="/map"
              icon={<MapIcon className="h-4 w-4" />}
              label="Open map"
            />
            <MenuItem
              href="/map?filter=favorites"
              icon={<Star className="h-4 w-4" />}
              label="Your favourites"
            />
          </div>

          <div className="border-t border-border-subtle p-1">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-danger disabled:cursor-wait disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-text-primary transition-colors hover:bg-bg-hover"
    >
      <span className="text-text-secondary">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function AuthSkeleton() {
  return (
    <div className="h-9 w-20 animate-pulse rounded-md border border-border-subtle bg-bg-elevated/40" />
  );
}
