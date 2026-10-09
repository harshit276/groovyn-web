import { Globe, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PriceItemDTO } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";

/**
 * The prices we have for this one shop, each marked with where it came from. A
 * number the shop gave us, a number the shop publishes on its own website, and
 * our own estimate must never look alike, so each row says which it is.
 *
 * It renders nothing for a shop with no prices at all: the store page shows
 * <TypicalPrices> instead, which says what such a shop typically charges in the
 * city rather than leaving an empty box.
 */
export function RateCard({
  items,
  verified,
}: {
  items: PriceItemDTO[];
  verified: boolean;
}) {
  if (!items.length) return null;

  const hasEstimates = items.some((i) => i.source === "estimate");
  const hasWebsite = items.some((i) => i.source === "website");

  return (
    <div className="overflow-hidden rounded-card border border-ink-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Price list</h2>
          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-400">
            {items.length} {items.length === 1 ? "service" : "services"}
          </p>
        </div>
        {verified ? (
          <Badge variant="rateCard">Shared by the shop</Badge>
        ) : hasWebsite && !hasEstimates ? (
          <Badge variant="verified">From the shop’s website</Badge>
        ) : (
          <Badge variant="estimate">Indicative estimate</Badge>
        )}
      </div>

      <ul className="divide-y divide-ink-100">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-4 transition-colors hover:bg-ground sm:px-6"
          >
            <span className="font-display text-lg leading-snug text-ink-900">
              {item.label}
            </span>

            {/* Leader rule, the way a menu joins a dish to its price. */}
            <span
              aria-hidden
              className="mx-1 hidden min-w-8 flex-1 translate-y-[-0.25rem] border-b border-dotted border-ink-200 sm:block"
            />

            <span className="ml-auto text-right sm:ml-0">
              <span className="font-display text-lg font-semibold text-ink-900 tabular-nums">
                {formatPriceRange(item.priceMin, item.priceMax)}
              </span>
              <span className="ml-1.5 text-xs text-ink-400">{item.unit}</span>
            </span>

            {item.note || item.source === "estimate" || item.source === "website" ? (
              <span className="w-full">
                {item.note ? (
                  <span className="block text-sm text-ink-500">{item.note}</span>
                ) : null}
                {item.source === "estimate" ? (
                  <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-400">
                    <Info aria-hidden className="size-3" />
                    Estimated — not confirmed by the shop
                  </span>
                ) : null}
                {item.source === "website" && !item.note ? (
                  <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-400">
                    <Globe aria-hidden className="size-3" />
                    Listed on the shop’s website
                  </span>
                ) : null}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="border-t border-ink-100 bg-ground px-5 py-3 text-xs leading-relaxed text-ink-500 sm:px-6">
        {hasEstimates
          ? "Estimated prices come from our own research and may differ from what the shop quotes. Prices marked as listed on the shop’s website are its own, on the date shown, and may have changed. Always confirm before ordering."
          : hasWebsite
            ? "These are prices the shop lists on its own website, on the date shown. They can change, and made-to-measure work is often quoted separately. Always confirm with the shop before ordering."
            : "Prices shared by the shop. Fabric is usually charged separately unless stated."}
      </p>
    </div>
  );
}
