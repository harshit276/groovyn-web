import { ArrowUpRight, Home, ReceiptText } from "lucide-react";
import Link from "next/link";

import { getCategory } from "@/lib/site";
import type { StoreSummaryDTO } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";

/**
 * The index view — a magazine contents page rather than a grid of cards.
 *
 * This is the view that makes the site feel unlike a listings site. Cards are
 * good for browsing on a whim; an index is better when someone is comparing
 * fifteen tailors and actually wants to read across price, locality and
 * speciality. Nobody in this category offers it, and it costs nothing to build
 * because we already hold the data.
 */
export function StoreIndex({ stores }: { stores: StoreSummaryDTO[] }) {
  return (
    <ol className="border-t border-ink-900/12">
      {stores.map((store, i) => {
        const category = getCategory(store.category);
        return (
          <li
            key={store.id}
            className="group relative border-b border-ink-900/12 transition-colors hover:bg-paper-200/45"
          >
            <div className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-5 sm:grid-cols-[3rem_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto] sm:gap-x-6">
              {/* A numbered index reads as curation, not search results. */}
              <span className="font-display text-sm tabular-nums text-ink-300 sm:text-base">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <h3 className="font-display text-xl leading-tight text-ink-900 sm:text-2xl">
                  <Link
                    href={store.href}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {store.name}
                  </Link>
                </h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500 sm:hidden">
                  <span>{store.locality?.name ?? store.city.name}</span>
                  <span aria-hidden className="text-ink-300">
                    ·
                  </span>
                  <span className="text-ink-800">
                    {formatPriceRange(store.priceMin, store.priceMax)}
                  </span>
                </p>
              </div>

              <p className="hidden text-sm text-ink-600 sm:block">
                {store.locality?.name ?? store.city.name}
              </p>

              <p className="hidden min-w-0 truncate text-sm text-ink-500 sm:block">
                {store.specialities.slice(0, 2).join(", ") ||
                  category?.singular}
              </p>

              <div className="hidden items-center justify-end gap-4 sm:flex">
                <span className="text-right">
                  <span className="block font-display text-base tabular-nums text-ink-900">
                    {formatPriceRange(store.priceMin, store.priceMax)}
                  </span>
                  <span className="flex items-center justify-end gap-2 text-[11px] text-ink-400">
                    {store.rateCardVerified ? (
                      <span className="flex items-center gap-0.5 text-brass-700">
                        <ReceiptText aria-hidden className="size-3" />
                        rate card
                      </span>
                    ) : null}
                    {store.homeVisit ? (
                      <span className="flex items-center gap-0.5">
                        <Home aria-hidden className="size-3" />
                        home visit
                      </span>
                    ) : null}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 shrink-0 text-ink-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass-600"
                />
              </div>
            </div>

            {/* Category hairline that draws in on hover — the only ornament. */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-[-1px] h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
              style={{ backgroundColor: category?.accent }}
            />
          </li>
        );
      })}
    </ol>
  );
}
