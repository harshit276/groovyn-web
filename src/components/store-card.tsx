import { BadgeCheck, Clock, Home, MapPin, ReceiptText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getCategory } from "@/lib/site";
import type { StoreSummaryDTO } from "@/lib/types";
import { cn, formatPriceRange } from "@/lib/utils";

export function StoreCard({
  store,
  className,
  priority = false,
}: {
  store: StoreSummaryDTO;
  className?: string;
  priority?: boolean;
}) {
  const category = getCategory(store.category);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-paper-300 bg-paper-50 transition-shadow hover:shadow-[0_12px_40px_-16px_rgb(20_27_45_/_0.35)]",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-200">
        {store.coverImage ? (
          <Image
            src={store.coverImage}
            alt={`${store.name} — ${category?.singular ?? "store"} in ${
              store.locality?.name ?? store.city.name
            }`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {store.rateCardVerified ? (
            <Badge variant="rateCard">
              <ReceiptText aria-hidden className="size-3" />
              Rate card
            </Badge>
          ) : null}
          {store.verified ? (
            <Badge variant="verified">
              <BadgeCheck aria-hidden className="size-3" />
              Verified
            </Badge>
          ) : null}
        </div>

        {category ? (
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-1 w-full"
            style={{ backgroundColor: category.accent }}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg leading-snug text-ink-900">
          {/* Stretched link keeps the whole card clickable without nesting anchors. */}
          <Link href={store.href} className="after:absolute after:inset-0">
            {store.name}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          {store.locality?.name ?? store.city.name}
          {store.locality ? `, ${store.city.name}` : null}
        </p>

        {store.specialities.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {store.specialities.slice(0, 3).map((s) => (
              <li key={s}>
                <Badge variant="outline">{s}</Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3 border-t border-paper-300 pt-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-400">
                Typical range
              </p>
              <p className="font-medium text-ink-900">
                {formatPriceRange(store.priceMin, store.priceMax)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs text-ink-500">
              {store.turnaroundDays ? (
                <span className="flex items-center gap-1">
                  <Clock aria-hidden className="size-3.5" />
                  {store.turnaroundDays === 0
                    ? "Same day"
                    : `${store.turnaroundDays}d`}
                </span>
              ) : null}
              {store.homeVisit ? (
                <span className="flex items-center gap-1 text-brass-700">
                  <Home aria-hidden className="size-3.5" />
                  Home visit
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
