import { ArrowRight, BadgeCheck, PhoneOff, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SearchBox } from "@/components/search-box";
import { StoreCard } from "@/components/store-card";
import { Button } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/container";
import { getCategoryCounts, getCities, getServices, listStores } from "@/lib/queries";
import { CATEGORIES, site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — Tailors, Boutiques, Fabric & Rentals in Delhi NCR`,
  description: site.description,
  alternates: { canonical: "/" },
};

// Home is fully static and rebuilt hourly — nothing on it is per-request.
export const revalidate = 3600;

const COVERS: Record<string, string> = {
  tailors: "/images/tailor.png",
  boutiques: "/images/boutique.png",
  "fabric-shops": "/images/fabric.png",
  "rental-shops": "/images/rental.png",
};

export default async function HomePage() {
  const cities = await getCities();
  const primaryCity = cities[0]?.slug ?? "delhi";

  const [featured, counts, tailorServices] = await Promise.all([
    listStores({ sort: "relevance", perPage: 6 }),
    getCategoryCounts(primaryCity),
    getServices("tailors"),
  ]);

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-paper-300 bg-grain">
        <Container className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-brass-600">
              Delhi · Gurugram · Noida
            </p>
            <h1 className="text-4xl leading-[1.08] text-ink-900 sm:text-6xl">
              Know the price
              <br />
              <span className="italic text-brass-600">before</span> you walk in.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
              Real rate cards and real work photos from tailors, boutiques,
              fabric shops and rental stores across Delhi NCR. Browse freely —
              contact the shop directly.
            </p>

            <div className="mt-8 max-w-2xl">
              <SearchBox cities={cities} defaultCity={primaryCity} />
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              <li className="flex items-center gap-1.5">
                <ReceiptText aria-hidden className="size-4 text-brass-600" />
                Published price lists
              </li>
              <li className="flex items-center gap-1.5">
                <PhoneOff aria-hidden className="size-4 text-brass-600" />
                We never sell your number
              </li>
              <li className="flex items-center gap-1.5">
                <BadgeCheck aria-hidden className="size-4 text-brass-600" />
                No paid rankings
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* ── Categories ─────────────────────────────────────────── */}
      <Container className="py-16">
        <SectionHeading
          eyebrow="Four verticals"
          title="What are you looking for?"
          description="Everything custom clothing needs, split the way you actually shop for it."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${primaryCity}/${c.slug}`}
              className="group relative overflow-hidden rounded-card border border-paper-300 bg-paper-50 transition-shadow hover:shadow-[0_16px_44px_-20px_rgb(20_27_45_/_0.4)]"
            >
              <div className="relative aspect-4/5 overflow-hidden">
                <Image
                  src={COVERS[c.slug]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span
                    aria-hidden
                    className="mb-3 block h-0.5 w-10"
                    style={{ backgroundColor: c.accent }}
                  />
                  <h3 className="font-display text-2xl text-paper-50">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-sm text-paper-200/85">{c.blurb}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brass-300">
                    {counts[c.slug] ?? 0} in Delhi
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>

      {/* ── Featured ───────────────────────────────────────────── */}
      <Container className="pb-16">
        <SectionHeading
          eyebrow="Hand-checked"
          title="Shops worth knowing"
          description="Listings where we've verified the details and the shop has shared its rate card."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={`/${primaryCity}/tailors`}>
                Browse all <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.items.map((store, i) => (
            <StoreCard key={store.id} store={store} priority={i < 3} />
          ))}
        </div>
      </Container>

      {/* ── Price index ────────────────────────────────────────── */}
      <section className="border-y border-paper-300 bg-paper-200/60">
        <Container className="py-16">
          <SectionHeading
            eyebrow="Price transparency"
            title="What should it actually cost?"
            description="Typical Delhi rates, built from rate cards shops have shared with us — not guesswork."
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tailorServices.slice(0, 9).map((s) => (
              <Link
                key={s.slug}
                href={`/${primaryCity}/prices/${s.slug}`}
                className="group flex items-center justify-between gap-4 rounded-card border border-paper-300 bg-paper-50 px-4 py-3.5 transition-colors hover:border-brass-400"
              >
                <span className="text-ink-800">{s.name}</span>
                <span className="flex items-center gap-2 text-sm font-medium text-brass-700">
                  {s.benchmarkMin ? `₹${s.benchmarkMin.toLocaleString("en-IN")}+` : "See rates"}
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Owner CTA ──────────────────────────────────────────── */}
      <Container className="py-16">
        <div className="overflow-hidden rounded-card bg-ink-900 px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl text-paper-50">
            Run a tailoring shop, boutique or fabric store?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-paper-300/85">
            Your listing is free, and always will be. Claim it to update your
            photos, price list and timings — and get found by people who already
            know what they want.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="brass" size="lg">
              <Link href="/claim">Claim your listing</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-paper-100/25 text-paper-100 hover:bg-paper-100/10"
            >
              <Link href="/suggest">Suggest a shop</Link>
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
