import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { StoreGrid } from "@/components/store-grid";
import { Container } from "@/components/ui/container";
import { getLocality, listStores } from "@/lib/queries";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { getCategory } from "@/lib/site";
import type { StoreSort } from "@/lib/types";

// Reads `searchParams` for sort and pagination, so it can't be prerendered.
// See the note in ../../page.tsx.
//
// Locality pages are the long tail — "tailors in Lajpat Nagar" is the query
// that actually converts, and it's where a directory beats a horizontal like
// Justdial. They're dynamic for now; making them cacheable means moving the
// sort/page controls into a client component.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/[category]/in/[locality]">): Promise<Metadata> {
  const {
    city: citySlug,
    category: categorySlug,
    locality: localitySlug,
  } = await params;

  const locality = await getLocality(citySlug, localitySlug);
  const category = getCategory(categorySlug);
  if (!locality || !category) return {};

  const { total } = await listStores({
    city: citySlug,
    category: categorySlug,
    locality: localitySlug,
    perPage: 1,
  });

  const title = `${category.name} in ${locality.name}, ${locality.city.name}${
    total ? ` — ${total} ${total === 1 ? "Shop" : "Shops"}` : ""
  }`;
  const description = `${category.name} in ${locality.name}, ${locality.city.name} with price lists, photos and timings. ${category.blurb}. Compare before you visit.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${citySlug}/${categorySlug}/in/${localitySlug}`,
    },
    openGraph: {
      title,
      description,
      url: `/${citySlug}/${categorySlug}/in/${localitySlug}`,
    },
  };
}

export default async function LocalityPage({
  params,
  searchParams,
}: PageProps<"/[city]/[category]/in/[locality]">) {
  const {
    city: citySlug,
    category: categorySlug,
    locality: localitySlug,
  } = await params;
  const sp = await searchParams;

  const locality = await getLocality(citySlug, localitySlug);
  const category = getCategory(categorySlug);
  if (!locality || !category) notFound();

  const str = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const result = await listStores({
    city: citySlug,
    category: categorySlug,
    locality: localitySlug,
    sort: (str(sp.sort) as StoreSort) ?? "relevance",
    page: Number(str(sp.page) ?? "1") || 1,
  });

  const crumbs = [
    { name: "Home", href: "/" },
    { name: locality.city.name, href: `/${citySlug}` },
    { name: category.name, href: `/${citySlug}/${categorySlug}` },
    {
      name: locality.name,
      href: `/${citySlug}/${categorySlug}/in/${localitySlug}`,
    },
  ];

  const basePath = `/${citySlug}/${categorySlug}/in/${localitySlug}`;
  const flatParams = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );

  return (
    <Container className="py-10">
      <Breadcrumbs crumbs={crumbs} />

      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl text-ink-900 sm:text-4xl">
          {category.name} in {locality.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          {result.total} {result.total === 1 ? "shop" : "shops"} in{" "}
          {locality.name}, {locality.city.name}. Prices, photos and timings —
          shortlist before you walk the market.
        </p>
      </header>

      <StoreGrid
        result={result}
        basePath={basePath}
        searchParams={flatParams}
      />

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          itemListSchema(
            result.items,
            `${category.name} in ${locality.name}, ${locality.city.name}`
          ),
        ]}
      />
    </Container>
  );
}
