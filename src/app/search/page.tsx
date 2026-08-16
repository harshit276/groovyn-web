import type { Metadata } from "next";

import { SearchBox } from "@/components/search-box";
import { StoreGrid } from "@/components/store-grid";
import { Container } from "@/components/ui/container";
import { getCities, listStores } from "@/lib/queries";
import type { StoreSort } from "@/lib/types";

// Search result pages must never be indexed — they generate near-infinite
// thin permutations, which is exactly how a directory tanks its own crawl budget.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const q = str(sp.q) ?? "";
  const city = str(sp.city);

  const [cities, result] = await Promise.all([
    getCities(),
    listStores({
      q: q || undefined,
      city,
      category: str(sp.category),
      sort: (str(sp.sort) as StoreSort) ?? "relevance",
      page: Number(str(sp.page) ?? "1") || 1,
    }),
  ]);

  const flatParams = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );

  return (
    <Container className="py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl text-ink-900 sm:text-4xl">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search"}
        </h1>
        <p className="mt-3 text-ink-600">
          {result.total} {result.total === 1 ? "shop" : "shops"} found
          {city ? ` in ${cities.find((c) => c.slug === city)?.name ?? city}` : ""}.
        </p>
        <div className="mt-6">
          <SearchBox cities={cities} defaultCity={city} defaultQuery={q} size="md" />
        </div>
      </header>

      <StoreGrid result={result} basePath="/search" searchParams={flatParams} />
    </Container>
  );
}
