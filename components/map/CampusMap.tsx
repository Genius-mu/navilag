"use client";

/**
 * NaviLag — Campus Map
 *
 * The Leaflet wrapper. This component is client-only — it MUST be
 * imported with `dynamic(() => ..., { ssr: false })` from the page,
 * because Leaflet touches `window` at module load.
 *
 * Responsibilities:
 *   - Render the dark-themed tile layer
 *   - Place a marker for every location
 *   - Wire up clicks → store selection
 *   - Re-center smoothly when a location is selected externally
 *     (e.g. via search)
 *   - Render the active route polyline (when set)
 */

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  LOCATIONS,
  CAMPUS_CENTER,
  CAMPUS_DEFAULT_ZOOM,
  getLocationById,
} from "@/lib/data/locations";
import { useMapStore } from "@/lib/store/useMapStore";
import type { Location } from "@/lib/data/types";

import { createLocationIcon, createUserIcon } from "./LocationMarker";
import MapControls from "./MapControls";

// ---------------------------------------------------------------------------
// Tile layer — CartoDB Dark Matter (free, no API key, dark by default)
// ---------------------------------------------------------------------------

const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// ---------------------------------------------------------------------------
// Inner component — uses Leaflet hooks (must live inside MapContainer)
// ---------------------------------------------------------------------------

/**
 * Watches the selected location and pans/zooms the map to it.
 * Living inside <MapContainer> means we can call useMap() to grab
 * the actual Leaflet instance.
 */
function MapController() {
  const map = useMap();
  const selectedLocationId = useMapStore((s) => s.selectedLocationId);
  const route = useMapStore((s) => s.route);

  // Fly to selected location
  useEffect(() => {
    if (!selectedLocationId) return;
    const location = getLocationById(selectedLocationId);
    if (!location) return;

    map.flyTo([location.coords.lat, location.coords.lng], 18, {
      duration: 0.8,
      easeLinearity: 0.25,
    });
  }, [selectedLocationId, map]);

  // Fit the map to the active route
  useEffect(() => {
    if (!route || route.geometry.length < 2) return;

    const bounds = L.latLngBounds(
      route.geometry.map((p) => [p.lat, p.lng] as [number, number]),
    );
    map.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 18,
      duration: 0.8,
    });
  }, [route, map]);

  return null;
}

/**
 * Markers for every location in the dataset.
 * Filtered by activeCategory if set.
 */
function LocationMarkers() {
  const selectLocation = useMapStore((s) => s.selectLocation);
  const selectedLocationId = useMapStore((s) => s.selectedLocationId);
  const activeCategory = useMapStore((s) => s.activeCategory);
  const routeDestinationId = useMapStore((s) => s.routeDestinationId);

  const visible: Location[] = activeCategory
    ? LOCATIONS.filter((loc) => loc.category === activeCategory)
    : LOCATIONS;

  return (
    <>
      {visible.map((location) => {
        const isSelected = location.id === selectedLocationId;
        const isDestination = location.id === routeDestinationId;
        return (
          <Marker
            key={location.id}
            position={[location.coords.lat, location.coords.lng]}
            icon={createLocationIcon({
              color: getCategoryColorRaw(location.category),
              active: isSelected || isDestination,
              size: isSelected || isDestination ? 36 : 28,
            })}
            eventHandlers={{
              click: () => selectLocation(location.id),
            }}
          />
        );
      })}
    </>
  );
}

/**
 * The user's GPS position, if available.
 */
function UserMarker() {
  const userPosition = useMapStore((s) => s.userPosition);
  if (!userPosition) return null;

  return (
    <Marker
      position={[userPosition.lat, userPosition.lng]}
      icon={createUserIcon()}
      interactive={false}
    />
  );
}

/**
 * Active walking route polyline.
 */
function RouteLine() {
  const route = useMapStore((s) => s.route);
  if (!route || route.geometry.length < 2) return null;

  const positions: [number, number][] = route.geometry.map((p) => [
    p.lat,
    p.lng,
  ]);

  return (
    <>
      {/* Outer glow line for visibility on dark map */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#0a0a0c",
          weight: 9,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {/* Inner accent line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#3b9eff",
          weight: 5,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Color helper — pulls the actual hex from a CSS variable.
// L.divIcon serializes to an HTML string, so we need raw hex, not var().
// ---------------------------------------------------------------------------

const CATEGORY_HEX: Record<Location["category"], string> = {
  faculty: "#3b9eff",
  hostel: "#fbbf24",
  library: "#22d3ee",
  cafeteria: "#fb7185",
  admin: "#a78bfa",
  sports: "#34d399",
  medical: "#f87171",
  landmark: "#e4e4e7",
};

function getCategoryColorRaw(category: Location["category"]): string {
  return CATEGORY_HEX[category];
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

export default function CampusMap() {
  return (
    <MapContainer
      center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
      zoom={CAMPUS_DEFAULT_ZOOM}
      // Disable default zoom control — we'll add a custom one
      zoomControl={false}
      // No max zoom limits the user can reach building level
      maxZoom={19}
      minZoom={14}
      // Keep the map within a sensible bounding area around UNILAG
      maxBounds={[
        [6.495, 3.375],
        [6.54, 3.42],
      ]}
      maxBoundsViscosity={0.8}
      // No scroll-wheel zoom flicker on mobile
      zoomSnap={0.5}
      zoomDelta={0.5}
      wheelDebounceTime={40}
      className="h-full w-full"
    >
      <TileLayer
        url={DARK_TILE_URL}
        attribution={TILE_ATTRIBUTION}
        // CartoDB supports retina tiles via {r}
        detectRetina={true}
        // Subdomains spread requests across multiple servers (faster)
        subdomains={["a", "b", "c", "d"]}
      />

      <MapController />
      <LocationMarkers />
      <UserMarker />
      <RouteLine />
      <MapControls />
    </MapContainer>
  );
}
