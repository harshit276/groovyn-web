import { Info, ReceiptText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { PriceItemDTO } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";

/**
 * The rate card is the whole product. Nobody else publishes what a tailor
 * charges, so this is styled as a menu rather than a data table — and it has to
 * be unambiguous about where each number came from. A shop-supplied price and
 * our own estimate must never look alike.
 */
export function RateCard({
  items,
  storeName,
  verified,
}: {
  items: PriceItemDTO[];
  storeName: string;
  verified: boolean;
}) {
  if (!items.length) {
    return (
      <div className="rounded-card border border-dashed border-paper-400 bg-paper-50 px-6 py-10 text-center">
        <ReceiptText aria-hidden className="mx-auto mb-3 size-5 text-paper-500" />
        <p className="font-display text-xl text-ink-800">
          No price list yet for {storeName}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
          We&apos;re collecting rate cards shop by shop. If you know what they
          charge,{" "}
          <Link href="/suggest" className="text-brass-700 underline underline-offset-2">
            tell us
          </Link>{" "}
          and we&apos;ll add it.
        </p>
      </div>
    );
  }

  const hasEstimates = items.some((i) => i.source === "estimate");

  return (
    <div className="overflow-hidden rounded-card border border-paper-300 bg-paper-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-300 px-6 py-5">
        <div>
          <h2 className="font-display text-2xl text-ink-900">Price list</h2>
          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-400">
            {items.length} {items.length === 1 ? "service" : "services"}
          </p>
        </div>
        {verified ? (
          <Badge variant="rateCard">Shared by the shop</Badge>
        ) : (
          <Badge variant="estimate">Indicative estimate</Badge>
        )}
      </div>

      <ul className="divide-y divide-paper-200">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-6 py-4 transition-colors hover:bg-paper-100"
          >
            <span className="font-display text-lg leading-snug text-ink-900">
              {item.label}
            </span>

            {/* Leader rule, the way a menu joins a dish to its price. */}
            <span
              aria-hidden
              className="mx-1 hidden min-w-8 flex-1 translate-y-[-0.25rem] border-b border-dotted border-paper-400 sm:block"
            />

            <span className="ml-auto text-right sm:ml-0">
              <span className="font-display text-lg font-semibold text-ink-900 tabular-nums">
                {formatPriceRange(item.priceMin, item.priceMax)}
              </span>
              <span className="ml-1.5 text-xs text-ink-400">{item.unit}</span>
            </span>

            {item.note || item.source === "estimate" ? (
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
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="border-t border-paper-200 bg-paper-100 px-6 py-3 text-xs leading-relaxed text-ink-500">
        {hasEstimates
          ? "Estimated prices come from our own research and may differ from what the shop quotes. Always confirm before ordering."
          : "Prices shared by the shop. Fabric is usually charged separately unless stated."}
      </p>
    </div>
  );
}
