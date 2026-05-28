import Link from "next/link";
import {
  MapPin,
  Search,
  Route,
  Compass,
  ArrowRight,
  Building2,
  BedDouble,
  BookOpen,
  Coffee,
  Stethoscope,
  Dumbbell,
  Star,
  WifiOff,
  Smartphone,
  Quote,
  Navigation,
  Heart,
  Clock,
  ShieldCheck,
  Code2,
} from "lucide-react";

import SiteHeader from "@/components/layout/SiteHeader";

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <GridBackdrop />

      <SiteHeader />

      {/* ============ HERO ============ */}
      <section className="relative z-10 px-5 pt-8 pb-16 md:px-10 md:pt-16 md:pb-24 lg:pt-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div className="flex items-center gap-2 rounded-full border border-border-default bg-bg-elevated/70 px-3 py-1 text-xs text-text-secondary backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="font-medium text-text-primary">NaviLag</span>
              <span className="text-border-strong">·</span>
              <span className="tabular">UNILAG campus map</span>
            </div>

            <h1 className="font-display text-[2.75rem] font-semibold leading-[1.0] tracking-[-0.03em] text-text-primary sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              Find any place
              <br />
              in{" "}
              <span className="relative inline-block">
                <span className="relative z-10">UNILAG.</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 h-3 bg-accent md:bottom-2 md:h-4"
                />
              </span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
              A fast, mobile-first campus map of the University of Lagos. Search
              a lecture hall, hostel, or faculty — get walking directions in
              under three taps. Free for every student.
            </p>

            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/map"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 font-medium text-accent-fg transition-colors hover:bg-accent-hover"
              >
                Open the map
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/freshers"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-bg-elevated/50 px-5 py-3 font-medium text-text-primary backdrop-blur-sm transition-colors hover:bg-bg-elevated"
              >
                <Compass className="h-4 w-4" />
                I&apos;m a fresher
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted">
              <TrustItem icon={<Smartphone className="h-3.5 w-3.5" />}>
                Mobile-first
              </TrustItem>
              <TrustItem icon={<Heart className="h-3.5 w-3.5" />}>
                Free, no ads
              </TrustItem>
              <TrustItem icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                Sign in to save spots
              </TrustItem>
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <MiniMapPreview />
          </div>
        </div>
      </section>

      {/* ============ JUMP NAV ============ */}
      <div className="sticky top-0 z-20 hidden border-y border-border-subtle bg-bg-base/85 px-6 py-3 backdrop-blur-md md:block md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-5 text-text-secondary">
            <JumpLink href="#problem">The problem</JumpLink>
            <JumpLink href="#how">How it works</JumpLink>
            <JumpLink href="#categories">What&apos;s included</JumpLink>
            <JumpLink href="#features">Features</JumpLink>
            <JumpLink href="#why-free">Why free</JumpLink>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-1 font-medium text-text-primary transition-colors hover:text-accent"
          >
            Open map
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ============ THE PROBLEM ============ */}
      <section
        id="problem"
        className="relative z-10 border-t border-border-subtle px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The problem</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Your first week shouldn&apos;t feel like
            <br className="hidden md:block" /> a scavenger hunt.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-text-secondary md:text-lg">
            UNILAG is massive. The campus stretches from Akoka gate down past
            the lagoon, with faculties tucked behind faculties, halls named
            after people you haven&apos;t met, and a hostel called Jaja that
            half the campus can&apos;t actually point to.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary md:text-lg">
            For a fresher, every walk is a guess. You miss class because Tayo
            Aderinokun wasn&apos;t where you thought. You walk to DLI thinking
            it&apos;s near Mass Comm. You ask five people and get five different
            sets of directions. By the time you find New Hall, you&apos;ve done
            4km in the sun.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle sm:grid-cols-3">
            <PainPoint
              stat="20+"
              label="minutes wasted per wrong turn"
              detail="Multiply that across a week of new classes."
            />
            <PainPoint
              stat="8"
              label="faculties, dozens of departments"
              detail="Spread across a campus most maps don't bother with."
            />
            <PainPoint
              stat="1"
              label="map that actually helps"
              detail="The one you're looking at."
            />
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        id="how"
        className="relative z-10 border-t border-border-subtle px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Three taps. You&apos;re there.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            No twelve-screen onboarding. Open the map, search, walk.
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated/30 p-5 md:p-8">
            <DemoSearchPreview />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <StepCard
              number="01"
              title="Search anything"
              body="Type 'mass comm', 'jaja', 'senate', or even 'engr 200' — fuzzy search finds the place even when you spell it wrong."
            />
            <StepCard
              number="02"
              title="Tap to preview"
              body="See what the building is, what's inside, opening hours, and where it sits on campus before you commit to the walk."
            />
            <StepCard
              number="03"
              title="Get directions"
              body="Real walking routes that follow actual campus paths — not a straight line through a fence. Distance and ETA included."
            />
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section
        id="categories"
        className="relative z-10 border-t border-border-subtle px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <SectionLabel>What you can find</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Everything you actually
            <br className="hidden md:block" /> walk to.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            We&apos;re not mapping every tree on campus. We&apos;re mapping the
            places students go every day.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle sm:grid-cols-3 lg:grid-cols-4">
            <CategoryTile
              icon={<Building2 className="h-5 w-5" />}
              label="Faculties"
              examples="Science, Arts, Engr, Law"
              colorVar="--cat-faculty"
            />
            <CategoryTile
              icon={<BedDouble className="h-5 w-5" />}
              label="Hostels"
              examples="Jaja, Mariere, Moremi, New Hall"
              colorVar="--cat-hostel"
            />
            <CategoryTile
              icon={<BookOpen className="h-5 w-5" />}
              label="Libraries"
              examples="Main library, faculty reading rooms"
              colorVar="--cat-library"
            />
            <CategoryTile
              icon={<Coffee className="h-5 w-5" />}
              label="Food spots"
              examples="Cafeterias, food courts, kiosks"
              colorVar="--cat-cafeteria"
            />
            <CategoryTile
              icon={<Building2 className="h-5 w-5" />}
              label="Admin"
              examples="Senate, Bursary, Registry"
              colorVar="--cat-admin"
            />
            <CategoryTile
              icon={<Dumbbell className="h-5 w-5" />}
              label="Sports"
              examples="Sports centre, fields, courts"
              colorVar="--cat-sports"
            />
            <CategoryTile
              icon={<Stethoscope className="h-5 w-5" />}
              label="Medical"
              examples="Health centre, clinics"
              colorVar="--cat-medical"
            />
            <CategoryTile
              icon={<MapPin className="h-5 w-5" />}
              label="Landmarks"
              examples="Gates, parks, lagoon front"
              colorVar="--cat-landmark"
            />
          </div>

          <div className="mt-10">
            <div className="text-center font-display text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
              Including all UNILAG faculties
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-text-secondary md:gap-x-12">
              <FacultyName>Science</FacultyName>
              <FacultyName>Arts</FacultyName>
              <FacultyName>Engineering</FacultyName>
              <FacultyName>Law</FacultyName>
              <FacultyName>Social Sciences</FacultyName>
              <FacultyName>Education</FacultyName>
              <FacultyName>Management</FacultyName>
              <FacultyName>Environmental</FacultyName>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section
        id="features"
        className="relative z-10 border-t border-border-subtle px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The details</SectionLabel>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Built like a tool,
            <br className="hidden md:block" /> not a brochure.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border-subtle bg-border-subtle md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Fuzzy search"
              body="Type 'engr', 'mas com', or 'jaa hostel' — typos and shorthand still find the right place."
              kbd="⌘ K"
            />
            <FeatureCard
              icon={<Route className="h-5 w-5" />}
              title="Real walking routes"
              body="Powered by OpenStreetMap. Routes follow actual paths, not bird-flight straight lines."
              kbd="↗"
            />
            <FeatureCard
              icon={<Star className="h-5 w-5" />}
              title="Favourites that sync"
              body="Sign in to save your faculty, your hostel, your spot — and find them on any device."
              kbd="★"
            />
            <FeatureCard
              icon={<Navigation className="h-5 w-5" />}
              title="Locate me"
              body="One tap to drop your pin and see how far you are from anywhere on campus."
              kbd="◎"
            />
            <FeatureCard
              icon={<Compass className="h-5 w-5" />}
              title="Freshers mode"
              body="A focused starter view: your faculty, your hostel, the senate building, the medical centre."
              kbd="◐"
            />
            <FeatureCard
              icon={<WifiOff className="h-5 w-5" />}
              title="Light on data"
              body="Loads fast on a weak network. Built mobile-first because that's how you'll actually use it."
              kbd="↯"
            />
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIAL ============ */}
      <section className="relative z-10 border-t border-border-subtle px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Quote className="mx-auto h-8 w-8 text-accent" />
          <blockquote className="mt-6 font-display text-2xl font-medium leading-snug tracking-tight text-text-primary md:text-4xl">
            &ldquo;I missed my first GST lecture because I went to the wrong
            block. By the second week I had given up on asking — I&apos;d just
            show up early and hope. I wish this existed when I was a
            fresher.&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3 text-sm">
            <div className="grid h-9 w-9 place-items-center rounded-full border border-border-default bg-bg-elevated font-display text-xs font-semibold text-accent">
              UL
            </div>
            <div className="text-left">
              <div className="font-medium text-text-primary">
                Every UNILAG student, basically
              </div>
              <div className="text-text-muted">100L through 500L</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY FREE ============ */}
      <section
        id="why-free"
        className="relative z-10 border-t border-border-subtle px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionLabel>Why it&apos;s free</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                We built this because we needed it.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-text-secondary">
                NaviLag isn&apos;t a startup. There&apos;s no premium tier, no
                investor deck, no plan to sell your data. It&apos;s a student
                project that exists because Google Maps doesn&apos;t know what
                Mass Comm is, and the school has bigger problems to solve than
                making a wayfinding app.
              </p>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">
                If it helps you get to class on time, that&apos;s the whole
                point. Spread the word. Tell a fresher.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ValuePill
                icon={<ShieldCheck className="h-4 w-4" />}
                title="No ads, ever"
                body="Your map shouldn't try to sell you something while you're late to class."
              />
              <ValuePill
                icon={<Heart className="h-4 w-4" />}
                title="No tracking"
                body="We don't sell data because we don't collect any beyond what's needed."
              />
              <ValuePill
                icon={<Code2 className="h-4 w-4" />}
                title="Student-built"
                body="Made by UNILAG students, for UNILAG students. Want to contribute?"
              />
              <ValuePill
                icon={<Clock className="h-4 w-4" />}
                title="Always improving"
                body="The dataset grows every week as we add real coordinates and details."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ BIG CTA ============ */}
      <section className="relative z-10 border-t border-border-subtle px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel className="justify-center">Stop guessing</SectionLabel>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-6xl lg:text-7xl">
            Open the map.
            <br />
            <span className="text-text-muted">Find your class.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
            It takes longer to read this sentence than to find your faculty. Try
            it.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/map"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Open NaviLag
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border-default bg-bg-elevated/50 px-6 py-3 font-medium text-text-primary backdrop-blur-sm transition-colors hover:bg-bg-elevated"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-border-subtle px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative grid h-7 w-7 place-items-center rounded-md bg-accent">
                <MapPin className="h-4 w-4 text-accent-fg" strokeWidth={2.5} />
              </div>
              <span className="font-display text-base font-semibold tracking-tight">
                NaviLag
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-text-muted">
              A student-built campus navigation app for the University of Lagos.
              Made because we got lost too.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-text-secondary sm:items-end">
            <div className="flex flex-wrap gap-5">
              <Link
                href="/map"
                className="transition-colors hover:text-text-primary"
              >
                Map
              </Link>
              <Link
                href="/freshers"
                className="transition-colors hover:text-text-primary"
              >
                Freshers
              </Link>
              <Link
                href="/sign-in"
                className="transition-colors hover:text-text-primary"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="transition-colors hover:text-text-primary"
              >
                Sign up
              </Link>
            </div>
            <div className="text-xs text-text-muted tabular">
              © {new Date().getFullYear()} NaviLag · v0.1
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ===================== Subcomponents ===================== */

function JumpLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="whitespace-nowrap transition-colors hover:text-text-primary"
    >
      {children}
    </a>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="h-1 w-1 rounded-full bg-accent" />
      <span className="font-display text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
        {children}
      </span>
    </div>
  );
}

function TrustItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {children}
    </span>
  );
}

function PainPoint({
  stat,
  label,
  detail,
}: {
  stat: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="bg-bg-base p-6 md:p-8">
      <div className="font-display text-4xl font-semibold tracking-tight text-accent md:text-5xl">
        {stat}
      </div>
      <div className="mt-3 text-sm font-medium text-text-primary">{label}</div>
      <div className="mt-1 text-sm leading-relaxed text-text-muted">
        {detail}
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-lg border border-border-subtle bg-bg-elevated/40 p-6 transition-colors hover:border-border-default hover:bg-bg-elevated md:p-8">
      <div className="font-display text-xs font-medium tracking-widest text-text-muted">
        {number}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-text-primary">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{body}</p>
    </div>
  );
}

function CategoryTile({
  icon,
  label,
  examples,
  colorVar,
}: {
  icon: React.ReactNode;
  label: string;
  examples: string;
  colorVar: string;
}) {
  return (
    <div className="group flex flex-col gap-3 bg-bg-base p-5 transition-colors hover:bg-bg-elevated/50">
      <div
        className="grid h-9 w-9 place-items-center rounded-md border border-border-default"
        style={{
          color: `var(${colorVar})`,
          backgroundColor: `color-mix(in srgb, var(${colorVar}) 12%, transparent)`,
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="mt-1 text-xs leading-relaxed text-text-muted">
          {examples}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  kbd,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  kbd: string;
}) {
  return (
    <div className="group relative flex flex-col gap-3 bg-bg-base p-6 transition-colors hover:bg-bg-elevated/50 md:p-8">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-md border border-border-default bg-bg-elevated text-text-primary">
          {icon}
        </div>
        <span className="rounded border border-border-default bg-bg-elevated px-1.5 py-0.5 font-display text-[10px] font-medium tracking-wider text-text-muted">
          {kbd}
        </span>
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight text-text-primary">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
    </div>
  );
}

function FacultyName({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-sm font-medium tracking-tight">
      {children}
    </span>
  );
}

function ValuePill({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 p-4">
      <div className="grid h-8 w-8 place-items-center rounded-md border border-border-subtle bg-bg-elevated text-accent">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-sm font-semibold tracking-tight text-text-primary">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">{body}</p>
    </div>
  );
}

function MiniMapPreview() {
  return (
    <div className="relative aspect-[5/6] w-full overflow-hidden rounded-2xl border border-border-default bg-bg-elevated/40 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      <svg
        viewBox="0 0 400 480"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="2" fill="none">
          <path d="M 0 120 Q 100 100 200 130 T 400 140" />
          <path d="M 50 0 L 80 200 L 120 300 L 160 480" />
          <path d="M 0 280 L 200 260 L 400 290" />
          <path d="M 240 0 L 220 240 L 280 360 L 300 480" />
          <path d="M 320 60 L 340 200 L 320 360" />
        </g>
        <path
          d="M 80 380 Q 140 320 200 280 T 320 160"
          stroke="#3b9eff"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g>
          <circle cx="80" cy="380" r="14" fill="#3b9eff" fillOpacity="0.2">
            <animate
              attributeName="r"
              values="12;18;12"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0.25;0.05;0.25"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="80"
            cy="380"
            r="6"
            fill="#5cb0ff"
            stroke="#0a0a0c"
            strokeWidth="2.5"
          />
        </g>
        <g>
          <circle cx="320" cy="160" r="13" fill="#3b9eff" fillOpacity="0.18" />
          <circle
            cx="320"
            cy="160"
            r="8"
            fill="#3b9eff"
            stroke="#0a0a0c"
            strokeWidth="2.5"
          />
          <circle cx="320" cy="160" r="3" fill="#0a0a0c" />
        </g>
        <MarkerDot cx={140} cy={120} color="#fbbf24" />
        <MarkerDot cx={260} cy={80} color="#22d3ee" />
        <MarkerDot cx={200} cy={200} color="#a78bfa" />
        <MarkerDot cx={320} cy={300} color="#34d399" />
        <MarkerDot cx={100} cy={240} color="#fb7185" />
        <MarkerDot cx={180} cy={420} color="#e4e4e7" />
      </svg>
      <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-accent/40 bg-bg-overlay/95 px-3 py-1.5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-fg">
            <Route className="h-3 w-3" />
          </div>
          <span className="font-display text-xs font-semibold tabular text-text-primary">
            420 m · 5 min
          </span>
        </div>
      </div>
      <div className="absolute inset-x-4 bottom-4 rounded-lg border border-border-default bg-bg-overlay/90 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs">
          <Search className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-text-primary">Mass Comm</span>
          <span className="ml-auto rounded border border-border-default bg-bg-elevated px-1.5 py-0.5 font-display text-[9px] tracking-wider text-text-muted">
            ⌘ K
          </span>
        </div>
      </div>
    </div>
  );
}

function MarkerDot({
  cx,
  cy,
  color,
}: {
  cx: number;
  cy: number;
  color: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="10" fill={color} fillOpacity="0.18" />
      <circle
        cx={cx}
        cy={cy}
        r="6"
        fill={color}
        stroke="#0a0a0c"
        strokeWidth="2"
      />
      <circle cx={cx} cy={cy} r="2.5" fill="#0a0a0c" />
    </g>
  );
}

function DemoSearchPreview() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border-default bg-bg-overlay/85 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2.5">
        <Search className="h-4 w-4 text-text-muted" />
        <span className="flex-1 text-sm text-text-primary">
          jaa hostel
          <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-accent align-middle" />
        </span>
        <span className="rounded border border-border-default bg-bg-elevated px-1.5 py-0.5 font-display text-[10px] tracking-wider text-text-muted">
          ⌘ K
        </span>
      </div>
      <div>
        <div className="flex items-center gap-1.5 border-b border-border-subtle px-3 py-1.5 text-text-muted">
          <Search className="h-3 w-3" />
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em]">
            1 result
          </span>
        </div>
        <div className="flex items-center gap-3 bg-bg-hover/60 px-3 py-2.5">
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border-subtle"
            style={{
              color: "var(--cat-hostel)",
              backgroundColor:
                "color-mix(in srgb, var(--cat-hostel) 14%, transparent)",
            }}
          >
            <BedDouble className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-text-primary">
              Jaja Hall
            </div>
            <div className="text-xs text-text-muted">
              Hostel · matched alias
            </div>
          </div>
          <span className="text-[10px] text-text-muted">↵</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border-subtle px-3 py-1.5 text-[10px] text-text-muted">
        <div className="flex items-center gap-2">
          <kbd className="rounded border border-border-default bg-bg-elevated px-1 py-px font-display text-[9px] tracking-wider">
            ↑ ↓
          </kbd>
          <span>navigate</span>
        </div>
        <span className="font-display tracking-wider">NaviLag</span>
      </div>
    </div>
  );
}

function GridBackdrop() {
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
          "radial-gradient(ellipse 80% 40% at 50% 12%, black 30%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 40% at 50% 12%, black 30%, transparent 75%)",
      }}
    />
  );
}
