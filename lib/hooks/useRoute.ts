"use client";

/**
 * NaviLag — Route hook (OSRM walking directions)
 *
 * Fetches a walking route between two LatLng points and stores it
 * in the global map store, where <RouteLine> reads it and draws
 * the polyline on the map.
 *
 * Uses the free public OSRM demo server. For a real campus deployment
 * you'd self-host or switch providers — but it's rate-limited to ~1 req/s
 * which is plenty for one user clicking Directions.
 *
 * OSRM quirks worth knowing about:
 *   - Coordinates are passed as lng,lat (NOT lat,lng — easy to swap)
 *   - The geometry is encoded as a polyline by default; we ask for
 *     GeoJSON instead to skip the decoding step.
 *   - "Walking" profile is at /route/v1/foot/...
 *   - Now requests steps=true and flattens legs[].steps into our
 *     RouteStep[] shape for turn-by-turn UI.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useMapStore } from "@/lib/store/useMapStore";
import type { LatLng, Route } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RouteError = {
  code: "network" | "no-route" | "invalid" | "rate-limited";
  message: string;
};

export type UseRouteReturn = {
  route: Route | null;
  isLoading: boolean;
  error: RouteError | null;
  /** Fetch a route from `from` to `to`. Updates the store on success. */
  fetchRoute: (
    from: LatLng,
    to: LatLng,
    destinationId?: string,
  ) => Promise<void>;
  /** Clear the route from store and local state. */
  clearRoute: () => void;
};

// ---------------------------------------------------------------------------
// OSRM endpoint
// ---------------------------------------------------------------------------

const OSRM_BASE = "https://router.project-osrm.org";

/**
 * Build the OSRM URL for a walking route between two points.
 * OSRM expects coords as `lng,lat;lng,lat`.
 */
function buildOsrmUrl(from: LatLng, to: LatLng): string {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const params = new URLSearchParams({
    overview: "full", // include the full geometry, not simplified
    geometries: "geojson", // return geometry as GeoJSON, easier to consume
    steps: "true", // request turn-by-turn maneuvers
  });
  return `${OSRM_BASE}/route/v1/foot/${coords}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// OSRM response shape (only the fields we touch)
// ---------------------------------------------------------------------------

type OsrmStep = {
  distance: number;
  duration: number;
  maneuver: {
    location: [number, number]; // [lng, lat]
    type?: string;
    modifier?: string;
  };
  name?: string;
};

type OsrmLeg = {
  steps: OsrmStep[];
};

type OsrmResponse = {
  code: string;
  routes: Array<{
    distance: number; // meters
    duration: number; // seconds
    geometry: {
      type: "LineString";
      coordinates: [number, number][]; // [lng, lat] pairs
    };
    legs: OsrmLeg[];
  }>;
  message?: string;
};

// Pretty-print a turn-by-turn maneuver. OSRM ships raw maneuver types
// like "turn"/"depart"/"arrive" plus modifiers like "left"/"right". We
// stitch them into a single human-readable string.
function formatManeuver(step: OsrmStep): string {
  const type = step.maneuver.type ?? "continue";
  const modifier = step.maneuver.modifier;
  const street = step.name && step.name.trim() ? step.name : "the path";

  switch (type) {
    case "depart":
      return `Head out along ${street}`;
    case "arrive":
      return "Arrive at your destination";
    case "turn":
      return `Turn ${modifier ?? ""} onto ${street}`.replace(/\s+/g, " ");
    case "new name":
      return `Continue onto ${street}`;
    case "merge":
      return `Merge ${modifier ?? ""} onto ${street}`.replace(/\s+/g, " ");
    case "roundabout":
    case "rotary":
      return `Take the roundabout onto ${street}`;
    case "fork":
      return `Keep ${modifier ?? "ahead"} at the fork`;
    case "end of road":
      return `At the end of the road, turn ${modifier ?? ""}`.trim();
    case "continue":
      return `Continue ${modifier ?? "straight"} on ${street}`.replace(
        /\s+/g,
        " ",
      );
    default:
      return `Continue on ${street}`;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRoute(): UseRouteReturn {
  const storeRoute = useMapStore((s) => s.route);
  const setRoute = useMapStore((s) => s.setRoute);
  const clearStoreRoute = useMapStore((s) => s.clearRoute);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RouteError | null>(null);

  // AbortController so a new request cancels a pending one
  const controllerRef = useRef<AbortController | null>(null);

  const fetchRoute = useCallback(
    async (from: LatLng, to: LatLng, destinationId?: string) => {
      // Cancel any in-flight request
      if (controllerRef.current) controllerRef.current.abort();
      controllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(buildOsrmUrl(from, to), {
          signal: controllerRef.current.signal,
        });

        if (res.status === 429) {
          throw {
            code: "rate-limited",
            message: "Too many requests — wait a moment and try again.",
          };
        }
        if (!res.ok) {
          throw {
            code: "network",
            message: `Routing server returned ${res.status}.`,
          };
        }

        const data: OsrmResponse = await res.json();

        if (data.code !== "Ok" || data.routes.length === 0) {
          throw {
            code: "no-route",
            message:
              data.message ?? "No walking route found between these points.",
          };
        }

        const first = data.routes[0];

        // Convert OSRM's [lng, lat] tuples to our { lat, lng } shape
        const geometry: LatLng[] = first.geometry.coordinates.map(
          ([lng, lat]) => ({ lat, lng }),
        );

        // Flatten OSRM legs → our flat steps list. For point-to-point
        // routes there's only one leg, but legs[] is the generic shape.
        const steps = first.legs.flatMap((leg) =>
          leg.steps.map((step) => {
            const [lng, lat] = step.maneuver.location;
            return {
              instruction: formatManeuver(step),
              distanceMeters: step.distance,
              durationSeconds: step.duration,
              coords: { lat, lng },
            };
          }),
        );

        const route: Route = {
          geometry,
          distanceMeters: first.distance,
          durationSeconds: first.duration,
          steps,
        };

        setRoute(route, destinationId ?? null);
      } catch (err: unknown) {
        // AbortError is expected when a newer request supersedes this one
        if (err instanceof DOMException && err.name === "AbortError") return;

        // Errors thrown from our checks are already-typed RouteError objects
        if (typeof err === "object" && err !== null && "code" in err) {
          setError(err as RouteError);
        } else {
          setError({
            code: "network",
            message:
              "Couldn't reach the routing service. Check your connection.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [setRoute],
  );

  const clearRoute = useCallback(() => {
    if (controllerRef.current) controllerRef.current.abort();
    clearStoreRoute();
    setError(null);
    setIsLoading(false);
  }, [clearStoreRoute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  return {
    route: storeRoute,
    isLoading,
    error,
    fetchRoute,
    clearRoute,
  };
}
