import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { StoreCard } from "@/components/store-card";
import { StoreIndex } from "@/components/store-index";
import { StoreRow } from "@/components/store-row";
import { Button } from "@/components/ui/button";
import type { Paginated, StoreSummaryDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StoreGrid({
  result,
  basePath,
  searchParams,
  view = "list",
}: {
  result: Paginated<StoreSummaryDTO>;
  /** Path to build pagination links from, e.g. "/delhi/tailors". */
  basePath: string;
  /** Current query string values to preserve across pages. */
  searchParams: Record<string, string | undefined>;
  /**
   * "list" is the app's row card (photo left, details and actions right) and is
   * the default. "gallery" is the photo-card grid, "index" the typographic one.
   */
  view?: "list" | "gallery" | "index";
}) {
  if (!result.items.length) {
    return (
      <div className="rounded-card border border-dashed border-ink-200 bg-white p-10 text-center">
        <h2 className="text-xl text-ink-900">Nothing matches yet</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-600">
          We&apos;re still adding shops in this area. Try widening your filters,
          or tell us who we&apos;re missing.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/suggest">Suggest a shop</Link>
        </Button>
      </div>
    );
  }

  function pageHref(page: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  // Lead the first page with one wide tile. A grid of identically sized cards
  // reads as a spreadsheet however nice the cards are; one break in the rhythm
  // is enough to make the page feel edited rather than generated.
  const lead = result.page === 1 && result.items.length >= 3;

  const pagination =
    result.totalPages > 1 ? (
      <nav
        aria-label="Pagination"
        className="mt-10 flex items-center justify-center gap-2"
      >
        {result.page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={pageHref(result.page - 1)} rel="prev">
              Previous
            </Link>
          </Button>
        ) : null}

        <span className="px-3 text-sm text-ink-500">
          Page {result.page} of {result.totalPages}
        </span>

        {result.page < result.totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={pageHref(result.page + 1)} rel="next">
              Next
            </Link>
          </Button>
        ) : null}
      </nav>
    ) : null;

  if (view === "index") {
    return (
      <>
        <StoreIndex stores={result.items} />
        {pagination}
      </>
    );
  }

  if (view === "list") {
    return (
      <>
        <div className="grid gap-4 lg:grid-cols-2">
          {result.items.map((store, i) => (
            <Reveal key={store.id} delay={Math.min(i, 5) * 50} className="flex">
              <StoreRow store={store} priority={i < 4} className="w-full" />
            </Reveal>
          ))}
        </div>
        {pagination}
      </>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((store, i) => (
          <Reveal
            key={store.id}
            delay={Math.min(i, 5) * 60}
            className={cn(
              "flex",
              lead && i === 0 && "sm:col-span-2"
            )}
          >
            <StoreCard
              store={store}
              priority={i < 3}
              feature={lead && i === 0}
              className="w-full"
            />
          </Reveal>
        ))}
      </div>

      {pagination}
    </>
  );
}
