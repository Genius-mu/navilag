/**
 * NaviLag — Freshers Guide
 *
 * The "I'm new here, where do I start" page. Pulls locations flagged
 * with `freshersPick: true` from the dataset and presents them as
 * an onboarding flow grouped by first-week priorities.
 *
 * Server component — all static, instant load, SEO-friendly. The
 * personalized section is a client island (PersonalizedFreshers).
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Compass,
  BedDouble,
  Building2,
  BookOpen,
  Stethoscope,
  Coffee,
  Landmark,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Sun,
  Clock,
  Smartphone,
  Users,
} from "lucide-react";

import { getFreshersPicks } from "@/lib/data/locations";
import { CATEGORIES, CATEGORY_LIST } from "@/lib/data/categories";
import type { CategoryId, Location } from "@/lib/data/types";

import SiteHeader from "@/components/layout/SiteHeader";
import PersonalizedFreshers from "@/components/freshers/PersonalizedFreshers";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Freshers Guide · NaviLag",
  description:
    "Welcome to UNILAG. Here's where to start — your faculty, your hostel, the essentials you'll actually need in week one.",
};

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

const ICONS = {
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Landmark,
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

export default function FreshersPage() {
  const picks = getFreshersPicks();

  // Group picks by category for cleaner display
  const picksByCategory = picks.reduce(
    (acc, loc) => {
      const cat = loc.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(loc);
      return acc;
    },
    {} as Record<CategoryId, Location[]>
  );

  // Display order — match the categories that matter most in week one
  const displayOrder: CategoryId[] = [
    "faculty",
    "hostel",
    "library",
    "medical",
    "admin",
    "cafeteria",
    "landmark",
  ];

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <BackdropGrid />

      {/* ============ Top bar (auth-aware) ============ */}
      <SiteHeader />

      {/* ============ Hero ============ */}
      <section className="relative z-10 px-6 pt-10 pb-16 md:px-10 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-elevated/70 px-3 py-1 text-xs text-text-secondary backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-accent" />
            <span>For new students</span>
          </div>

          <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-text-primary md:text-7xl">
            Welcome to
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">UNILAG.</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 h-3 bg-accent md:bottom-2 md:h-4"
              />
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            Nobody tells you that the first week is mostly walking in circles.
            You&apos;ll ask for directions, get sent the wrong way, and arrive
            at three lecture halls before finding yours.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            This page is the cheat sheet — the buildings you&apos;ll actually
            need to find in your first month. Tap any of them to see them on
            the map. We&apos;ll get you to class.
          </p>
        </div>
      </section>

      {/* ============ Personalized for signed-in users ============ */}
      <PersonalizedFreshers />

      {/* ============ Start here — top 4 essentials ============ */}
      <section className="relative z-10 border-t border-border-subtle px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Start here</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            The first four things to find.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-secondary md:text-base">
            If you know these by sight, you&apos;re already 80% of the way to
            never being lost.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PriorityCard
              step="01"
              title="Your faculty"
              body="Where most of your classes will happen. Find it before week one starts."
              cta="Browse faculties"
              href="/map?category=faculty"
            />
            <PriorityCard
              step="02"
              title="Your hostel"
              body="If you're staying on campus, know which one — and how to walk back at night."
              cta="View hostels"
              href="/map?category=hostel"
            />
            <PriorityCard
              step="03"
              title="The Main Library"
              body="Quiet study, e-resources, project research. You'll spend more time here than you think."
              cta="Find the library"
              href="/location/main-library"
            />
            <PriorityCard
              step="04"
              title="The Health Centre"
              body="Open 24/7. Know where it is before you need it — not when you need it."
              cta="Locate Health Centre"
              href="/location/health-centre"
            />
          </div>
        </div>
      </section>

      {/* ============ Categorized picks ============ */}
      <section className="relative z-10 border-t border-border-subtle px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>The full list</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Every place a fresher
            <br className="hidden md:block" /> actually needs.
          </h2>

          <div className="mt-10 space-y-10">
            {displayOrder.map((catId) => {
              const items = picksByCategory[catId];
              if (!items || items.length === 0) return null;
              const category = CATEGORIES[catId];

              return (
                <div key={catId}>
                  <div
                    className="flex items-center gap-2 text-sm font-medium"
                    style={{ color: `var(${category.colorVar})` }}
                  >
                    <CategoryIcon name={category.icon} className="h-4 w-4" />
                    <span>{category.label}</span>
                    <span className="text-text-muted">
                      · {items.length}
                    </span>
                  </div>

                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {items.map((loc) => (
                      <li key={loc.id}>
                        <Link
                          href={`/location/${loc.id}`}
                          className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-elevated/40 p-3 transition-colors hover:border-border-default hover:bg-bg-elevated"
                        >
                          <div
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border-subtle"
                            style={{
                              color: `var(${category.colorVar})`,
                              backgroundColor: `color-mix(in srgb, var(${category.colorVar}) 12%, transparent)`,
                            }}
                          >
                            <CategoryIcon
                              name={category.icon}
                              className="h-4 w-4"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-text-primary">
                              {loc.name}
                            </div>
                            <div className="truncate text-xs text-text-muted">
                              {loc.shortDescription}
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Survival tips ============ */}
      <section className="relative z-10 border-t border-border-subtle px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>First-week tips</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Things older students wish
            <br className="hidden md:block" /> someone had told them.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <TipCard
              icon={<Sun className="h-4 w-4" />}
              title="Walk at the right time"
              body="Akoka heat is real. Move between classes early in the day. The walk from Jaja to Engineering is brutal at 1pm."
            />
            <TipCard
              icon={<Clock className="h-4 w-4" />}
              title="Add 15 minutes"
              body="Every walking estimate. UNILAG is bigger than you think, and you'll stop for friends, shawarma, or shade."
            />
            <TipCard
              icon={<Users className="h-4 w-4" />}
              title="Ask older students, not security"
              body="Security knows the gates. Older students know the shortcuts. Look for someone in faculty colours or with a backpack."
            />
            <TipCard
              icon={<Smartphone className="h-4 w-4" />}
              title="Save your essentials"
              body="Use the Save button on each location. Your hostel and faculty should be one tap away from the home screen."
            />
            <TipCard
              icon={<AlertCircle className="h-4 w-4" />}
              title="Know your gate"
              body="Main Gate (Akoka) is the busy one. Second Gate is faster if your hostel is on that side. Pick the right one."
            />
            <TipCard
              icon={<Lightbulb className="h-4 w-4" />}
              title="Lecture halls move"
              body="Your timetable might say one venue but it can change. Always check the noticeboard or class group the morning of."
            />
          </div>
        </div>
      </section>

      {/* ============ Category quick links ============ */}
      <section className="relative z-10 border-t border-border-subtle px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>Browse by type</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            See everything in a category.
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {CATEGORY_LIST.map((cat) => (
              <Link
                key={cat.id}
                href={`/map?category=${cat.id}`}
                className="group flex flex-col items-start gap-3 rounded-lg border border-border-subtle bg-bg-elevated/40 p-4 transition-colors hover:border-border-default hover:bg-bg-elevated"
              >
                <div
                  className="grid h-10 w-10 place-items-center rounded-md border border-border-subtle"
                  style={{
                    color: `var(${cat.colorVar})`,
                    backgroundColor: `color-mix(in srgb, var(${cat.colorVar}) 14%, transparent)`,
                  }}
                >
                  <CategoryIcon name={cat.icon} className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {cat.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
                    {cat.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Final CTA ============ */}
      <section className="relative z-10 border-t border-border-subtle px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Compass className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Ready to find your way?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
            Open the map, search for your faculty or hostel, and save it. That
            alone will save you twenty wrong turns.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              <MapPin className="h-4 w-4" />
              Open the map
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-border-default bg-bg-elevated/60 px-5 py-3 text-sm font-medium text-text-primary backdrop-blur-sm transition-colors hover:bg-bg-elevated"
            >
              Back home
            </Link>
          </div>
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
// Subcomponents
// ---------------------------------------------------------------------------

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

function PriorityCard({
  step,
  title,
  body,
  cta,
  href,
}: {
  step: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-border-subtle bg-bg-elevated/40 p-5 transition-colors hover:border-border-default hover:bg-bg-elevated md:p-6"
    >
      <div className="font-display text-xs font-medium tracking-widest text-text-muted">
        {step}
      </div>
      <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-text-primary">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
      <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors group-hover:text-accent-hover">
        {cta}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function TipCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-5">
      <div className="grid h-8 w-8 place-items-center rounded-md border border-border-subtle bg-bg-elevated text-accent">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold tracking-tight text-text-primary">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
        {body}
      </p>
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
          "radial-gradient(ellipse 70% 35% at 50% 0%, black 30%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 35% at 50% 0%, black 30%, transparent 75%)",
      }}
    />
  );
}