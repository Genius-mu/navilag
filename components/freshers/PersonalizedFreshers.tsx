"use client";

/**
 * NaviLag — Personalized Freshers Section
 *
 * Client island for the freshers page. Reads the signed-in user's
 * faculty (from useUserProfile) and renders:
 *
 *   - <FacultyPicker /> at the top so users can set/change faculty
 *   - "Your faculty" hero card with name + a one-click "Open on map" link
 *   - "Near your faculty" grid of nearby essentials (hostels/library/food
 *     within 600m of the faculty building, sorted nearest-first)
 *
 * If no faculty is set, only the picker shows. The page's static
 * "everyone-needs-these" section continues below regardless.
 */

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
  Dumbbell,
  Stethoscope,
  MapPin,
  Footprints,
  Sparkles,
} from "lucide-react";

import { useIsSignedIn } from "@/lib/store/useAuthStore";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import {
  getFacultyBuilding,
  getLocationsNearFaculty,
} from "@/lib/data/locations";
import { CATEGORY_LIST } from "@/lib/data/categories";
import { formatDistance } from "@/lib/utils/distance";

import FacultyPicker from "./FacultyPicker";

const ICONS = {
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
  Dumbbell,
  Stethoscope,
  MapPin,
} as const;

function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? MapPin;
  return <Icon className={className} />;
}

export default function PersonalizedFreshers() {
  const isSignedIn = useIsSignedIn();
  const { profile } = useUserProfile();

  const facultyBuilding = profile.faculty
    ? getFacultyBuilding(profile.faculty)
    : null;
  const nearby = profile.faculty
    ? getLocationsNearFaculty(profile.faculty, 600).slice(0, 6)
    : [];

  return (
    <section className="relative z-10 border-t border-border-subtle px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-3xl">
        <SectionLabel>
          {isSignedIn ? "Made for you" : "Sign in to personalize"}
        </SectionLabel>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {isSignedIn && profile.faculty
            ? `Your week one, around ${profile.faculty}.`
            : "Tell us your faculty."}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
          {isSignedIn && profile.faculty
            ? "We've pulled the essentials within walking distance of your faculty building — your day-to-day will start here."
            : "Pick your faculty once and we'll surface the buildings, hostels, and food spots actually near you — instead of a generic list."}
        </p>

        {/* The picker is always visible (in whichever state) */}
        <div className="mt-8">
          <FacultyPicker />
        </div>

        {/* If we have a faculty pick, render the personalized cards */}
        {isSignedIn && profile.faculty && facultyBuilding && (
          <>
            {/* Faculty hero card */}
            <div className="mt-8 overflow-hidden rounded-xl border border-border-default bg-bg-elevated/40">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border-default"
                    style={{
                      color: "var(--cat-faculty)",
                      backgroundColor:
                        "color-mix(in srgb, var(--cat-faculty) 14%, transparent)",
                    }}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
                      Your faculty
                    </div>
                    <div className="mt-0.5 truncate font-display text-lg font-semibold tracking-tight text-text-primary">
                      {facultyBuilding.name}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-text-secondary">
                      {facultyBuilding.shortDescription}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/map?id=${facultyBuilding.id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
                >
                  Open on map
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Nearby essentials */}
            {nearby.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center gap-1.5">
                  <Footprints className="h-3.5 w-3.5 text-accent" />
                  <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
                    Within a short walk
                  </span>
                </div>

                <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle sm:grid-cols-2">
                  {nearby.map((loc) => {
                    const cat = CATEGORY_LIST.find((c) => c.id === loc.category);
                    return (
                      <li key={loc.id}>
                        <Link
                          href={`/map?id=${loc.id}`}
                          className="group flex items-start gap-3 bg-bg-base p-4 transition-colors hover:bg-bg-elevated/50"
                        >
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border-default"
                            style={{
                              color: cat
                                ? `var(${cat.colorVar})`
                                : "var(--cat-landmark)",
                              backgroundColor: cat
                                ? `color-mix(in srgb, var(${cat.colorVar}) 14%, transparent)`
                                : undefined,
                            }}
                          >
                            <CategoryIcon
                              name={cat?.icon ?? "MapPin"}
                              className="h-4 w-4"
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-text-primary">
                                {loc.name}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                              {loc.shortDescription}
                            </p>
                            <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-border-subtle bg-bg-elevated px-1.5 py-px text-[10px] tabular text-text-secondary">
                              <Footprints className="h-2.5 w-2.5" />
                              {formatDistance(loc.distanceMeters)}
                            </div>
                          </div>
                          <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Encouraging line for signed-in users who haven't picked yet */}
        {isSignedIn && !profile.faculty && (
          <div className="mt-6 flex items-start gap-2 text-xs text-text-muted">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              Your pick is saved to your account, not your browser — it follows
              you to any device.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1 w-1 rounded-full bg-accent" />
      <span className="font-display text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
        {children}
      </span>
    </div>
  );
}