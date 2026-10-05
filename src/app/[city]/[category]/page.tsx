import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqList } from "@/components/blog/faq-list";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { StoreFilters } from "@/components/store-filters";
import { StoreGrid } from "@/components/store-grid";
import { Container } from "@/components/ui/container";
import {
  getCategoryCounts,
  getCity,
  getLocalities,
  getServices,
  listStores,
} from "@/lib/queries";
import { guidesForCategory } from "@/content/blog";
import { breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/schema";
import { categoryFaqs, categoryIntro } from "@/lib/seo-content";
import { fitDescription, fitTitle, openGraphFor } from "@/lib/seo";
import { getCategory, MIN_SHOPS_TO_INDEX_CATEGORY } from "@/lib/site";
import type { StoreSort } from "@/lib/types";
import { formatINR } from "@/lib/utils";

// This page reads `searchParams` for the filters, so it cannot be prerendered.
// Say so explicitly: without this Next treats it as a static/ISR route and
// throws at request time. It builds cleanly and works under `next dev` either
// way, so the failure only appears once deployed — verify with `next start`.
//
// SEO is unaffected: crawlers still receive fully server-rendered HTML. To make
// these statically cacheable, filtering would have to move into a client
// component reading useSearchParams, leaving the page free of request-time
// input — worth doing once traffic justifies it.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/[category]">): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = await params;
  const [city, category] = [await getCity(citySlug), getCategory(categorySlug)];
  if (!city || !category) return {};

  const counts = await getCategoryCounts(citySlug);
  const count = counts[categorySlug] ?? 0;

  // The year keeps the title fresh in results without touching the content, and
  // the count is the real one. "Reviews" is left out on purpose: the ratings on
  // these pages are Google's, and we have no reviews of our own to promise. The
  // count is dropped below two shops, where "1 Shops Compared" is not a claim
  // worth making.
  const year = new Date().getFullYear();
  const base = `Best ${category.name} in ${city.name} (${year})`;
  const title = fitTitle(
    count >= 2 ? [`${base}: ${count} Shops Compared`, base] : [base]
  );
  // Only what the page has: ratings, starting prices and booking. It does not
  // promise photos, which most listings do not have yet.
  const description = fitDescription(
    `Find the best ${category.name.toLowerCase()} in ${city.name}: compare Google ratings and starting prices, then book a visit for free. ${category.blurb}.`
  );

  const url = `/${citySlug}/${categorySlug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: openGraphFor({ title, description, url }),
    // One or two shops is not a listing page. Keep it reachable and keep passing
    // links, but out of the index until the city has real depth.
    robots:
      count < MIN_SHOPS_TO_INDEX_CATEGORY
        ? { index: false, follow: true }
        : undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/[city]/[category]">) {
  const { city: citySlug, category: categorySlug } = await params;
  const sp = await searchParams;

  const category = getCategory(categorySlug);
  const city = await getCity(citySlug);
  if (!city || !category) notFound();

  const str = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const page = Number(str(sp.page) ?? "1") || 1;

  const [result, localities, services] = await Promise.all([
    listStores({
      city: citySlug,
      category: categorySlug,
      locality: str(sp.locality),
      service: str(sp.service),
      speciality: str(sp.speciality),
      homeVisit: str(sp.homeVisit) === "1",
      rateCardOnly: str(sp.rateCard) === "1",
      sort: (str(sp.sort) as StoreSort) ?? "relevance",
      page,
    }),
    getLocalities(citySlug, categorySlug),
    getServices(categorySlug),
  ]);

  // Speciality facets come from what's actually listed, not a hardcoded list.
  const allForFacets = await listStores({
    city: citySlug,
    category: categorySlug,
    perPage: 48,
  });
  const specialities = [
    ...new Set(allForFacets.items.flatMap((s) => s.specialities)),
  ].sort();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${citySlug}` },
    { name: category.name, href: `/${citySlug}/${categorySlug}` },
  ];

  const seoInput = {
    category,
    cityName: city.name,
    total: result.total,
    localities,
    stores: allForFacets.items,
    services,
  };
  const seoIntro = categoryIntro(seoInput);
  const faqs = categoryFaqs(seoInput);
  const guides = guidesForCategory(categorySlug);

  const basePath = `/${citySlug}/${categorySlug}`;
  const flatParams = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );

  // Headline figures for the masthead. These are the numbers a guide leads
  // with and a listings site never shows.
  const withRateCard = allForFacets.items.filter((s) => s.rateCardVerified).length;
  const cheapest = allForFacets.items
    .map((s) => s.priceMin)
    .filter((n): n is number => n != null)
    .sort((a, b) => a - b)[0];

  return (
    <>
      {/* ── Editorial masthead ──────────────────────────────────
          A guide opens with a statement and a set of figures. A listings
          site opens with a filter rail. That difference is most of why
          this page used to feel generic. Dark, so the floating nav has
          something to sit against on arrival. */}
      <section
        data-dark-hero
        className="mesh-dark grain relative isolate -mt-20 overflow-hidden pt-20"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="[&_a:hover]:text-brand-300 [&_a]:text-white/55 [&_li]:text-white/50 [&_span]:text-white/75">
            <Breadcrumbs crumbs={crumbs} />
          </div>

          <p
            className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: category.accent }}
          >
            {category.name} · {city.name}
          </p>

          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
            Best {category.name.toLowerCase()} in {city.name}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
            {category.blurb}. Compare ratings, see starting prices up front and
            book a visit — so you shortlist in ten minutes instead of spending a
            Saturday walking markets.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/12 pt-7 sm:grid-cols-4">
            <Stat label="Shops listed" value={String(result.total)} />
            <Stat
              label="With rate cards"
              value={String(withRateCard)}
              hint={withRateCard === 0 ? "collecting now" : undefined}
            />
            <Stat label="Localities" value={String(localities.length)} />
            <Stat
              label="Prices from"
              value={cheapest ? formatINR(cheapest) : "—"}
            />
          </dl>
        </div>
      </section>

      <Container className="py-10">
      <StoreFilters
        localities={localities}
        services={services}
        specialities={specialities}
        total={result.total}
      />

      <StoreGrid
        result={result}
        basePath={basePath}
        searchParams={flatParams}
        view={
          str(sp.view) === "index"
            ? "index"
            : str(sp.view) === "gallery"
              ? "gallery"
              : "list"
        }
      />

      {/* Copy built from this page's own data: real counts, areas, top-rated
          shops and price ranges. Every answer is also in the FAQPage markup. */}
      {result.total > 0 ? (
        <section className="mt-16 border-t border-ink-100 pt-12">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
            About {category.name.toLowerCase()} in {city.name}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600">
            {seoIntro}
          </p>

          <h3 className="mt-10 font-display text-xl font-extrabold tracking-tight text-ink-950">
            Frequently asked questions
          </h3>
          <div className="max-w-3xl">
            <FaqList faq={faqs} />
          </div>

          {guides.length ? (
            <div className="mt-14">
              <h3 className="font-display text-xl font-extrabold tracking-tight text-ink-950">
                Guides to read first
              </h3>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {guides.map((g) => (
                  <PostCard key={g.slug} post={g} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Locality links live at the foot of the page. Filtering by locality is
          the dropdown's job; these exist so each locality page is crawlable and
          reachable, which is what the long-tail SEO depends on. */}
      {localities.length ? (
        <nav
          aria-label="Browse by locality"
          className="mt-14 border-t border-ink-100 pt-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
            {category.name} by locality
          </h2>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {localities.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/${citySlug}/${categorySlug}/in/${l.slug}`}
                  className="group inline-flex items-baseline gap-1.5 text-sm text-ink-600 transition-colors hover:text-ink-900"
                >
                  <span className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-brand-500">
                    {l.name}
                  </span>
                  <span className="font-display text-xs tabular-nums text-ink-300">
                    {l.storeCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(result.items, `${category.name} in ${city.name}`),
          ...(result.total > 0 ? [faqSchema(faqs)] : []),
        ]}
      />
      </Container>
    </>
  );
}

/** Masthead figure. Large numeral, quiet label — the way a guide states facts. */
function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-3xl font-extrabold leading-none tabular-nums tracking-tight text-white sm:text-4xl">
        {value}
      </dd>
      {hint ? <p className="mt-1 text-xs text-white/35">{hint}</p> : null}
    </div>
  );
}
