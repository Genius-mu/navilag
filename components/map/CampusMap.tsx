"use client";

/**
 * NaviLag — CampusMap
 *
 * The Leaflet wrapper. This file is only ever rendered on the client
 * (the map page imports it with next/dynamic, ssr:false) because Leaflet
 * touches window directly on import.
 *
 * What lives here:
 *   - MapContainer + dark CartoDB tile layer
 *   - MapController — flies the map to selected locations & fits route bounds
 *   - LocationMarkers — every location as a custom L.divIcon marker
 *   - UserMarker — the GPS dot, when geolocation is granted
 *   - RouteLine — the active walking-route polyline
 *   - MapControls — floating zoom + locate + recenter buttons
 */

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import {
  LOCATIONS,
  CAMPUS_CENTER,
  CAMPUS_DEFAULT_ZOOM,
} from "@/lib/data/locations";
import { getCategoryColorRaw } from "@/lib/data/categories";
import { useMapStore } from "@/lib/store/useMapStore";
import type { Location } from "@/lib/data/types";

import { createLocationIcon, createUserIcon } from "./LocationMarker";
import MapControls from "./MapControls";

// ---------------------------------------------------------------------------
// Tile layer constants
// ---------------------------------------------------------------------------

const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// ---------------------------------------------------------------------------
// MapController — imperative side effects against the Leaflet map instance
// ---------------------------------------------------------------------------

/**
 * Watches selected location + active route and pans the map accordingly.
 * Lives inside <MapContainer> so it can call useMap().
 */
function MapController() {
  const map = useMap();
  const selectedLocationId = useMapStore((s) => s.selectedLocationId);
  const route = useMapStore((s) => s.route);

  // Pan to the selected location
  useEffect(() => {
    if (!selectedLocationId) return;
    const location = LOCATIONS.find((l) => l.id === selectedLocationId);
    if (!location) return;

    map.flyTo([location.coords.lat, location.coords.lng], 17.5, {
      duration: 0.8,
      easeLinearity: 0.25,
    });
  }, [selectedLocationId, map]);

  // Fit the map to the active route, with some padding
  useEffect(() => {
    if (!route || route.geometry.length < 2) return;

    const bounds = L.latLngBounds(
      route.geometry.map((p) => [p.lat, p.lng] as [number, number]),
    );

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 18,
      animate: true,
    });
  }, [route, map]);

  return null;
}

// ---------------------------------------------------------------------------
// LocationMarkers — every campus location, filterable by active category
// ---------------------------------------------------------------------------

function LocationMarkers() {
  const selectLocation = useMapStore((s) => s.selectLocation);
  const selectedLocationId = useMapStore((s) => s.selectedLocationId);
  const activeCategory = useMapStore((s) => s.activeCategory);
  const routeDestinationId = useMapStore((s) => s.routeDestinationId);
  const compareLocationId = useMapStore((s) => s.compareLocationId);
  const compareMode = useMapStore((s) => s.compareMode);
  const setCompareLocation = useMapStore((s) => s.setCompareLocation);

  const visible: Location[] = activeCategory
    ? LOCATIONS.filter((loc) => loc.category === activeCategory)
    : LOCATIONS;

  return (
    <>
      {visible.map((location) => {
        const isSelected = location.id === selectedLocationId;
        const isDestination = location.id === routeDestinationId;
        const isCompare = location.id === compareLocationId;
        return (
          <Marker
            key={location.id}
            position={[location.coords.lat, location.coords.lng]}
            icon={createLocationIcon({
              color: getCategoryColorRaw(location.category),
              active: isSelected || isDestination || isCompare,
              size: isSelected || isDestination || isCompare ? 36 : 28,
            })}
            eventHandlers={{
              click: () => {
                // If in compare-picking mode and this isn't the already-selected
                // primary, store this as the comparison target instead of
                // replacing the selection.
                if (
                  compareMode === "picking" &&
                  location.id !== selectedLocationId
                ) {
                  setCompareLocation(location.id);
                  return;
                }
                selectLocation(location.id);
              },
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
          color: "#000000",
          weight: 10,
          opacity: 0.5,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {/* Inner colored line */}
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
// Default export — the map itself
// ---------------------------------------------------------------------------

export default function CampusMap() {
  // Use useMemo so we don't re-create handlers on every render
  const initialView = useMemo(
    () =>
      ({
        center: [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng] as [number, number],
        zoom: CAMPUS_DEFAULT_ZOOM,
      }) as const,
    [],
  );

  return (
    <MapContainer
      center={initialView.center}
      zoom={initialView.zoom}
      // Disable default zoom control — we'll add a custom one
      zoomControl={false}
      // CartoDB Dark Matter tiles max out at zoom 19, but quality drops
      // noticeably past 18. Cap here so users never see broken/black tiles.
      maxZoom={18}
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
        // Tell Leaflet not to request tiles beyond what CartoDB actually
        // serves — past zoom 18 the provider returns empty/black tiles.
        maxNativeZoom={18}
        maxZoom={18}
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
