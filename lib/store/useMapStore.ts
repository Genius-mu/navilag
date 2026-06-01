/**
 * NaviLag — Global state stores
 *
 * Two stores live here:
 *   - `useMapStore`     — ephemeral UI state (in-memory, resets on refresh)
 *     plus `recentlyViewed` (localStorage) and compare-mode
 *   - `useFavoritesStore` — favorites that adapt to auth:
 *       * signed out: localStorage
 *       * signed in:  Supabase, with one-time merge of localStorage on sign-in
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CategoryId,
  FavoriteRecord,
  LatLng,
  Location,
  Route,
} from "@/lib/data/types";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Map UI state
// ---------------------------------------------------------------------------

type MapState = {
  selectedLocationId: string | null;
  selectLocation: (id: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  activeCategory: CategoryId | null;
  setActiveCategory: (category: CategoryId | null) => void;

  userPosition: LatLng | null;
  setUserPosition: (position: LatLng | null) => void;

  route: Route | null;
  routeDestinationId: string | null;
  setRoute: (route: Route | null, destinationId?: string | null) => void;
  clearRoute: () => void;

  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  isSheetExpanded: boolean;
  setSheetExpanded: (expanded: boolean) => void;

/** Most recently viewed location IDs, newest first. Max 8. */
  recentlyViewed: string[];
  /**
   * Hydrate `recentlyViewed` from localStorage. MUST be called only on the
   * client (e.g. inside a useEffect) — calling during SSR causes a
   * hydration mismatch because the server has no localStorage. Idempotent.
   */
  hydrateRecentlyViewed: () => void;
  pushRecentlyViewed: (locationId: string) => void;
  clearRecentlyViewed: () => void;

  /**
   * Compare mode — the user picks a second location, and we route between
   * the two without needing GPS. Useful for planning walks.
   *
   *  - compareMode: "idle"        nothing happening
   *  - compareMode: "picking"     user clicked "Compare with…" and is now
   *                               selecting the second location
   *  - compareMode: "active"      both locations chosen, route is being
   *                               drawn between them
   */
  compareMode: "idle" | "picking" | "active";
  compareLocationId: string | null;
  startCompare: () => void;
  setCompareLocation: (id: string) => void;
  exitCompare: () => void;
};

export const useMapStore = create<MapState>((set, get) => ({
  selectedLocationId: null,
  selectLocation: (id) => {
    if (id) get().pushRecentlyViewed(id);
    set({
      selectedLocationId: id,
      isSearchOpen: false,
      isSheetExpanded: id !== null,
    });
  },

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeCategory: null,
  setActiveCategory: (category) => set({ activeCategory: category }),

  userPosition: null,
  setUserPosition: (position) => set({ userPosition: position }),

  route: null,
  routeDestinationId: null,
  setRoute: (route, destinationId = null) =>
    set({ route, routeDestinationId: destinationId }),
  clearRoute: () => set({ route: null, routeDestinationId: null }),

  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  isSheetExpanded: false,
  setSheetExpanded: (expanded) => set({ isSheetExpanded: expanded }),

  // Recently viewed — persisted to localStorage manually so it survives reloads.
 // Recently viewed — starts empty on both server and client to avoid
  // hydration mismatches. The map page calls hydrateRecentlyViewed() once
  // mounted, which loads any saved entries from localStorage.
  recentlyViewed: [],
  hydrateRecentlyViewed: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("navilag-recent-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        set({ recentlyViewed: parsed.slice(0, 8) });
      }
    } catch {
      // ignore — leave as []
    }
  },
  pushRecentlyViewed: (locationId) => {
    set((state) => {
      const next = [
        locationId,
        ...state.recentlyViewed.filter((id) => id !== locationId),
      ].slice(0, 8);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("navilag-recent-v1", JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return { recentlyViewed: next };
    });
  },
  clearRecentlyViewed: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("navilag-recent-v1");
      } catch {
        // ignore
      }
    }
    set({ recentlyViewed: [] });
  },

  // Compare mode — two-location routing
  compareMode: "idle",
  compareLocationId: null,
  startCompare: () => set({ compareMode: "picking", compareLocationId: null }),
  setCompareLocation: (id) =>
    set({ compareMode: "active", compareLocationId: id }),
  exitCompare: () =>
    set({
      compareMode: "idle",
      compareLocationId: null,
      route: null,
      routeDestinationId: null,
    }),
}));

// ---------------------------------------------------------------------------
// Favorites store (auth-aware)
// ---------------------------------------------------------------------------

