import { Info, ReceiptText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { PriceItemDTO } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";

/**
 * The rate card is the whole product. Nobody else publishes what a tailor
 * charges, so this table has to be unambiguous about where each number came
 * from — a shop-supplied price and our own estimate must never look alike.
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
      <div className="rounded-card border border-dashed border-paper-400 bg-paper-50 p-6 text-center">
        <p className="text-ink-600">
          No rate card yet for {storeName}.
        </p>
        <p className="mt-1 text-sm text-ink-500">
          We&apos;re collecting it. Know their prices?{" "}
          <Link href="/suggest" className="text-brass-700 underline">
            Tell us
          </Link>
          .
        </p>
      </div>
    );
  }

  const hasEstimates = items.some((i) => i.source === "estimate");

  return (
    <div className="overflow-hidden rounded-card border border-paper-300 bg-paper-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-300 bg-paper-100 px-4 py-3">
        <h3 className="flex items-center gap-2 text-base text-ink-900">
          <ReceiptText aria-hidden className="size-4 text-brass-600" />
          Price list
        </h3>
        {verified ? (
          <Badge variant="rateCard">Shared by the shop</Badge>
        ) : (
          <Badge variant="estimate">Indicative estimate</Badge>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-sm">
          <caption className="sr-only">
            Price list for {storeName}
          </caption>
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink-400">
              <th scope="col" className="px-4 py-2 font-medium">
                Service
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-paper-200 align-top"
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-normal text-ink-800"
                >
                  <span className="font-medium text-ink-900">{item.label}</span>
                  {item.note ? (
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {item.note}
                    </span>
                  ) : null}
                  {item.source === "estimate" ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink-400">
                      <Info aria-hidden className="size-3" />
                      Estimated, not confirmed by the shop
                    </span>
                  ) : null}
                </th>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <span className="font-medium text-ink-900">
                    {formatPriceRange(item.priceMin, item.priceMax)}
                  </span>
                  <span className="block text-xs text-ink-400">
                    {item.unit}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-paper-200 bg-paper-100 px-4 py-2.5 text-xs text-ink-500">
        {hasEstimates
          ? "Estimated prices are our own research and may differ from what the shop quotes. Always confirm before ordering."
          : "Prices shared by the shop. Fabric is usually charged separately unless stated."}
      </p>
    </div>
  );
}
