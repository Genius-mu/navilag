"use client";

/**
 * NaviLag — Search results panel
 *
 * Shown beneath <SearchBar /> when search is open. Three states:
 *   1. Empty query → show "popular spots" (freshers picks)
 *   2. Query with hits → show ranked Fuse results
 *   3. Query with no hits → empty state
 *
 * Keyboard nav (↑ ↓ Enter) is supported once the user has typed.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
  Dumbbell,
  Stethoscope,
  MapPin,
  Sparkles,
  Search as SearchIcon,
  CornerDownLeft,
} from "lucide-react";

import { searchLocations } from "@/lib/utils/search";
import { getFreshersPicks } from "@/lib/data/locations";
import { CATEGORIES } from "@/lib/data/categories";
import { useMapStore } from "@/lib/store/useMapStore";
import type { Location, SearchResult } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// Icon resolver — same pattern as the map page
// ---------------------------------------------------------------------------

const ICONS = {
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
  Dumbbell,
  Stethoscope,
  MapPin,
} as const;

function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? MapPin;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SearchResults() {
  const searchQuery = useMapStore((s) => s.searchQuery);
  const selectLocation = useMapStore((s) => s.selectLocation);
  const setSearchOpen = useMapStore((s) => s.setSearchOpen);
  const setSearchQuery = useMapStore((s) => s.setSearchQuery);

  // Active highlighted index for keyboard navigation
  const [activeIndex, setActiveIndex] = useState(0);

  // Compute results — memoized so we don't re-run Fuse on every render
  const results: SearchResult[] = useMemo(
    () => searchLocations(searchQuery, 10),
    [searchQuery],
  );

  const freshersPicks: Location[] = useMemo(() => getFreshersPicks(), []);

  // Reset highlight when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    if (!searchQuery) return; // only when there's a query

    const handler = (e: KeyboardEvent) => {
      if (results.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const hit = results[activeIndex];
        if (hit) handleSelect(hit.location.id);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, activeIndex, searchQuery]);

  const handleSelect = (locationId: string) => {
    selectLocation(locationId);
    setSearchOpen(false);
    setSearchQuery("");
  };

  // ---- Render branches -------------------------------------------------

  const hasQuery = searchQuery.trim().length > 0;
  const showEmptyState = hasQuery && results.length === 0;
  const showResults = hasQuery && results.length > 0;
  const showSuggestions = !hasQuery;

  return (
    <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-border-default bg-bg-overlay/95 shadow-lg backdrop-blur-xl">
      {/* --------- Suggestions (empty query) --------- */}
      {showSuggestions && (
        <div>
          <SectionHeader
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="Freshers picks"
          />
          <ul className="max-h-[55dvh] overflow-y-auto py-1">
            {freshersPicks.slice(0, 8).map((loc) => (
              <ResultRow
                key={loc.id}
                location={loc}
                onSelect={() => handleSelect(loc.id)}
              />
            ))}
          </ul>
          <Footer />
        </div>
      )}

      {/* --------- Live results --------- */}
      {showResults && (
        <div>
          <SectionHeader
            icon={<SearchIcon className="h-3.5 w-3.5" />}
            label={`${results.length} result${results.length === 1 ? "" : "s"}`}
          />
          <ul
            className="max-h-[55dvh] overflow-y-auto py-1"
            role="listbox"
            aria-label="Search results"
          >
            {results.map((result, index) => (
              <ResultRow
                key={result.location.id}
                location={result.location}
                matchedOn={result.matchedOn}
                active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onSelect={() => handleSelect(result.location.id)}
              />
            ))}
          </ul>
          <Footer />
        </div>
      )}

      {/* --------- Empty state --------- */}
      {showEmptyState && (
        <div className="px-5 py-8 text-center">
          <SearchIcon className="mx-auto h-5 w-5 text-text-muted" />
          <p className="mt-3 text-sm text-text-primary">
            No matches for &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Try a shorter query, or check the category filters.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border-subtle px-4 py-2 text-text-muted">
      {icon}
      <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em]">
        {label}
      </span>
    </div>
  );
}

function ResultRow({
  location,
  matchedOn,
  active = false,
  onMouseEnter,
  onSelect,
}: {
  location: Location;
  matchedOn?: SearchResult["matchedOn"];
  active?: boolean;
  onMouseEnter?: () => void;
  onSelect: () => void;
}) {
  const category = CATEGORIES[location.category];

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
        className={`
          flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors
          ${active ? "bg-bg-hover" : "hover:bg-bg-hover/60"}
        `}
        role="option"
        aria-selected={active}
      >
        {/* Category icon chip */}
        <div
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border-subtle"
          style={{
            color: `var(${category.colorVar})`,
            backgroundColor: `color-mix(in srgb, var(${category.colorVar}) 14%, transparent)`,
          }}
        >
          <CategoryIcon name={category.icon} className="h-4 w-4" />
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-text-primary">
            {location.name}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-text-muted">
            <span>{category.singular}</span>
            {matchedOn === "alias" && (
              <>
                <span className="text-border-strong">·</span>
                <span>matched alias</span>
              </>
            )}
            {matchedOn === "contains" && (
              <>
                <span className="text-border-strong">·</span>
                <span>department match</span>
              </>
            )}
            {matchedOn === "faculty" && (
              <>
                <span className="text-border-strong">·</span>
                <span>faculty match</span>
              </>
            )}
          </div>
        </div>

        {/* Enter hint, visible on active row */}
        {active && (
          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        )}
      </button>
    </li>
  );
}

function Footer() {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2 text-[10px] text-text-muted">
      <div className="flex items-center gap-3">
        <KeyHint label="↑ ↓" desc="navigate" />
        <KeyHint label="↵" desc="select" />
        <KeyHint label="esc" desc="close" />
      </div>
      <span className="font-display tracking-wider">NaviLag</span>
    </div>
  );
}

function KeyHint({ label, desc }: { label: string; desc: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="rounded border border-border-default bg-bg-elevated px-1 py-px font-display text-[9px] font-medium tracking-wider text-text-secondary">
        {label}
      </kbd>
      <span>{desc}</span>
    </span>
  );
}
