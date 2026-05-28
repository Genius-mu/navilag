/**
 * NaviLag — Distance and formatting utilities
 *
 * Pure functions, no dependencies. Used by:
 *   - The search results (showing "200 m away")
 *   - The route HUD (distance + ETA)
 *   - The nearby section on the detail page
 */

import type { LatLng } from "@/lib/data/types";

// Earth's mean radius in meters
const EARTH_RADIUS_M = 6_371_000;

// Average walking speed in meters per second (~5 km/h)
const WALKING_SPEED_MPS = 1.4;

/**
 * Haversine distance between two lat/lng points, in meters.
 *
 * Accurate to within ~0.5% for short distances (under a few km), which
 * is plenty for a campus map. Fast — pure math, no API calls.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Format a distance in meters as "240 m" or "1.2 km".
 * The cutoff is 1000m — below that we show meters, above we show km.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    // Round to nearest 10m for short distances
    return `${Math.round(meters / 10) * 10} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Estimate walking duration in seconds, assuming an average pace.
 * Used as a fallback when we don't have OSRM's actual duration.
 */
export function estimateWalkingSeconds(meters: number): number {
  return meters / WALKING_SPEED_MPS;
}

/**
 * Format a duration in seconds as "3 min" or "1 hr 12 min".
 * Always rounds to the nearest minute for readability.
 */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

/**
 * Combined "240 m · 3 min" formatter for the HUD and result cards.
 */
export function formatDistanceAndDuration(
  distanceMeters: number,
  durationSeconds?: number,
): string {
  const distance = formatDistance(distanceMeters);
  const duration = formatDuration(
    durationSeconds ?? estimateWalkingSeconds(distanceMeters),
  );
  return `${distance} · ${duration}`;
}
