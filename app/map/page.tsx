"use client";

/**
 * NaviLag — Map page
 *
 * Layout:
 *   - Top: SiteHeader (auth-aware, with avatar dropdown)
 *   - Desktop (md+): persistent left sidebar with location details / recents,
 *     map fills the rest of the screen
 *   - Mobile: full-screen map with a draggable bottom sheet for details
 *
 * The map itself (CampusMap) is loaded client-only via next/dynamic
 * because Leaflet needs window. Search and categories float as overlays
 * over the map area.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useEffect } from "react";
import {
  MapPin,
  Loader2,
  Route as RouteIcon,
  X,
  Compass,
  Search as SearchIcon,
  Clock,
  GitCompare,
} from "lucide-react";

import { CATEGORY_LIST } from "@/lib/data/categories";
import { getLocationById } from "@/lib/data/locations";
import { useMapStore } from "@/lib/store/useMapStore";
import { useRoute } from "@/lib/hooks/useRoute";
import { formatDistanceAndDuration } from "@/lib/utils/distance";
import type { CategoryId } from "@/lib/data/types";

import SiteHeader from "@/components/layout/SiteHeader";
import SearchBar from "@/components/search/SearchBar";
import BottomSheet from "@/components/layout/BottomSheet";
import LocationDetailsPanel from "@/components/map/LocationDetailsPanel";

// Icon resolver for category chips
import {
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
  Dumbbell,
  Stethoscope,
} from "lucide-react";

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
// Dynamic import — Leaflet is client-only
// ---------------------------------------------------------------------------

const CampusMap = dynamic(() => import("@/components/map/CampusMap"), {
  ssr: false,
  loading: () => <MapLoadingState />,
});

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MapPage() {
  const selectedLocationId = useMapStore((s) => s.selectedLocationId);
  const selectLocation = useMapStore((s) => s.selectLocation);
  const activeCategory = useMapStore((s) => s.activeCategory);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);
  const compareMode = useMapStore((s) => s.compareMode);
  const compareLocationId = useMapStore((s) => s.compareLocationId);
  const { fetchRoute } = useRoute();

  // Deep-link: ?id=<slug> selects a location, ?category=<id> filters
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const categoryParam = params.get("category") as CategoryId | null;

    if (idParam && getLocationById(idParam)) {
      selectLocation(idParam);
    }
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLocation = useMemo(
    () => (selectedLocationId ? getLocationById(selectedLocationId) : null),
    [selectedLocationId],
  );

  const compareLocation = useMemo(
    () => (compareLocationId ? getLocationById(compareLocationId) : null),
    [compareLocationId],
  );

  // When both compare-targets are set, fetch a route between them.
  // This doesn't need GPS — it's location-to-location.
  useEffect(() => {
    if (compareMode === "active" && selectedLocation && compareLocation) {
      fetchRoute(
        selectedLocation.coords,
        compareLocation.coords,
        compareLocation.id,
      );
    }
  }, [compareMode, selectedLocation, compareLocation, fetchRoute]);

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-bg-base">
      {/* ============ Header (auth-aware) ============ */}
      <div className="relative z-30 border-b border-border-default bg-bg-base/90 backdrop-blur-md">
        <SiteHeader />
      </div>

      {/* ============ Body: sidebar + map ============ */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className="hidden w-[360px] flex-shrink-0 border-r border-border-default bg-bg-base md:flex md:flex-col"
          aria-label="Location details and recents"
        >
          {selectedLocation ? (
            <LocationDetailsPanel
              location={selectedLocation}
              onClose={() => selectLocation(null)}
            />
          ) : (
            <SidebarEmpty />
          )}
        </aside>

        {/* Map area */}
        <div className="relative flex-1">
          <div className="absolute inset-0 z-0">
            <CampusMap />
          </div>

          {/* Search + categories — float over the map */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 md:p-4">
            <div className="pointer-events-auto mx-auto w-full max-w-xl">
              <SearchBar />
            </div>

            <div className="pointer-events-auto">
              <CategoryChipRow
                activeCategory={activeCategory}
                onSelect={(c) =>
                  setActiveCategory(activeCategory === c ? null : c)
                }
              />
            </div>
          </div>

          {/* Compare-mode banner — visible only while picking */}
          {compareMode === "picking" && <CompareBanner />}

          {/* Route HUD */}
          <RouteHUD />
        </div>
      </div>

      {/* ============ Mobile bottom sheet ============ */}
      <div className="md:hidden">
        <BottomSheet
          open={!!selectedLocation}
          onClose={() => selectLocation(null)}
        >
          {selectedLocation && (
            <LocationDetailsPanel
              location={selectedLocation}
              onClose={() => selectLocation(null)}
            />
          )}
        </BottomSheet>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sidebar empty state — shows when no location is selected
// ---------------------------------------------------------------------------

function SidebarEmpty() {
  const recentlyViewed = useMapStore((s) => s.recentlyViewed);
  const selectLocation = useMapStore((s) => s.selectLocation);
  const clearRecentlyViewed = useMapStore((s) => s.clearRecentlyViewed);

  // Map IDs → resolved locations, skipping any that no longer exist
  const recentLocations = useMemo(
    () =>
      recentlyViewed
        .map((id) => getLocationById(id))
        .filter((loc): loc is NonNullable<typeof loc> => !!loc),
    [recentlyViewed],
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Intro */}
      <div className="border-b border-border-subtle px-5 py-5">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-accent" />
          <h2 className="font-display text-base font-semibold tracking-tight text-text-primary">
            Explore UNILAG
          </h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Search a place above, or tap a marker on the map to see its details,
          walking directions, and what&apos;s inside.
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-text-muted">
          <SearchIcon className="h-3 w-3" />
          <span>Press</span>
          <kbd className="rounded border border-border-default bg-bg-elevated px-1 py-px font-display text-[9px] tracking-wider">
            ⌘ K
          </kbd>
          <span>to search anytime</span>
        </div>
      </div>

      {/* Recently viewed */}
      <div className="flex-1 px-5 pb-6 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-text-muted" />
            <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
              Recently viewed
            </span>
          </div>
          {recentLocations.length > 0 && (
            <button
              type="button"
              onClick={clearRecentlyViewed}
              className="text-[10px] text-text-muted transition-colors hover:text-text-secondary"
            >
              Clear
            </button>
          )}
        </div>

        {recentLocations.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border-subtle bg-bg-elevated/40 p-4 text-xs leading-relaxed text-text-muted">
            Locations you open will appear here for quick access.
          </div>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {recentLocations.map((loc) => {
              const cat = CATEGORY_LIST.find((c) => c.id === loc.category);
              return (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => selectLocation(loc.id)}
                    className="group flex w-full items-center gap-3 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:border-border-subtle hover:bg-bg-elevated"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border-subtle"
                      style={{
                        color: cat ? `var(${cat.colorVar})` : undefined,
                        backgroundColor: cat
                          ? `color-mix(in srgb, var(${cat.colorVar}) 14%, transparent)`
                          : undefined,
                      }}
                    >
                      {cat && (
                        <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-text-primary">
                        {loc.name}
                      </div>
                      <div className="truncate text-[11px] text-text-muted">
                        {cat?.singular ?? "Location"}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Bottom credit */}
      <div className="border-t border-border-subtle px-5 py-3">
        <Link
          href="/"
          className="font-display text-[10px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-text-secondary"
        >
          NaviLag · v0.1
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category chip row
// ---------------------------------------------------------------------------

function CategoryChipRow({
  activeCategory,
  onSelect,
}: {
  activeCategory: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <CategoryChip
        label="All"
        active={activeCategory === null}
        onClick={() => activeCategory !== null && onSelect(activeCategory)}
      />
      {CATEGORY_LIST.map((cat) => (
        <CategoryChip
          key={cat.id}
          label={cat.label}
          icon={cat.icon}
          colorVar={cat.colorVar}
          active={activeCategory === cat.id}
          onClick={() => onSelect(cat.id)}
        />
      ))}
    </div>
  );
}

function CategoryChip({
  label,
  icon,
  colorVar,
  active,
  onClick,
}: {
  label: string;
  icon?: string;
  colorVar?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors
        ${
          active
            ? "border-accent bg-accent text-accent-fg"
            : "border-border-default bg-bg-overlay/80 text-text-secondary hover:bg-bg-overlay hover:text-text-primary"
        }
      `}
      style={!active && colorVar ? { color: `var(${colorVar})` } : undefined}
    >
      {icon && <CategoryIcon name={icon} className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Loading + Route HUD
// ---------------------------------------------------------------------------

function MapLoadingState() {
  return (
    <div className="relative grid h-full w-full place-items-center bg-bg-base">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-3 text-text-muted">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <span className="font-display text-sm tracking-tight">
          Loading the map…
        </span>
      </div>
    </div>
  );
}

function RouteHUD() {
  const route = useMapStore((s) => s.route);
  const routeDestinationId = useMapStore((s) => s.routeDestinationId);
  const clearRoute = useMapStore((s) => s.clearRoute);
  const compareMode = useMapStore((s) => s.compareMode);
  const exitCompare = useMapStore((s) => s.exitCompare);

  if (!route) return null;

  const destination = routeDestinationId
    ? getLocationById(routeDestinationId)
    : null;

  const isComparing = compareMode === "active";
  const handleClear = isComparing ? exitCompare : clearRoute;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center px-4 md:bottom-auto md:top-[140px]">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-accent/40 bg-bg-overlay/95 px-4 py-2 shadow-lg backdrop-blur-xl">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-fg">
          {isComparing ? (
            <GitCompare className="h-3.5 w-3.5" />
          ) : (
            <RouteIcon className="h-3.5 w-3.5" />
          )}
        </div>

        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm font-semibold text-text-primary tabular">
            {formatDistanceAndDuration(
              route.distanceMeters,
              route.durationSeconds,
            )}
          </span>
          {destination && (
            <span className="truncate text-[11px] text-text-muted">
              {isComparing ? "between locations" : `to ${destination.name}`}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="grid h-7 w-7 place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label={isComparing ? "End comparison" : "End route"}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compare-mode banner — shown while user picks the second location
// ---------------------------------------------------------------------------

function CompareBanner() {
  const exitCompare = useMapStore((s) => s.exitCompare);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[120px] z-30 flex justify-center px-4 md:top-[80px]">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-accent/50 bg-bg-overlay/95 px-4 py-2 shadow-lg backdrop-blur-xl">
        <div className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-fg">
          <GitCompare className="h-3 w-3" />
        </div>
        <span className="text-xs font-medium text-text-primary">
          Tap another marker to compare
        </span>
        <button
          type="button"
          onClick={exitCompare}
          className="ml-1 grid h-6 w-6 place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label="Cancel comparison"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