type FavoritesState = {
  favorites: FavoriteRecord[];
  /** True while we're syncing with Supabase. */
  isLoading: boolean;
  /** Whether sign-in is required to use favorites. Set by the page. */
  requiresAuth: boolean;
  setRequiresAuth: (val: boolean) => void;

  /** Toggle a favourite. If signed-in, writes to Supabase; otherwise localStorage. */
  toggleFavorite: (locationId: Location["id"]) => Promise<void>;
  isFavorite: (locationId: Location["id"]) => boolean;
  clearFavorites: () => Promise<void>;

  /** Load favourites for a signed-in user. Called by useFavoritesSync. */
  loadFromSupabase: (userId: string) => Promise<void>;
  /** Merge localStorage favourites into Supabase, then clear local. */
  mergeLocalIntoSupabase: (userId: string) => Promise<void>;
  /** Switch back to localStorage on sign-out. */
  resetToLocal: () => void;
};

/** Internal: read favourites from localStorage. */
function readLocal(): FavoriteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("navilag-favorites-v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.state?.favorites ?? [];
  } catch {
    return [];
  }
}

/** Internal: write favourites to localStorage in the persist-compatible shape. */
function writeLocal(favorites: FavoriteRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "navilag-favorites-v1",
      JSON.stringify({ state: { favorites }, version: 0 }),
    );
  } catch {
    // Storage might be full / blocked — fail quietly
  }
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      requiresAuth: false,
      setRequiresAuth: (val) => set({ requiresAuth: val }),

      toggleFavorite: async (locationId) => {
        const current = get().favorites;
        const existing = current.find((f) => f.locationId === locationId);

        // Build the next list (we'll persist it after the optimistic update)
        const next: FavoriteRecord[] = existing
          ? current.filter((f) => f.locationId !== locationId)
          : [
              ...current,
              {
                locationId,
                savedAt: new Date().toISOString(),
              },
            ];

        // Optimistic update
        set({ favorites: next });

        // Try Supabase if we have a session, otherwise mirror to localStorage
        try {
          const supabase = createClient();
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData.session?.user.id;

          if (userId) {
            if (existing) {
              await supabase
                .from("favorites")
                .delete()
                .eq("user_id", userId)
                .eq("location_id", locationId);
            } else {
              await supabase.from("favorites").insert({
                user_id: userId,
                location_id: locationId,
                saved_at: new Date().toISOString(),
              });
            }
          } else {
            // Signed out — mirror to localStorage
            writeLocal(next);
          }
        } catch (err) {
          console.error("toggleFavorite: persist failed", err);
          // Roll back optimistic update on error
          set({ favorites: current });
        }
      },

      isFavorite: (locationId) =>
        get().favorites.some((f) => f.locationId === locationId),

      clearFavorites: async () => {
        const previous = get().favorites;
        set({ favorites: [] });
        try {
          const supabase = createClient();
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData.session?.user.id;
          if (userId) {
            await supabase.from("favorites").delete().eq("user_id", userId);
          } else {
            writeLocal([]);
          }
        } catch (err) {
          console.error("clearFavorites: failed", err);
          set({ favorites: previous });
        }
      },

      loadFromSupabase: async (userId) => {
        set({ isLoading: true });
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("favorites")
            .select("location_id, saved_at")
            .eq("user_id", userId)
            .order("saved_at", { ascending: false });

          if (error) throw error;

          const records: FavoriteRecord[] = (data ?? []).map((row) => ({
            locationId: row.location_id as string,
            savedAt: row.saved_at as string,
          }));

          set({ favorites: records, isLoading: false });
        } catch (err) {
          console.error("loadFromSupabase: failed", err);
          set({ isLoading: false });
        }
      },

      mergeLocalIntoSupabase: async (userId) => {
        const local = readLocal();
        if (local.length === 0) return;

        try {
          const supabase = createClient();
          // Insert ignoring conflicts (table should have unique
          // constraint on (user_id, location_id))
          await supabase.from("favorites").upsert(
            local.map((f) => ({
              user_id: userId,
              location_id: f.locationId,
              saved_at: f.savedAt,
            })),
            { onConflict: "user_id,location_id" },
          );
          // Clear local store after merge
          writeLocal([]);
          // Reload from Supabase so we have the canonical list
          await get().loadFromSupabase(userId);
        } catch (err) {
          console.error("mergeLocalIntoSupabase: failed", err);
        }
      },

      resetToLocal: () => {
        const local = readLocal();
        set({ favorites: local });
      },
    }),
    {
      name: "navilag-favorites-v1",
      storage: createJSONStorage(() => localStorage),
      // Only persist `favorites`; everything else is runtime
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Selectors / convenience hooks
// ---------------------------------------------------------------------------

export const useSelectedLocationId = () =>
  useMapStore((s) => s.selectedLocationId);

export const useActiveCategory = () => useMapStore((s) => s.activeCategory);

export const useUserPosition = () => useMapStore((s) => s.userPosition);

export const useActiveRoute = () => useMapStore((s) => s.route);

export const useIsSearchOpen = () => useMapStore((s) => s.isSearchOpen);
