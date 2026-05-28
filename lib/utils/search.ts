/**
 * NaviLag — Fuzzy search over locations
 *
 * Built on Fuse.js. The Fuse index is created once at module load
 * (not per-query) so subsequent searches are fast.
 *
 * Why Fuse?
 * - Handles typos ("jaa hostel" → "Jaja Hall")
 * - Matches across multiple fields (name, aliases, faculty, contains)
 * - Returns a numeric score we can sort by
 * - Tiny, no backend, runs in the browser
 */

import Fuse from "fuse.js";
import type { IFuseOptions, FuseResult } from "fuse.js";
import { LOCATIONS } from "@/lib/data/locations";
import type { Location, SearchResult } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// Fuse configuration
// ---------------------------------------------------------------------------

/**
 * Field weights — higher = more important.
 * "name" and "aliases" matter most; "contains" (department names) helps
 * but shouldn't outrank an actual location name match.
 */
const FUSE_OPTIONS: IFuseOptions<Location> = {
  keys: [
    { name: "name", weight: 1.0 },
    { name: "aliases", weight: 0.95 },
    { name: "faculty", weight: 0.5 },
    { name: "contains", weight: 0.4 },
    { name: "shortDescription", weight: 0.2 },
  ],
  // Lower threshold = stricter match. 0.4 is a good balance: typos work,
  // but typing "lib" doesn't return "Faculty of Engineering".
  threshold: 0.4,
  // Match anywhere in the string, not just from the start
  ignoreLocation: true,
  // Return the score so we can sort and display match quality
  includeScore: true,
  // Tell us which field matched — useful for highlighting later
  includeMatches: true,
  // Don't require all characters to be in order ("engr" should match "Engineering")
  minMatchCharLength: 2,
};

// Build the index ONCE at module load. This is what makes search fast.
const fuse = new Fuse(LOCATIONS, FUSE_OPTIONS);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search all locations for a query string.
 * Returns up to `limit` results, sorted by Fuse's match score.
 *
 * Empty queries return an empty array — the caller decides what to
 * show when the user hasn't typed yet (popular spots, recents, etc).
 */
export function searchLocations(
  query: string,
  limit: number = 8
): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: FuseResult<Location>[] = fuse.search(trimmed, { limit });

  return results.map((result) => ({
    location: result.item,
    score: result.score ?? 1,
    matchedOn: inferMatchedField(result.matches),
  }));
}

/**
 * Look at Fuse's `matches` array and infer which field was the
 * best match. Used by the result UI to label hits like
 * "matched: Engineering" or "matched: alias".
 */
function inferMatchedField(
  matches: FuseResult<Location>["matches"]
): SearchResult["matchedOn"] {
  if (!matches || matches.length === 0) return "name";

  const key = matches[0]?.key;
  switch (key) {
    case "aliases":
      return "alias";
    case "shortDescription":
      return "description";
    case "contains":
      return "contains";
    case "faculty":
      return "faculty";
    default:
      return "name";
  }
}
