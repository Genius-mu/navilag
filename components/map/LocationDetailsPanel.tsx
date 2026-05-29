"use client";

/**
 * NaviLag — Location Details Panel
 *
 * The content shown inside the desktop sidebar or mobile bottom sheet
 * when a location is selected. Kept as its own component so the
 * map page can stay focused on layout & wiring.
 *
 * Renders:
 *   - Stylized preview thumbnail (SVG, category-colored)
 *   - Category badge + name + faculty
 *   - Short + long descriptions
 *   - Hours pill
 *   - Distance from user (if GPS granted)
 *   - "Inside" list
 *   - Action row: Directions + Save
 *   - Compare-with-another-location button (Pass 2)
 *   - Turn-by-turn steps when a route is active to here (Pass 2)
 *   - View full details link
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  X,
  Star,
  Navigation,
  Loader2,
  AlertTriangle,
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
  Dumbbell,
  Stethoscope,
  MapPin,
  Footprints,
  GitCompare,
} from "lucide-react";

import { CATEGORY_LIST } from "@/lib/data/categories";
import { useMapStore, useFavoritesStore } from "@/lib/store/useMapStore";
import { useIsSignedIn } from "@/lib/store/useAuthStore";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useRoute } from "@/lib/hooks/useRoute";
import {
  haversineDistance,
  formatDistance,
  estimateWalkingSeconds,
  formatDuration,
} from "@/lib/utils/distance";
import type { CategoryId, Location } from "@/lib/data/types";

import RouteSteps from "./RouteSteps";

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
// Main panel content
// ---------------------------------------------------------------------------

export default function LocationDetailsPanel({
  location,
  onClose,
}: {
  location: Location;
  onClose: () => void;
}) {
  const userPosition = useMapStore((s) => s.userPosition);
  const route = useMapStore((s) => s.route);
  const routeDestinationId = useMapStore((s) => s.routeDestinationId);
  const compareMode = useMapStore((s) => s.compareMode);
  const startCompare = useMapStore((s) => s.startCompare);
  const exitCompare = useMapStore((s) => s.exitCompare);

  // Distance from user — only when we have a GPS fix
  const distanceMeters = userPosition
    ? haversineDistance(userPosition, location.coords)
    : null;

  const cat = CATEGORY_LIST.find((c) => c.id === location.category);
  const colorVar = cat?.colorVar ?? "--cat-landmark";

  // Show turn-by-turn only when the active route points at THIS location
  const showSteps =
    route &&
    routeDestinationId === location.id &&
    route.steps &&
    route.steps.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Decorative preview thumbnail */}
      <div className="relative">
        <PreviewThumbnail colorVar={colorVar} icon={cat?.icon ?? "MapPin"} />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md border border-border-default bg-bg-overlay/80 text-text-secondary backdrop-blur-md transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pb-8 pt-5">
          {/* Header */}
          <CategoryBadge category={location.category} />
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-text-primary">
            {location.name}
          </h2>
          {location.faculty && (
            <p className="mt-1 text-xs text-text-muted">
              Faculty of {location.faculty}
            </p>
          )}

          {/* Quick stats row */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {distanceMeters !== null && (
              <Pill
                icon={<Footprints className="h-3 w-3" />}
                accent
                label={`${formatDistance(distanceMeters)} away · ~${formatDuration(estimateWalkingSeconds(distanceMeters))}`}
              />
            )}
            {location.hours && (
              <Pill dotColor="var(--success)" label={location.hours} tabular />
            )}
          </div>

          {/* Short description */}
          <p className="mt-5 text-sm leading-relaxed text-text-secondary">
            {location.shortDescription}
          </p>

          {/* Long description */}
          {location.description && (
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              {location.description}
            </p>
          )}

          {/* Aliases */}
          {location.aliases && location.aliases.length > 0 && (
            <div className="mt-5">
              <SectionLabel>Also known as</SectionLabel>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {location.aliases.map((alias) => (
                  <li
                    key={alias}
                    className="rounded-md border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[11px] text-text-secondary"
                  >
                    {alias}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Inside */}
          {location.contains && location.contains.length > 0 && (
            <div className="mt-5">
              <SectionLabel>Inside</SectionLabel>
              <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
                {location.contains.map((thing) => (
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

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <DirectionsButton
              destinationLat={location.coords.lat}
              destinationLng={location.coords.lng}
              destinationId={location.id}
            />
            <FavoriteButton locationId={location.id} />
          </div>

          {/* Compare action — secondary button row */}
          <div className="mt-2">
            {compareMode === "idle" ? (
              <button
                type="button"
                onClick={startCompare}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-bg-elevated/50 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare with another location
              </button>
            ) : compareMode === "picking" ? (
              <div className="flex items-center justify-between gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
                <span>Tap another marker to compare</span>
                <button
                  type="button"
                  onClick={exitCompare}
                  className="text-[10px] underline-offset-2 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={exitCompare}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-bg-elevated/50 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
                End comparison
              </button>
            )}
          </div>

          {/* Turn-by-turn directions, shown when a route is active to here */}
          {showSteps && route && <RouteSteps route={route} />}

          {/* View full details link */}
          <Link
            href={`/location/${location.id}`}
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-accent"
          >
            View full details
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Decorative preview thumbnail — SVG with markers in the category color
// ---------------------------------------------------------------------------

function PreviewThumbnail({
  colorVar,
  icon,
}: {
  colorVar: string;
  icon: string;
}) {
  return (
    <div className="relative h-32 w-full overflow-hidden border-b border-border-default bg-bg-base">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Stylized SVG */}
      <svg
        viewBox="0 0 380 130"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Roads */}
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none">
          <path d="M 0 60 Q 100 50 190 65 T 380 70" />
          <path d="M 60 0 L 80 130" />
          <path d="M 300 0 L 280 130" />
        </g>

        {/* Tiny background markers */}
        <circle cx="50" cy="35" r="3" fill="rgba(255,255,255,0.18)" />
        <circle cx="330" cy="100" r="3" fill="rgba(255,255,255,0.18)" />
        <circle cx="200" cy="20" r="3" fill="rgba(255,255,255,0.12)" />
        <circle cx="120" cy="100" r="3" fill="rgba(255,255,255,0.12)" />

        {/* Featured center marker */}
        <g transform="translate(190, 65)">
          <circle r="22" fill={`var(${colorVar})`} fillOpacity="0.15">
            <animate
              attributeName="r"
              values="20;26;20"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0.2;0.05;0.2"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="14" fill={`var(${colorVar})`} fillOpacity="0.25" />
          <circle
            r="9"
            fill={`var(${colorVar})`}
            stroke="#0a0a0c"
            strokeWidth="2"
          />
        </g>
      </svg>

      {/* Floating icon badge */}
      <div className="absolute bottom-3 left-4 grid h-8 w-8 place-items-center rounded-md border border-border-default bg-bg-overlay/95 backdrop-blur-md">
        <span style={{ color: `var(${colorVar})` }}>
          <CategoryIcon name={icon} className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline subcomponents
// ---------------------------------------------------------------------------

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
      {children}
    </div>
  );
}

function Pill({
  icon,
  label,
  accent = false,
  dotColor,
  tabular = false,
}: {
  icon?: React.ReactNode;
  label: string;
  accent?: boolean;
  dotColor?: string;
  tabular?: boolean;
}) {
  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]
        ${
          accent
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-border-subtle bg-bg-elevated text-text-secondary"
        }
        ${tabular ? "tabular" : ""}
      `}
    >
      {icon}
      {dotColor && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: dotColor }}
        />
      )}
      <span>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Directions button — gated to signed-in users
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

  const [intent, setIntent] = useState(false);

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
              ? "border border-border-default bg-bg-elevated text-text-secondary"
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
// Favorite button — gated to signed-in users
// ---------------------------------------------------------------------------

function FavoriteButton({ locationId }: { locationId: string }) {
  const router = useRouter();
  const isSignedIn = useIsSignedIn();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(locationId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const handleClick = () => {
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
