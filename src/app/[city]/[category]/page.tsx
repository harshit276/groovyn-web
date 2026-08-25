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

  return (
    <Container className="py-10">
      <Breadcrumbs crumbs={crumbs} />

      <header className="mb-10 max-w-3xl">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: category.accent }}
        >
          {city.name}
        </p>
        <h1 className="text-3xl text-ink-900 sm:text-4xl">
          {category.name} in {city.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          {category.blurb}. Every listing below shows what the shop charges
          where we have it — so you can shortlist before you spend a Saturday
          walking markets.
        </p>
      </header>

      {localities.length ? (
        <nav aria-label="Popular localities" className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
            By locality
          </h2>
          <ul className="flex flex-wrap gap-2">
            {localities.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/${citySlug}/${categorySlug}/in/${l.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-paper-400 bg-paper-50 px-3.5 py-1.5 text-sm text-ink-700 transition-colors hover:border-brass-400 hover:text-ink-900"
                >
                  {l.name}
                  <span className="text-xs text-ink-400">{l.storeCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside className="order-2 lg:order-1">
          <StoreFilters
            localities={localities}
            services={services}
            specialities={specialities}
            total={result.total}
          />
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <StoreGrid
            result={result}
            basePath={basePath}
            searchParams={flatParams}
          />
        </div>
      </div>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(result.items, `${category.name} in ${city.name}`),
        ]}
      />
    </Container>
  );
}
