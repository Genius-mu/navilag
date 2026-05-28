/**
 * NaviLag — Location detail page
 *
 * Deep-linkable page for every campus location.
 * URL pattern: /location/{slug} (e.g. /location/faculty-of-engineering)
 *
 * Server component — pre-rendered at build time via generateStaticParams().
 * Every location in lib/data/locations.ts becomes a static HTML page,
 * which means:
 *   - Instant load (no client-side fetch)
 *   - Works without JavaScript for the initial paint
 *   - SEO-friendly metadata per page
 *
 * For interactivity (favorite button, navigate-to-map), we mount a small
 * client component island.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
  Dumbbell,
  Stethoscope,
  Navigation,
  Share2,
} from "lucide-react";

import { LOCATIONS, getLocationById } from "@/lib/data/locations";
import { CATEGORIES } from "@/lib/data/categories";
import type { CategoryId } from "@/lib/data/types";

import LocationActions from "./LocationActions";

// ---------------------------------------------------------------------------
// Static params — Next.js builds every location page at build time
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return LOCATIONS.map((loc) => ({ id: loc.id }));
}

// ---------------------------------------------------------------------------
// Per-page metadata — proper <title>, OG tags, etc.
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const location = getLocationById(id);

  if (!location) {
    return {
      title: "Location not found · NaviLag",
    };
  }

  return {
    title: `${location.name} · NaviLag`,
    description: location.shortDescription,
    openGraph: {
      title: `${location.name} · UNILAG`,
      description: location.shortDescription,
      type: "website",
    },
  };
}

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = getLocationById(id);

  if (!location) {
    notFound();
  }

  const category = CATEGORIES[location.category];

  // Resolve nearby locations (filter out unknown ids and self)
  const nearby = (location.nearby ?? [])
    .map((nid) => getLocationById(nid))
    .filter(
      (loc): loc is NonNullable<typeof loc> =>
        !!loc && loc.id !== location.id
    );

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Subtle backdrop */}
      <BackdropGrid />

      {/* ============ Header ============ */}
      <header className="relative z-10 flex items-center justify-between gap-3 px-6 py-5 md:px-10">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-md border border-border-default bg-bg-elevated/60 px-3 py-1.5 text-sm font-medium text-text-primary backdrop-blur-sm transition-colors hover:bg-bg-elevated"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to map</span>
          <span className="sm:hidden">Map</span>
        </Link>

        <Link
          href="/"
          className="font-display text-sm font-semibold tracking-tight text-text-secondary transition-colors hover:text-text-primary"
        >
          NaviLag
        </Link>
      </header>

      {/* ============ Hero ============ */}
      <section className="relative z-10 px-6 pt-10 pb-12 md:px-10 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <CategoryBadge category={location.category} />

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.0] tracking-[-0.02em] text-text-primary md:text-6xl">
            {location.name}
          </h1>

          {location.faculty && (
            <p className="mt-3 font-display text-sm font-medium uppercase tracking-[0.16em] text-text-muted">
              Faculty of {location.faculty}
            </p>
          )}

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            {location.shortDescription}
          </p>

          {/* Coordinates pill */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-border-subtle bg-bg-elevated/60 px-2.5 py-1 text-xs text-text-muted backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span className="tabular">
              {location.coords.lat.toFixed(4)}, {location.coords.lng.toFixed(4)}
            </span>
          </div>

          {/* Client-side action buttons (favorite, navigate, share) */}
          <div className="mt-8">
            <LocationActions
              locationId={location.id}
              locationName={location.name}
              locationLat={location.coords.lat}
              locationLng={location.coords.lng}
            />
          </div>
        </div>
      </section>

      {/* ============ Detail grid ============ */}
      <section className="relative z-10 border-t border-border-subtle px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* About */}
          {location.description && (
            <div className="md:col-span-2">
              <SectionTitle>About</SectionTitle>
              <p className="mt-3 text-base leading-relaxed text-text-secondary">
                {location.description}
              </p>
            </div>
          )}

          {/* Hours */}
          {location.hours && (
            <div>
              <SectionTitle icon={<Clock className="h-3.5 w-3.5" />}>
                Hours
              </SectionTitle>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="tabular">{location.hours}</span>
              </p>
            </div>
          )}

          {/* Aliases */}
          {location.aliases && location.aliases.length > 0 && (
            <div>
              <SectionTitle>Also known as</SectionTitle>
              <ul className="mt-3 flex flex-wrap gap-2">
                {location.aliases.map((alias) => (
                  <li
                    key={alias}
                    className="rounded-md border border-border-subtle bg-bg-elevated/50 px-2 py-0.5 text-xs text-text-secondary"
                  >
                    {alias}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contains */}
          {location.contains && location.contains.length > 0 && (
            <div className="md:col-span-2">
              <SectionTitle>Inside</SectionTitle>
              <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-2">
                {location.contains.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-elevated/40 px-3 py-2"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Category card — provides context for unfamiliar visitors */}
          <div className={location.contains ? "md:col-span-2" : ""}>
            <SectionTitle>Category</SectionTitle>
            <Link
              href={`/map?category=${location.category}`}
              className="mt-3 flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-elevated/40 p-4 transition-colors hover:border-border-default hover:bg-bg-elevated"
            >
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border-subtle"
                style={{
                  color: `var(${category.colorVar})`,
                  backgroundColor: `color-mix(in srgb, var(${category.colorVar}) 14%, transparent)`,
                }}
              >
                <CategoryIcon name={category.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary">
                  {category.label}
                </div>
                <div className="mt-0.5 text-xs text-text-muted">
                  {category.description}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Nearby ============ */}
      {nearby.length > 0 && (
        <section className="relative z-10 border-t border-border-subtle px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-3xl">
            <SectionTitle>Nearby</SectionTitle>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {nearby.map((loc) => {
                const nearbyCat = CATEGORIES[loc.category as CategoryId];
                return (
                  <li key={loc.id}>
                    <Link
                      href={`/location/${loc.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-elevated/40 p-3 transition-colors hover:border-border-default hover:bg-bg-elevated"
                    >
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border-subtle"
                        style={{
                          color: `var(${nearbyCat.colorVar})`,
                          backgroundColor: `color-mix(in srgb, var(${nearbyCat.colorVar}) 14%, transparent)`,
                        }}
                      >
                        <CategoryIcon name={nearbyCat.icon} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-text-primary">
                          {loc.name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {nearbyCat.singular}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ============ Footer CTA ============ */}
      <section className="relative z-10 border-t border-border-subtle px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
            See it on the map
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
            Open NaviLag and {location.name} will be centered for you.
          </p>
          <Link
            href={`/map?id=${location.id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
          >
            <Navigation className="h-4 w-4" />
            Open on map
          </Link>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="relative z-10 border-t border-border-subtle px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-text-primary">
            NaviLag
          </Link>
          <span className="tabular">v0.1</span>
        </div>
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Server-side subcomponents
// ---------------------------------------------------------------------------

function CategoryBadge({ category }: { category: CategoryId }) {
  const cat = CATEGORIES[category];
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-elevated/50 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
      style={{ color: `var(${cat.colorVar})` }}
    >
      <CategoryIcon name={cat.icon} className="h-3.5 w-3.5" />
      <span>{cat.singular}</span>
    </div>
  );
}

function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-text-muted">
      {icon}
      <h2 className="font-display text-xs font-medium uppercase tracking-[0.16em]">
        {children}
      </h2>
    </div>
  );
}

function BackdropGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "56px 56px",
        maskImage:
          "radial-gradient(ellipse 60% 40% at 50% 0%, black 30%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 60% 40% at 50% 0%, black 30%, transparent 75%)",
      }}
    />
  );
}
