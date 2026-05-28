"use client";

/**
 * NaviLag — Map page
 *
 * The main app screen. Loads CampusMap client-only (Leaflet needs window),
 * overlays a top bar, category filter chips, and a temporary detail panel
 * for the selected location.
 *
 * Real search bar and bottom sheet come in the next steps and replace
 * the temporary inline UI here.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  X,
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
  Dumbbell,
  Stethoscope,
  Loader2,
  Star,
  Navigation,
  Route as RouteIcon,
  AlertTriangle,
} from "lucide-react";

import { CATEGORY_LIST } from "@/lib/data/categories";
import { getLocationById } from "@/lib/data/locations";
import { useMapStore, useFavoritesStore } from "@/lib/store/useMapStore";
import { useIsSignedIn } from "@/lib/store/useAuthStore";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useRoute } from "@/lib/hooks/useRoute";
import { formatDistanceAndDuration } from "@/lib/utils/distance";
import type { CategoryId } from "@/lib/data/types";

import SearchBar from "@/components/search/SearchBar";
import BottomSheet from "@/components/layout/BottomSheet";

// ---------------------------------------------------------------------------
// Dynamic import — Leaflet is client-only
// ---------------------------------------------------------------------------

const CampusMap = dynamic(() => import("@/components/map/CampusMap"), {
  ssr: false,
  loading: () => <MapLoadingState />,
});

// ---------------------------------------------------------------------------
// Icon resolver — turn the string in categories.ts into a real component
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

type IconName = keyof typeof ICONS;

function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name as IconName] ?? MapPin;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MapPage() {
  const selectedLocationId = useMapStore((s) => s.selectedLocationId);
  const selectLocation = useMapStore((s) => s.selectLocation);
  const activeCategory = useMapStore((s) => s.activeCategory);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);

  // Read deep-link query params (?id=... or ?category=...) on mount
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
    // We only want to read these on mount, not on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLocation = useMemo(
    () => (selectedLocationId ? getLocationById(selectedLocationId) : null),
    [selectedLocationId],
  );

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg-base">
      {/* ============ The map fills the whole screen ============ */}
      <div className="absolute inset-0 z-0">
        <CampusMap />
      </div>

      {/* ============ Top bar ============ */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 md:p-5">
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-overlay/80 px-3 py-2 text-sm font-medium text-text-primary backdrop-blur-md transition-colors hover:bg-bg-overlay"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        {/* Real search bar — keyboard ⌘K, fuzzy search, results panel */}
        <div className="pointer-events-auto w-full max-w-md">
          <SearchBar />
        </div>

        <div className="hidden h-9 w-9 md:block" aria-hidden />
      </header>

      {/* ============ Category filter chips (scrollable, anchored top) ============ */}
      <div className="pointer-events-none absolute inset-x-0 top-[64px] z-10 md:top-[80px]">
        <div className="pointer-events-auto flex gap-2 overflow-x-auto px-3 pb-2 md:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryChip
            label="All"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {CATEGORY_LIST.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              colorVar={cat.colorVar}
              active={activeCategory === cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
            />
          ))}
        </div>
      </div>

      {/* ============ Location detail sheet ============ */}
      <BottomSheet
        open={!!selectedLocation}
        onClose={() => selectLocation(null)}
      >
        {selectedLocation && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 pb-3">
              <div className="min-w-0">
                <CategoryBadge category={selectedLocation.category} />
                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-text-primary">
                  {selectedLocation.name}
                </h2>
                {selectedLocation.faculty && (
                  <p className="mt-1 text-xs text-text-muted">
                    Faculty of {selectedLocation.faculty}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => selectLocation(null)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border-default bg-bg-elevated text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 pb-8">
              <p className="text-sm leading-relaxed text-text-secondary">
                {selectedLocation.shortDescription}
              </p>

              {selectedLocation.hours && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border-subtle bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="tabular">{selectedLocation.hours}</span>
                </div>
              )}

              {selectedLocation.contains &&
                selectedLocation.contains.length > 0 && (
                  <div className="mt-5">
                    <div className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
                      Inside
                    </div>
                    <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
                      {selectedLocation.contains.map((thing) => (
                        <li
                          key={thing}
                          className="flex items-center gap-2 before:h-1 before:w-1 before:rounded-full before:bg-border-strong"
                        >
                          {thing}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {selectedLocation.description && (
                <p className="mt-5 text-sm leading-relaxed text-text-secondary">
                  {selectedLocation.description}
                </p>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <DirectionsButton
                  destinationLat={selectedLocation.coords.lat}
                  destinationLng={selectedLocation.coords.lng}
                  destinationId={selectedLocation.id}
                />
                <FavoriteButton locationId={selectedLocation.id} />
              </div>

              {/* View full details link */}
              <Link
                href={`/location/${selectedLocation.id}`}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-accent"
              >
                View full details
                <span aria-hidden>→</span>
              </Link>
            </div>
          </>
        )}
      </BottomSheet>

      {/* ============ Route HUD ============ */}
      <RouteHUD />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

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

function CategoryBadge({ category }: { category: CategoryId }) {
  const cat = CATEGORY_LIST.find((c) => c.id === category);
  if (!cat) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[11px] font-medium"
      style={{ color: `var(${cat.colorVar})` }}
    >
      <CategoryIcon name={cat.icon} className="h-3 w-3" />
      <span>{cat.singular}</span>
    </div>
  );
}

function FavoriteButton({ locationId }: { locationId: string }) {
  const router = useRouter();
  const isSignedIn = useIsSignedIn();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(locationId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const handleClick = () => {
    // Gate: must be signed in to save favourites
    if (!isSignedIn) {
      router.push(`/sign-in?next=/map?id=${locationId}`);
      return;
    }
    toggleFavorite(locationId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors
        ${
          isFavorite
            ? "border-accent bg-bg-elevated text-accent"
            : "border-border-default bg-bg-elevated text-text-secondary hover:bg-bg-hover hover:text-text-primary"
        }
      `}
      aria-label={isFavorite ? "Remove from favourites" : "Save to favourites"}
      title={!isSignedIn ? "Sign in to save" : undefined}
    >
      <Star
        className={`h-4 w-4 ${isFavorite ? "fill-accent" : ""}`}
        strokeWidth={isFavorite ? 2 : 2.5}
      />
      <span className="hidden sm:inline">{isFavorite ? "Saved" : "Save"}</span>
    </button>
  );
}

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

// ---------------------------------------------------------------------------
// Directions button — handles geolocation + route fetch in one click
// ---------------------------------------------------------------------------

function DirectionsButton({
  destinationLat,
  destinationLng,
  destinationId,
}: {
  destinationLat: number;
  destinationLng: number;
  destinationId: string;
}) {
  const router = useRouter();
  const isSignedIn = useIsSignedIn();
  const geo = useGeolocation();
  const { fetchRoute, isLoading: isRouting, error: routeError } = useRoute();
  const route = useMapStore((s) => s.route);
  const routeDestinationId = useMapStore((s) => s.routeDestinationId);

  // Local state to track whether the user has clicked this button
  const [intent, setIntent] = useState(false);

  // Once we have a position AND the user has expressed intent, fetch the route
  useEffect(() => {
    if (
      intent &&
      geo.position &&
      !isRouting &&
      !(route && routeDestinationId === destinationId)
    ) {
      fetchRoute(
        geo.position,
        { lat: destinationLat, lng: destinationLng },
        destinationId,
      );
      setIntent(false);
    }
  }, [
    intent,
    geo.position,
    isRouting,
    route,
    routeDestinationId,
    destinationId,
    destinationLat,
    destinationLng,
    fetchRoute,
  ]);

  const handleClick = () => {
    // Gate: must be signed in to get directions
    if (!isSignedIn) {
      router.push(`/sign-in?next=/map?id=${destinationId}`);
      return;
    }
    setIntent(true);
    if (!geo.position) {
      geo.request();
    } else {
      fetchRoute(
        geo.position,
        { lat: destinationLat, lng: destinationLng },
        destinationId,
      );
    }
  };

  const isLoading = geo.isLoading || isRouting;
  const hasActiveRouteToThis = route && routeDestinationId === destinationId;

  // Pick label + state
  let label: string;
  if (!isSignedIn) label = "Sign in for directions";
  else if (hasActiveRouteToThis) label = "Route shown on map";
  else if (geo.isLoading) label = "Finding you…";
  else if (isRouting) label = "Building route…";
  else label = "Directions";

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || !!hasActiveRouteToThis}
        className={`
          inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors
          ${
            hasActiveRouteToThis
              ? "bg-bg-elevated text-text-secondary border border-border-default"
              : "bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-60"
          }
        `}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        {label}
      </button>

      {/* Error messages */}
      {geo.error && (
        <div className="flex items-start gap-1.5 text-[11px] text-danger">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{geo.error.message}</span>
        </div>
      )}
      {routeError && (
        <div className="flex items-start gap-1.5 text-[11px] text-danger">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{routeError.message}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Route HUD — distance + ETA pill, top-center of the screen
// ---------------------------------------------------------------------------

function RouteHUD() {
  const route = useMapStore((s) => s.route);
  const routeDestinationId = useMapStore((s) => s.routeDestinationId);
  const clearRoute = useMapStore((s) => s.clearRoute);

  if (!route) return null;

  const destination = routeDestinationId
    ? getLocationById(routeDestinationId)
    : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center px-4 md:bottom-auto md:top-[120px]">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-accent/40 bg-bg-overlay/95 px-4 py-2 shadow-lg backdrop-blur-xl">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-fg">
          <RouteIcon className="h-3.5 w-3.5" />
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
              to {destination.name}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={clearRoute}
          className="grid h-7 w-7 place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label="End route"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
