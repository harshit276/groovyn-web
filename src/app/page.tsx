import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  PhoneOff,
  ReceiptText,
  Scissors,
  Shirt,
  Sparkles,
  Store,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HeroDeck } from "@/components/hero-deck";
import { Marquee } from "@/components/marquee";
import { Rise } from "@/components/rise";
import { SearchBox } from "@/components/search-box";
import { StoreRow } from "@/components/store-row";
import { TiltCard } from "@/components/tilt-card";
import { Button } from "@/components/ui/button";
import {
  getCategoryCounts,
  getCities,
  getServices,
  listStores,
} from "@/lib/queries";
import { CATEGORIES, site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — Tailors, Boutiques, Fabric & Rentals in Delhi NCR`,
  description: site.description,
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

const CATEGORY_ICONS: Record<string, typeof Scissors> = {
  tailors: Scissors,
  boutiques: Shirt,
  "fabric-shops": Store,
  "rental-shops": Sparkles,
};

const CATEGORY_IMAGES: Record<string, string> = {
  tailors: "/images/cat-tailors.webp",
  boutiques: "/images/cat-boutiques.webp",
  "fabric-shops": "/images/cat-fabric-shops.webp",
  "rental-shops": "/images/cat-rental-shops.webp",
};

/* An asymmetric bento beats a 2×2 grid — the eye gets a path through it. */
const CATEGORY_SPANS: Record<string, string> = {
  tailors: "lg:col-span-7 lg:row-span-2",
  boutiques: "lg:col-span-5",
  "fabric-shops": "lg:col-span-5",
  "rental-shops": "lg:col-span-12",
};

const TICKER = [
  "Shirt stitching",
  "Lehenga on rent",
  "Suit tailoring",
  "Raw silk by metre",
  "Blouse fitting",
  "Sherwani rental",
  "Bridal boutiques",
  "Alterations",
  "Chandni Chowk",
  "Lajpat Nagar",
  "Karol Bagh",
  "Connaught Place",
];

export default async function HomePage() {
  const cities = await getCities();
  const primaryCity = cities[0]?.slug ?? "delhi";

  const [featured, counts, tailorServices] = await Promise.all([
    listStores({ sort: "relevance", perPage: 4 }),
    getCategoryCounts(primaryCity),
    getServices("tailors"),
  ]);

  const totalShops = Object.values(counts).reduce((a, b) => a + b, 0);

  const stats = [
    { value: `${totalShops}+`, label: "Shops listed" },
    { value: `${cities.length}`, label: "Cities covered" },
    { value: "₹0", label: "To list your shop" },
  ];

  return (
    <>
      {/* ══ Hero ══════════════════════════════════════════════ */}
      {/* Runs under the floating nav — see the pt-20 on <main>. The marker
          tells SiteHeader it may render its transparent palette here. */}
      <section
        data-dark-hero
        className="mesh-dark grain relative isolate -mt-20 overflow-hidden pt-20"
      >
        {/* Blueprint grid, faint enough to read as texture not decoration. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 90% 70% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 70% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-28">
            {/* ── Left: the pitch ── */}
            <div>
              <Rise>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300 backdrop-blur-sm">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full rounded-full bg-brand-300 opacity-75" />
                  </span>
                  Delhi NCR&rsquo;s custom clothing directory
                </span>
              </Rise>

              <Rise delay={60}>
                <h1 className="mt-6 max-w-[13ch] font-display text-[clamp(2.5rem,5.4vw,4.4rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white">
                  Find the{" "}
                  <span className="text-gradient font-serif italic font-medium">
                    best
                  </span>{" "}
                  tailors near you.
                </h1>
              </Rise>

              <Rise delay={120}>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
                  Compare Delhi NCR&rsquo;s best tailors, boutiques, fabric and
                  rental shops — see real rates up front, book a visit, and grab
                  the deals they&rsquo;re running.
                </p>
              </Rise>

              <Rise delay={180}>
                <div className="mt-8 max-w-xl [&_form]:border-white/10 [&_form]:bg-white/95 [&_form]:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]">
                  <SearchBox cities={cities} defaultCity={primaryCity} />
                </div>
              </Rise>

              <Rise delay={240}>
                <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt className="sr-only">{s.label}</dt>
                      <dd>
                        <span className="block font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                          {s.value}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/40">
                          {s.label}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Rise>
            </div>

            {/* ── Right: the 3D deck ── */}
            {/* Inset on small screens: the deck's chip sits at a negative
                offset, which the section's overflow-hidden would clip. */}
            <div className="relative mx-auto w-[86%] max-w-lg sm:w-full lg:max-w-none">
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -z-10 size-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[90px]"
              />
              <HeroDeck />
            </div>
          </div>
        </div>

        {/* Trust strip — the three promises, on the dark. */}
        <div className="relative border-y border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <ul className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                {
                  icon: ReceiptText,
                  title: "Published price lists",
                  body: "Rate cards from the shop, not guesses.",
                },
                {
                  icon: PhoneOff,
                  title: "We never sell your number",
                  body: "No lead resale. No spam calls. Ever.",
                },
                {
                  icon: BadgeCheck,
                  title: "No paid rankings",
                  body: "Nobody can buy their way to the top.",
                },
              ].map((t) => (
                <li
                  key={t.title}
                  className="flex items-start gap-3.5 py-6 sm:px-7 sm:first:pl-0 sm:last:pr-0"
                >
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5">
                    <t.icon aria-hidden className="size-4 text-brand-300" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-white">
                      {t.title}
                    </p>
                    <p className="mt-0.5 text-sm text-white/45">{t.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ticker — motion at the seam between hero and page. */}
        <div className="relative bg-ink-950 py-4">
          <Marquee items={TICKER} />
        </div>
      </section>

      {/* ══ Categories — bento with real imagery ══════════════ */}
      <section className="relative overflow-hidden bg-ground py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Rise>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-500">
                  Explore
                </p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-ink-950 sm:text-5xl">
                  Four ways to get it made
                </h2>
              </div>
              <Link
                href={`/${primaryCity}/tailors`}
                className="group inline-flex items-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-white"
              >
                Browse all
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </Rise>

          <div className="stage mt-12 grid gap-4 sm:gap-5 lg:grid-cols-12">
            {CATEGORIES.map((c, i) => {
              const Icon = CATEGORY_ICONS[c.slug] ?? Store;
              const count = counts[c.slug] ?? 0;
              const wide = c.slug === "rental-shops" || c.slug === "tailors";

              return (
                <Rise
                  key={c.slug}
                  delay={i * 70}
                  className={CATEGORY_SPANS[c.slug] ?? "lg:col-span-6"}
                >
                  <TiltCard intensity={7} lift={1.02} className="h-full">
                    <Link
                      href={`/${primaryCity}/${c.slug}`}
                      className="edge-light group relative flex h-full min-h-[260px] flex-col justify-end overflow-hidden rounded-3xl bg-ink-900 p-6 shadow-3d transition-shadow duration-500 hover:shadow-3d-lg sm:min-h-[300px] sm:p-8"
                    >
                      <Image
                        src={CATEGORY_IMAGES[c.slug]}
                        alt=""
                        fill
                        // Below the fold — loading these eagerly would compete
                        // with the hero deck for the LCP.
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 700px"
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
                      />
                      {/* Two scrims: one for text contrast, one for category tint. */}
                      <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
                      <span
                        className="absolute inset-0 opacity-0 mix-blend-color transition-opacity duration-500 group-hover:opacity-60"
                        style={{ backgroundColor: c.accent }}
                      />

                      <div className="relative">
                        <span
                          className="mb-4 inline-grid size-11 place-items-center rounded-xl text-white shadow-lg transition-transform duration-500 group-hover:-translate-y-0.5"
                          style={{ backgroundColor: c.accent }}
                        >
                          <Icon className="size-5" />
                        </span>

                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <h3
                              className={`font-display font-extrabold tracking-tight text-white ${
                                wide ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
                              }`}
                            >
                              {c.name}
                            </h3>
                            <p className="mt-1.5 max-w-sm text-sm text-white/65">
                              {c.blurb}
                            </p>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                              {count} {count === 1 ? "shop" : "shops"} listed
                            </p>
                          </div>

                          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-all duration-500 group-hover:border-white group-hover:bg-white group-hover:text-ink-950">
                            <ArrowUpRight className="size-5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </Rise>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ Featured shops ═══════════════════════════════════ */}
      <section className="mesh-dark grain relative overflow-hidden py-20 text-white sm:py-28">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Rise>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300">
                  Featured
                </p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] sm:text-5xl">
                  Shops worth knowing
                </h2>
                <p className="mt-4 text-white/55">
                  Verified listings with published rates, real timings and
                  photos of actual work.
                </p>
              </div>
              <Link
                href={`/${primaryCity}/tailors`}
                className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-ink-950"
              >
                View all
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </Rise>

          <div className="stage mt-12 grid gap-5 lg:grid-cols-2">
            {featured.items.map((store, i) => (
              <Rise key={store.id} delay={i * 60}>
                <TiltCard intensity={5} lift={1.015} glare={false}>
                  <StoreRow store={store} priority={i < 2} />
                </TiltCard>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Price index ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-ground py-20 sm:py-28">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Rise>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-500">
                Popular services
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-ink-950 sm:text-5xl">
                Starting prices near you
              </h2>
              <p className="mt-4 text-ink-500">
                What Delhi NCR shops charge, from the rate cards they published
                themselves. Compare, then book the one you like.
              </p>
            </div>
          </Rise>

          <div className="stage mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tailorServices.slice(0, 9).map((s, i) => (
              <Rise key={s.slug} delay={i * 40}>
                <TiltCard intensity={6} lift={1.03} glare={false}>
                  <Link
                    href={`/${primaryCity}/prices/${s.slug}`}
                    className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-ink-100 bg-white px-5 py-5 shadow-card transition-all duration-300 hover:border-transparent hover:shadow-3d"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand-500 transition-transform duration-500 group-hover:scale-x-100"
                    />
                    <span className="font-medium text-ink-800">{s.name}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="font-display text-base font-extrabold text-ink-950">
                        {s.benchmarkMin
                          ? `₹${s.benchmarkMin.toLocaleString("en-IN")}+`
                          : "See rates"}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 text-ink-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500"
                      />
                    </span>
                  </Link>
                </TiltCard>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Owner CTA ════════════════════════════════════════ */}
      <section className="bg-ground pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <Rise>
            <div className="mesh-dark grain relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-16 sm:py-24">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300 backdrop-blur-sm">
                  For shop owners
                </span>

                <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl">
                  Your listing is free.{" "}
                  <span className="text-gradient font-serif italic font-medium">
                    Always.
                  </span>
                </h2>

                <p className="mx-auto mt-6 max-w-xl text-white/55 sm:text-lg">
                  Claim your shop to manage photos, price lists, timings and
                  contact details. No commission, no middlemen, no paid ranking.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  <Button asChild variant="brand" size="lg" className="shadow-3d-brand">
                    <Link href="/claim">
                      Claim your listing
                      <ArrowRight aria-hidden className="ml-1 size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/20 bg-white/5 text-white backdrop-blur-sm hover:border-white/45 hover:bg-white/10"
                  >
                    <Link href="/suggest">Suggest a shop</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
