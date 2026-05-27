"use client";

/**
 * NaviLag — Geolocation hook
 *
 * Wraps `navigator.geolocation` into a React hook that returns
 * everything the UI needs in one shot:
 *   - position (or null)
 *   - permission state
 *   - error (with friendly message)
 *   - loading flag
 *   - request() and stop() actions
 *
 * Two modes:
 *   - One-shot: call `request()` once, get a single position fix
 *   - Watch: pass `watch: true` to subscribe to live updates
 *
 * The hook also syncs the position into the global map store so
 * components that just want to read the latest position can use
 * `useUserPosition()` without instantiating this hook themselves.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useMapStore } from "@/lib/store/useMapStore";
import type { LatLng } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GeoPermission = "prompt" | "granted" | "denied" | "unsupported";

export type GeoError = {
  code: "denied" | "unavailable" | "timeout" | "unsupported";
  message: string;
};

export type UseGeolocationOptions = {
  /** Continuously watch position updates. Default false (one-shot). */
  watch?: boolean;
  /** Force high-accuracy GPS instead of WiFi/IP triangulation. Default true. */
  highAccuracy?: boolean;
  /** Maximum age of a cached fix the browser may return, in ms. Default 10s. */
  maximumAge?: number;
  /** Max time we'll wait for a fix before giving up, in ms. Default 15s. */
  timeout?: number;
};

export type UseGeolocationReturn = {
  position: LatLng | null;
  /** Accuracy radius in meters (smaller = better fix). */
  accuracy: number | null;
  permission: GeoPermission;
  error: GeoError | null;
  isLoading: boolean;
  /** Ask the browser for location. Triggers the permission prompt if needed. */
  request: () => void;
  /** Stop watching (no-op in one-shot mode). */
  stop: () => void;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGeolocation(
  options: UseGeolocationOptions = {},
): UseGeolocationReturn {
  const {
    watch = false,
    highAccuracy = true,
    maximumAge = 10_000,
    timeout = 15_000,
  } = options;

  const setUserPosition = useMapStore((s) => s.setUserPosition);

  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [permission, setPermission] = useState<GeoPermission>("prompt");
  const [error, setError] = useState<GeoError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  // ---- Detect environment & probe permission state on mount ----------
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setPermission("unsupported");
      return;
    }

    // The Permissions API isn't supported everywhere, but where it is,
    // we can show the right UI without prompting the user yet.
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          setPermission(status.state as GeoPermission);
          status.onchange = () => setPermission(status.state as GeoPermission);
        })
        .catch(() => {
          // Some browsers throw on unsupported names — just leave as "prompt"
        });
    }
  }, []);

  // ---- Map a GeolocationPositionError code → our friendly shape ------
  const buildError = (code: number, defaultMessage: string): GeoError => {
    switch (code) {
      case 1:
        return {
          code: "denied",
          message:
            "Location permission denied. Enable it in your browser settings.",
        };
      case 2:
        return {
          code: "unavailable",
          message: "Couldn't get your location. Try again or check your GPS.",
        };
      case 3:
        return {
          code: "timeout",
          message: "Location lookup timed out. Try again with better signal.",
        };
      default:
        return { code: "unavailable", message: defaultMessage };
    }
  };

  // ---- Shared success handler --------------------------------------
  const handleSuccess = useCallback(
    (pos: GeolocationPosition) => {
      const next: LatLng = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setPosition(next);
      setAccuracy(pos.coords.accuracy);
      setUserPosition(next);
      setError(null);
      setIsLoading(false);
      setPermission("granted");
    },
    [setUserPosition],
  );

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(buildError(err.code, err.message));
    setIsLoading(false);
    if (err.code === 1) setPermission("denied");
  }, []);

  // ---- Request a fix ------------------------------------------------
  const request = useCallback(() => {
    if (permission === "unsupported") {
      setError({
        code: "unsupported",
        message: "Your browser doesn't support location services.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const opts: PositionOptions = {
      enableHighAccuracy: highAccuracy,
      maximumAge,
      timeout,
    };

    if (watch) {
      // Clear any prior watcher before starting a new one
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        opts,
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        opts,
      );
    }
  }, [
    permission,
    watch,
    highAccuracy,
    maximumAge,
    timeout,
    handleSuccess,
    handleError,
  ]);

  // ---- Stop a watcher -----------------------------------------------
  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // ---- Cleanup on unmount -------------------------------------------
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    accuracy,
    permission,
    error,
    isLoading,
    request,
    stop,
  };
}
