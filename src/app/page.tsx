import { ArrowRight, BadgeCheck, PhoneOff, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SearchBox } from "@/components/search-box";
import { StoreRow } from "@/components/store-row";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
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

/** Ported from the Android app's category illustrations. */
const CATEGORY_ART: Record<string, string> = {
  tailors: "/images/cat-tailors.webp",
  boutiques: "/images/cat-boutiques.webp",
  "fabric-shops": "/images/cat-fabric-shops.webp",
  "rental-shops": "/images/cat-rental-shops.webp",
};

export default async function HomePage() {
  const cities = await getCities();
  const primaryCity = cities[0]?.slug ?? "delhi";

  const [featured, counts, tailorServices] = await Promise.all([
    listStores({ sort: "relevance", perPage: 4 }),
    getCategoryCounts(primaryCity),
    getServices("tailors"),
  ]);

  return (
    <>
      {/* ── Search + promise ─────────────────────────────────────
          The app opens on a floating search pill above a promo banner.
          Same shape here, but the banner sells the one thing this site
          has that no listings app does: published prices. */}
      <Container className="pt-8 pb-10 sm:pt-12">
        <div className="mx-auto max-w-3xl">
          <SearchBox cities={cities} defaultCity={primaryCity} />
        </div>

        <div className="mt-8 overflow-hidden rounded-card bg-coral-400 px-6 py-10 text-center sm:px-12 sm:py-14">
          <h1 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Know the price before you walk in
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/90 sm:text-lg">
            Real rate cards, timings and contact details for tailors,
            boutiques, fabric shops and rental stores across Delhi NCR.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href={`/${primaryCity}/tailors`}>Browse shops</Link>
          </Button>
        </div>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm text-ink-500">
          <li className="flex items-center gap-1.5">
            <ReceiptText aria-hidden className="size-4 text-brand-500" />
            Published price lists
          </li>
          <li className="flex items-center gap-1.5">
            <PhoneOff aria-hidden className="size-4 text-brand-500" />
            We never sell your number
          </li>
          <li className="flex items-center gap-1.5">
            <BadgeCheck aria-hidden className="size-4 text-brand-500" />
            No paid rankings
          </li>
        </ul>
      </Container>

      {/* ── Category grid ───────────────────────────────────────
          The app's 2x2 of illustrated cards, using the same artwork. */}
      <Container className="pb-12">
        <h2 className="mb-5 font-display text-2xl font-bold text-ink-900">
          Category
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${primaryCity}/${c.slug}`}
              className="group relative flex items-center justify-between gap-2 overflow-hidden rounded-card bg-ink-50 p-4 shadow-card transition-shadow hover:shadow-card-lg sm:p-5"
            >
              <div className="relative z-10 min-w-0">
                <p className="font-display text-lg font-bold leading-tight text-ink-900 sm:text-2xl">
                  {c.name}
                </p>
                <p className="mt-1 text-xs text-ink-500 sm:text-sm">
                  {counts[c.slug] ?? 0} listed
                </p>
              </div>
              <Image
                src={CATEGORY_ART[c.slug]}
                alt=""
                width={160}
                height={160}
                className="size-20 shrink-0 object-contain transition-transform duration-500 group-hover:scale-105 sm:size-28"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ backgroundColor: c.accent }}
              />
            </Link>
          ))}
        </div>
      </Container>

      {/* ── Featured shops ──────────────────────────────────────── */}
      <Container className="pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Shops worth knowing
          </h2>
          <Link
            href={`/${primaryCity}/tailors`}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
          >
            View all
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {featured.items.map((store, i) => (
            <StoreRow key={store.id} store={store} priority={i < 2} />
          ))}
        </div>
      </Container>

      {/* ── Price index ─────────────────────────────────────────── */}
      <Container className="pb-12">
        <h2 className="mb-1 font-display text-2xl font-bold text-ink-900">
          What should it cost?
        </h2>
        <p className="mb-5 text-sm text-ink-500">
          Typical Delhi rates, built from price lists shops have shared with us.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tailorServices.slice(0, 9).map((s) => (
            <Link
              key={s.slug}
              href={`/${primaryCity}/prices/${s.slug}`}
              className="group flex items-center justify-between gap-4 rounded-card bg-white px-4 py-3.5 shadow-card transition-shadow hover:shadow-card-lg"
            >
              <span className="text-ink-800">{s.name}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600">
                {s.benchmarkMin
                  ? `₹${s.benchmarkMin.toLocaleString("en-IN")}+`
                  : "See rates"}
                <ArrowRight
                  aria-hidden
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </Container>

      {/* ── Owner CTA ───────────────────────────────────────────── */}
      <Container className="pb-16">
        <div className="rounded-card bg-ink-900 px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl font-display text-2xl font-bold text-white sm:text-3xl">
            Run a tailoring shop, boutique or fabric store?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Your listing is free, and always will be. Claim it to manage your
            photos, price list and timings.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild variant="brand" size="lg">
              <Link href="/claim">Claim your listing</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/25 bg-transparent text-white hover:border-white/60"
            >
              <Link href="/suggest">Suggest a shop</Link>
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
