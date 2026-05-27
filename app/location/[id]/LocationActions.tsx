"use client";

/**
 * NaviLag — Client-side actions for the location detail page
 *
 * Lives as a tiny island inside the otherwise static detail page.
 * Handles:
 *   - Favoriting (localStorage)
 *   - Sharing (Web Share API where available, copy-link fallback)
 *   - Opening in the map at this location
 */

import Link from "next/link";
import { useState } from "react";
import { Star, Share2, Navigation, Check } from "lucide-react";
import { useFavoritesStore } from "@/lib/store/useMapStore";

export default function LocationActions({
  locationId,
  locationName,
  locationLat: _lat,
  locationLng: _lng,
}: {
  locationId: string;
  locationName: string;
  locationLat: number;
  locationLng: number;
}) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(locationId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/location/${locationId}`
        : "";
    const shareData = {
      title: `${locationName} · NaviLag`,
      text: `Find ${locationName} on NaviLag — UNILAG navigation.`,
      url,
    };

    // Use the native share sheet where available (mobile, some desktops)
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard fallback
      }
    }

    // Fallback — copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard blocked — nothing else to do
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {/* Open on map — primary action */}
      <Link
        href={`/map?id=${locationId}`}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
      >
        <Navigation className="h-4 w-4" />
        Open on map
      </Link>

      {/* Favorite toggle */}
      <button
        type="button"
        onClick={() => toggleFavorite(locationId)}
        className={`
          inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors
          ${
            isFavorite
              ? "border-accent bg-bg-elevated text-accent"
              : "border-border-default bg-bg-elevated/60 text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          }
        `}
        aria-label={
          isFavorite ? "Remove from favourites" : "Save to favourites"
        }
        aria-pressed={isFavorite}
      >
        <Star
          className={`h-4 w-4 ${isFavorite ? "fill-accent" : ""}`}
          strokeWidth={isFavorite ? 2 : 2.5}
        />
        {isFavorite ? "Saved" : "Save"}
      </button>

      {/* Share / copy link */}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-bg-elevated/60 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
        aria-label="Share this location"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-accent" />
            Copied
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share
          </>
        )}
      </button>
    </div>
  );
}
