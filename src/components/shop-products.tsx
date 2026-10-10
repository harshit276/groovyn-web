import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import type { ShopProductDTO } from "@/lib/types";
import { formatINR } from "@/lib/utils";

/**
 * A few pieces from a shop's own online shop.
 *
 * Groovyn does not sell these and does not take payment. Each card goes to the
 * shop's own website, through /go/<id> so the tap can be counted. The block
 * says in plain words whose photos and prices these are, and when we read
 * them, because the visitor is about to leave for another site to pay.
 *
 * It only ever renders for a shop that has said yes: the query that fills
 * `products` returns nothing otherwise.
 */

/** Shopify's image CDN resizes on request. Anything else is used as it is. */
function sized(url: string, width: number): string {
  try {
    const u = new URL(url);
    if (u.hostname !== "cdn.shopify.com") return url;
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return url;
  }
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function ShopProducts({
  products,
  storeName,
  site,
}: {
  products: ShopProductDTO[];
  storeName: string;
  /** The shop's own website, as a bare host. */
  site: string | null;
}) {
  if (!products.length) return null;

  // Prices are all read in one pass, so the newest date is the date for all.
  const checked = products.reduce(
    (latest, p) => (p.checkedAt > latest ? p.checkedAt : latest),
    products[0].checkedAt
  );

  return (
    <section aria-labelledby="shop-products-title" className="space-y-5">
      <div>
        <h2
          id="shop-products-title"
          className="font-display text-2xl text-ink-900"
        >
          Pieces from {storeName}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">
          Shown with {storeName}’s permission. The photos, prices and stock
          are the shop’s own, as we read them on {longDate(checked)}. You buy
          on {site ?? "the shop’s website"}, not from Groovyn.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <a
              href={`/go/${p.id}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="group block h-full overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-3d"
            >
              <span className="relative block aspect-[4/5] overflow-hidden bg-ink-50">
                <Image
                  src={sized(p.imageUrl, 640)}
                  alt={`${p.title}, from ${storeName}`}
                  fill
                  sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 220px"
                  // The shop's own image host serves and resizes it.
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </span>
              <span className="block p-3.5">
                <span className="line-clamp-2 block text-sm font-medium leading-snug text-ink-900">
                  {p.title}
                </span>
                <span className="mt-1.5 block font-display text-base font-extrabold tabular-nums tracking-tight text-ink-950">
                  {formatINR(p.price)}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                  Buy on {site ?? "their website"}
                  <ArrowUpRight
                    aria-hidden
                    className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
