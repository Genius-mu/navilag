/**
 * NaviLag — Custom Leaflet markers
 *
 * Leaflet's default marker (the blue pin) doesn't work well in a
 * dark-themed app and uses image files that break under Next.js
 * bundlers. We use `L.divIcon` to render markers as HTML/SVG, which:
 *   - Themes correctly with our color tokens
 *   - Scales crisply at any zoom
 *   - Stays a single inline string (no extra HTTP requests)
 *
 * This file exports two factory functions, not React components,
 * because Leaflet expects `L.Icon` instances, not JSX.
 */

import L from "leaflet";

// ---------------------------------------------------------------------------
// Location marker (the colored dots for every place on campus)
// ---------------------------------------------------------------------------

type LocationIconOptions = {
  /** Fill color — pass a hex like "#3b9eff". CSS vars don't work here. */
  color: string;
  /** When true, render a larger marker with an outer ring (for selected/destination). */
  active?: boolean;
  /** Total icon size in pixels. Default 28. Active state usually 36. */
  size?: number;
};

/**
 * Build the marker icon. Returns a fresh L.DivIcon each call so we
 * can vary size/active state per marker.
 */
export function createLocationIcon({
  color,
  active = false,
  size = 28,
}: LocationIconOptions): L.DivIcon {
  // SVG sized in viewBox units (40x40), scaled to whatever `size` we pass
  const html = `
    <div class="navilag-marker ${active ? "is-active" : ""}" style="width:${size}px;height:${size}px;">
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        ${
          active
            ? `
          <!-- Outer pulse ring for active markers -->
          <circle cx="20" cy="20" r="18" fill="${color}" opacity="0.18">
            <animate attributeName="r" values="18;20;18" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.18;0.08;0.18" dur="2s" repeatCount="indefinite" />
          </circle>
        `
            : ""
        }
        <!-- Outer halo (subtle) -->
        <circle cx="20" cy="20" r="14" fill="${color}" opacity="0.18" />
        <!-- Solid dot -->
        <circle cx="20" cy="20" r="9" fill="${color}" stroke="#0a0a0c" stroke-width="2.5" />
        <!-- Center highlight -->
        <circle cx="20" cy="20" r="3.5" fill="#0a0a0c" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: "navilag-marker-wrapper",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// ---------------------------------------------------------------------------
// User position marker (the "you are here" dot)
// ---------------------------------------------------------------------------

/**
 * Distinct from location markers — uses the accent color and a
 * pulsing ring to clearly say "this is where the user is."
 */
export function createUserIcon(): L.DivIcon {
  const size = 28;
  const html = `
    <div class="navilag-user-marker" style="width:${size}px;height:${size}px;">
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <!-- Pulsing outer ring -->
        <circle cx="20" cy="20" r="16" fill="#3b9eff" opacity="0.2">
          <animate attributeName="r" values="14;19;14" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <!-- Static halo -->
        <circle cx="20" cy="20" r="11" fill="#3b9eff" opacity="0.3" />
        <!-- Bright solid core, dark outline for contrast on dark map -->
        <circle cx="20" cy="20" r="6.5" fill="#5cb0ff" stroke="#0a0a0c" stroke-width="2.5" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: "navilag-marker-wrapper",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
