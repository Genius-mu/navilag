/**
 * NaviLag — Core data types
 *
 * Every location, category, and route reference in the app flows through
 * the types defined here. If you change a shape in this file, expect
 * TypeScript to tell you everywhere else that needs to update — that's
 * the point.
 */

// ---------------------------------------------------------------------------
// Coordinates
// ---------------------------------------------------------------------------

/**
 * A latitude/longitude pair.
 * Leaflet uses [lat, lng] tuples, OSRM uses [lng, lat] — we keep our
 * canonical shape as { lat, lng } and convert at the boundary.
 */
export type LatLng = {
  lat: number;
  lng: number;
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/**
 * The eight top-level categories on the map. The string values are used
 * as keys in URLs and localStorage, so don't rename them lightly.
 */
export type CategoryId =
  | "faculty"
  | "hostel"
  | "library"
  | "cafeteria"
  | "admin"
  | "sports"
  | "medical"
  | "landmark";

/**
 * Display metadata for a category — what the UI shows.
 * The actual list lives in `lib/data/categories.ts`.
 */
export type Category = {
  id: CategoryId;
  label: string; // "Faculties"
  singular: string; // "Faculty"
  /** CSS variable name, e.g. "--cat-faculty". Lets us color markers from tokens. */
  colorVar: string;
  /** Lucide icon name as a string — we resolve it in the component. */
  icon: string;
  /** Short helper text shown on chips and category screens. */
  description: string;
};

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

/**
 * A single place on campus.
 *
 * `id` is a stable slug we control (e.g. "faculty-of-science") — used in
 * URLs, favorites, and search results. Never use array index.
 */
export type Location = {
  id: string;
  name: string;
  /** What people actually call it. Searched alongside `name`. */
  aliases?: string[];
  category: CategoryId;
  coords: LatLng;
  /** One-line description for cards and popups. */
  shortDescription: string;
  /** Multi-paragraph description for the detail page. Optional. */
  description?: string;
  /** Path under /public, e.g. "/locations/faculty-of-science.jpg". Optional. */
  image?: string;
  /** Free-form, e.g. "Mon–Fri · 8:00–18:00". */
  hours?: string;
  /** Faculty this place belongs to, if applicable. */
  faculty?: string;
  /** Departments, halls, or notable rooms inside. */
  contains?: string[];
  /** IDs of nearby places — useful on the detail page. */
  nearby?: string[];
  /** Surfaced on the freshers page when true. */
  freshersPick?: boolean;
};

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * A search hit, returned by `lib/utils/search.ts`.
 * `score` is Fuse.js's match quality, 0 = perfect, 1 = bad.
 */
export type SearchResult = {
  location: Location;
  score: number;
  /** Which field actually matched — useful for highlighting later. */
  matchedOn: "name" | "alias" | "description" | "contains" | "faculty";
};

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

/**
 * A walking route between two points, as returned by OSRM.
 * We flatten OSRM's response into something the UI can consume directly.
 */
export type Route = {
  /** Decoded polyline as { lat, lng } points. Drawn by Leaflet. */
  geometry: LatLng[];
  /** Meters. We format to "240 m" / "1.2 km" at display time. */
  distanceMeters: number;
  /** Seconds. Walking time, OSRM's estimate. */
  durationSeconds: number;
  /** Optional turn-by-turn steps. Phase 2 — keep field reserved. */
  steps?: RouteStep[];
};

export type RouteStep = {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  coords: LatLng;
};

// ---------------------------------------------------------------------------
// User-side state (Zustand, localStorage)
// ---------------------------------------------------------------------------

/**
 * Persisted favourites. We only store the location id — never the whole
 * object — so renames in `locations.ts` don't break saved data.
 */
export type FavoriteRecord = {
  locationId: Location["id"];
  /** ISO timestamp. Used for sorting "Recently saved". */
  savedAt: string;
};

/**
 * Active route reference held in the store.
 * `from` is null when the user hasn't enabled geolocation yet.
 */
export type RouteRequest = {
  from: LatLng | null;
  toLocationId: Location["id"];
};
