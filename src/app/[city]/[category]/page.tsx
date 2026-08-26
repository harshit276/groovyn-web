import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
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
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { getCategory } from "@/lib/site";
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

  const title = `${count > 0 ? `${count} ` : ""}Best ${category.name} in ${city.name} — Prices & Reviews`;
  const description = `Compare ${category.name.toLowerCase()} in ${city.name} with real price lists, specialities and photos. ${category.blurb}. No spam calls, no paid rankings.`;

  return {
    title,
    description,
    alternates: { canonical: `/${citySlug}/${categorySlug}` },
    openGraph: { title, description, url: `/${citySlug}/${categorySlug}` },
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
    <Container className="py-10">
      <Breadcrumbs crumbs={crumbs} />

      {/* ── Editorial masthead ──────────────────────────────────
          A guide opens with a statement and a set of figures. A listings
          site opens with a filter rail. That difference is most of why
          this page used to feel generic. */}
      <header className="mb-8">
        <p
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: category.accent }}
        >
          {city.name} · Guide
        </p>
        <h1 className="max-w-4xl text-4xl leading-[1.02] text-ink-900 sm:text-6xl lg:text-7xl">
          {category.name} in {city.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
          {category.blurb}. Every listing shows what the shop charges where we
          have it — so you can shortlist before you spend a Saturday walking
          markets.
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-ink-900/12 pt-6 sm:grid-cols-4">
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
      </header>

      {localities.length ? (
        <nav aria-label="Popular localities" className="mb-8">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-900/12 pt-5">
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
        view={str(sp.view) === "index" ? "index" : "gallery"}
      />

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(result.items, `${category.name} in ${city.name}`),
        ]}
      />
    </Container>
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
      <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-400">
        {label}
      </dt>
      <dd className="mt-1 font-display text-3xl leading-none tabular-nums text-ink-900">
        {value}
      </dd>
      {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}
