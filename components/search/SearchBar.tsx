"use client";

/**
 * NaviLag — Search bar
 *
 * Floating input at the top of the map. Handles:
 *   - Opening/closing the results panel
 *   - Global ⌘K / Ctrl+K shortcut to focus
 *   - Esc to clear and close
 *   - Mounting <SearchResults /> beneath itself when open
 *
 * The search query lives in the global store so other parts of the
 * app (e.g. recent searches later) can read it.
 */

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useMapStore } from "@/lib/store/useMapStore";
import SearchResults from "./SearchResults";

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  const searchQuery = useMapStore((s) => s.searchQuery);
  const setSearchQuery = useMapStore((s) => s.setSearchQuery);
  const isSearchOpen = useMapStore((s) => s.isSearchOpen);
  const setSearchOpen = useMapStore((s) => s.setSearchOpen);

  // ---- Global ⌘K / Ctrl+K shortcut ------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K (Mac) or Ctrl+K (Win/Linux) → focus search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        // Wait a tick so the input is rendered/visible before focusing
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      // Esc → close, clear focus
      if (e.key === "Escape" && isSearchOpen) {
        setSearchOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSearchOpen, setSearchOpen]);

  // ---- Handlers --------------------------------------------------------
  const handleFocus = () => setSearchOpen(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isSearchOpen) setSearchOpen(true);
  };

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Input shell */}
      <div
        className={`
          flex items-center gap-2 rounded-lg border bg-bg-overlay/85 backdrop-blur-md transition-colors
          ${
            isSearchOpen
              ? "border-accent/60 ring-1 ring-accent/30"
              : "border-border-default hover:border-border-strong"
          }
        `}
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search 'mass comm', 'jaja', 'senate'…"
          value={searchQuery}
          onChange={handleChange}
          onFocus={handleFocus}
          className="flex-1 bg-transparent py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          aria-label="Search campus"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={handleClear}
            className="mr-1 grid h-7 w-7 place-items-center rounded-md text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="mr-2 hidden rounded border border-border-default bg-bg-elevated px-1.5 py-0.5 font-display text-[10px] font-medium tracking-wider text-text-muted sm:inline-block">
            ⌘ K
          </span>
        )}
      </div>

      {/* Results panel */}
      {isSearchOpen && <SearchResults />}
    </div>
  );
}
