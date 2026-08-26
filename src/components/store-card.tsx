import { BadgeCheck, Clock, Home, MapPin, ReceiptText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StoreCover } from "@/components/store-cover";
import { Badge } from "@/components/ui/badge";
import { getCategory } from "@/lib/site";
import type { StoreSummaryDTO } from "@/lib/types";
import { cn, formatPriceRange } from "@/lib/utils";

export function StoreCard({
  store,
  className,
  priority = false,
  /** Feature tiles run wider and taller in the editorial grid. */
  feature = false,
}: {
  store: StoreSummaryDTO;
  className?: string;
  priority?: boolean;
  feature?: boolean;
}) {
  const category = getCategory(store.category);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-paper-300 bg-paper-50",
        "transition-[transform,box-shadow] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-24px_rgb(20_27_45_/_0.45)]",
        "focus-within:-translate-y-0.5 focus-within:shadow-[0_18px_50px_-24px_rgb(20_27_45_/_0.45)]",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          feature ? "aspect-[16/10]" : "aspect-4/5"
        )}
      >
        {store.coverImage ? (
          <Image
            src={store.coverImage}
            alt={`${store.name} — ${category?.singular ?? "store"} in ${
              store.locality?.name ?? store.city.name
            }`}
            fill
            sizes={
              feature
                ? "(max-width: 640px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <StoreCover
            name={store.name}
            slug={store.slug}
            category={store.category}
            className="size-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        )}

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
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
            style={{ backgroundColor: category.accent }}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p
          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: category?.accent }}
        >
          {category?.singular}
        </p>

        <h3
          className={cn(
            "leading-[1.15] text-ink-900",
            feature ? "text-2xl sm:text-3xl" : "text-xl"
          )}
        >
          <Link
            href={store.href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {store.name}
          </Link>
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          {store.locality?.name ?? store.city.name}
        </p>

        {feature && store.about ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">
            {store.about}
          </p>
        ) : null}

        {store.specialities.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {store.specialities.slice(0, feature ? 4 : 2).map((s) => (
              <li key={s}>
                <Badge variant="outline">{s}</Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-paper-300 pt-3.5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
                Typical range
              </p>
              <p className="font-display text-lg leading-tight text-ink-900">
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
