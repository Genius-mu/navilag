"use client";

/**
 * NaviLag — Map controls
 *
 * Floating control stack on the right edge of the map. Replaces
 * Leaflet's default zoom control with a styled version, and adds:
 *   - Recenter (fly back to campus center)
 *   - Locate me (request GPS, fly to user position)
 *
 * Must be rendered as a CHILD of <MapContainer> so it can grab the
 * Leaflet map instance via useMap().
 */

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import {
  Plus,
  Minus,
  Locate,
  LocateFixed,
  Crosshair,
  Loader2,
} from "lucide-react";

import { CAMPUS_CENTER, CAMPUS_DEFAULT_ZOOM } from "@/lib/data/locations";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useMapStore } from "@/lib/store/useMapStore";

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MapControls() {
  const map = useMap();
  const userPosition = useMapStore((s) => s.userPosition);
  const geo = useGeolocation();
  const [pendingLocate, setPendingLocate] = useState(false);

  // ---- Zoom in/out ---------------------------------------------------
  const handleZoomIn = () => {
    map.zoomIn(1, { animate: true });
  };
  const handleZoomOut = () => {
    map.zoomOut(1, { animate: true });
  };

  // ---- Recenter to campus -------------------------------------------
  const handleRecenter = () => {
    map.flyTo([CAMPUS_CENTER.lat, CAMPUS_CENTER.lng], CAMPUS_DEFAULT_ZOOM, {
      duration: 0.7,
      easeLinearity: 0.25,
    });
  };

  // ---- Locate me ----------------------------------------------------
  const handleLocate = () => {
    if (userPosition) {
      // Already have a fix — fly there immediately
      map.flyTo([userPosition.lat, userPosition.lng], 18, {
        duration: 0.7,
        easeLinearity: 0.25,
      });
      return;
    }

    // No fix yet — request one and remember we should fly to it
    // when it arrives.
    setPendingLocate(true);
    geo.request();
  };

  // When the position arrives after a locate request, fly there
  useEffect(() => {
    if (pendingLocate && geo.position) {
      map.flyTo([geo.position.lat, geo.position.lng], 18, {
        duration: 0.7,
        easeLinearity: 0.25,
      });
      setPendingLocate(false);
    }
  }, [pendingLocate, geo.position, map]);

  // Cancel pending locate on permission denial / error
  useEffect(() => {
    if (geo.error || geo.permission === "denied") {
      setPendingLocate(false);
    }
  }, [geo.error, geo.permission]);

  // ---- Render -------------------------------------------------------
  return (
    <div className="pointer-events-none absolute right-3 top-1/2 z-[1000] -translate-y-1/2 md:right-5">
      <div className="pointer-events-auto flex flex-col gap-2">
        {/* Zoom group */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-border-default bg-bg-overlay/90 shadow-lg backdrop-blur-md">
          <ControlButton onClick={handleZoomIn} ariaLabel="Zoom in">
            <Plus className="h-4 w-4" />
          </ControlButton>
          <div className="h-px bg-border-subtle" />
          <ControlButton onClick={handleZoomOut} ariaLabel="Zoom out">
            <Minus className="h-4 w-4" />
          </ControlButton>
        </div>

        {/* Locate group */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-border-default bg-bg-overlay/90 shadow-lg backdrop-blur-md">
          <ControlButton
            onClick={handleLocate}
            ariaLabel={userPosition ? "Re-center on me" : "Locate me"}
            highlight={!!userPosition}
            disabled={geo.permission === "unsupported"}
          >
            {geo.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            ) : userPosition ? (
              <LocateFixed
                className="h-4 w-4"
                style={{ color: "var(--accent)" }}
              />
            ) : (
              <Locate className="h-4 w-4" />
            )}
          </ControlButton>
          <div className="h-px bg-border-subtle" />
          <ControlButton onClick={handleRecenter} ariaLabel="Recenter map">
            <Crosshair className="h-4 w-4" />
          </ControlButton>
        </div>

        {/* Subtle error indicator — only shown when geolocation fails */}
        {geo.error && (
          <div className="max-w-[180px] rounded-md border border-danger/40 bg-bg-overlay/95 px-2.5 py-1.5 text-[10px] leading-snug text-danger shadow-md backdrop-blur-md">
            {geo.error.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable button
// ---------------------------------------------------------------------------

function ControlButton({
  onClick,
  ariaLabel,
  children,
  highlight = false,
  disabled = false,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  highlight?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      className={`
        grid h-10 w-10 place-items-center transition-colors
        ${
          highlight
            ? "text-accent hover:bg-bg-hover"
            : "text-text-primary hover:bg-bg-hover disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent"
        }
      `}
    >
      {children}
    </button>
  );
}
