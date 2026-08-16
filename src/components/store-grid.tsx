import Link from "next/link";

import { StoreCard } from "@/components/store-card";
import { Button } from "@/components/ui/button";
import type { Paginated, StoreSummaryDTO } from "@/lib/types";

export function StoreGrid({
  result,
  basePath,
  searchParams,
}: {
  result: Paginated<StoreSummaryDTO>;
  /** Path to build pagination links from, e.g. "/delhi/tailors". */
  basePath: string;
  /** Current query string values to preserve across pages. */
  searchParams: Record<string, string | undefined>;
}) {
  if (!result.items.length) {
    return (
      <div className="rounded-card border border-dashed border-paper-400 bg-paper-50 p-10 text-center">
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

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((store, i) => (
          <StoreCard key={store.id} store={store} priority={i < 3} />
        ))}
      </div>

      {result.totalPages > 1 ? (
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
      ) : null}
    </>
  );
}
