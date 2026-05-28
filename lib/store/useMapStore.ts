/**
 * NaviLag — Global state stores
 *
 * Two stores live here:
 *   - `useMapStore`     — ephemeral UI state (in-memory, resets on refresh)
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
// Map UI state (unchanged from before)
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
};

export const useMapStore = create<MapState>((set) => ({
  selectedLocationId: null,
  selectLocation: (id) =>
    set({
      selectedLocationId: id,
      isSearchOpen: false,
      isSheetExpanded: id !== null,
    }),

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

      isFavorite: (locationId) =>
        get().favorites.some((f) => f.locationId === locationId),

      toggleFavorite: async (locationId) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        const current = get().favorites;
        const existing = current.find((f) => f.locationId === locationId);

        if (user) {
          // Signed in — write to Supabase, mirror to local state
          if (existing) {
            await supabase
              .from("favorites")
              .delete()
              .eq("user_id", user.id)
              .eq("location_id", locationId);
            set({
              favorites: current.filter((f) => f.locationId !== locationId),
            });
          } else {
            const savedAt = new Date().toISOString();
            await supabase.from("favorites").insert({
              user_id: user.id,
              location_id: locationId,
              saved_at: savedAt,
            });
            set({
              favorites: [{ locationId, savedAt }, ...current],
            });
          }
          return;
        }

        // Signed out — local only
        const next = existing
          ? current.filter((f) => f.locationId !== locationId)
          : [{ locationId, savedAt: new Date().toISOString() }, ...current];
        set({ favorites: next });
      },

      clearFavorites: async () => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", userData.user.id);
        }
        set({ favorites: [] });
      },

      loadFromSupabase: async (userId) => {
        set({ isLoading: true });
        const supabase = createClient();
        const { data, error } = await supabase
          .from("favorites")
          .select("location_id, saved_at")
          .eq("user_id", userId)
          .order("saved_at", { ascending: false });

        if (!error && data) {
          set({
            favorites: data.map((row) => ({
              locationId: row.location_id,
              savedAt: row.saved_at,
            })),
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      },

      mergeLocalIntoSupabase: async (userId) => {
        const local = readLocal();
        if (local.length === 0) {
          await get().loadFromSupabase(userId);
          return;
        }

        const supabase = createClient();
        // Insert with upsert to avoid dup conflicts on (user_id, location_id)
        const rows = local.map((f) => ({
          user_id: userId,
          location_id: f.locationId,
          saved_at: f.savedAt,
        }));
        await supabase
          .from("favorites")
          .upsert(rows, { onConflict: "user_id,location_id" });

        // Clear local — Supabase is now the source of truth
        writeLocal([]);

        // Reload to reflect merged state
        await get().loadFromSupabase(userId);
      },

      resetToLocal: () => {
        // Reload favorites from localStorage (which persist middleware
        // will have hydrated on initial mount)
        set({ favorites: readLocal() });
      },
    }),
    {
      name: "navilag-favorites-v1",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Only persist `favorites` to localStorage (not the auth flags)
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Slice selectors
// ---------------------------------------------------------------------------

export const useSelectedLocationId = () =>
  useMapStore((s) => s.selectedLocationId);

export const useSearchQuery = () => useMapStore((s) => s.searchQuery);
export const useActiveCategory = () => useMapStore((s) => s.activeCategory);
export const useRoute = () => useMapStore((s) => s.route);
export const useUserPosition = () => useMapStore((s) => s.userPosition);
