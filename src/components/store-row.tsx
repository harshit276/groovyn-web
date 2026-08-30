import { CalendarClock, Clock, Home, MapPin, ReceiptText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GoogleRating } from "@/components/google-rating";
import { SaveButton } from "@/components/save-button";
import { StoreCover } from "@/components/store-cover";
import { getCategory } from "@/lib/site";
import type { StoreSummaryDTO } from "@/lib/types";
import { cn, formatPriceRange } from "@/lib/utils";

/**
 * The app's listing row: photo on the left, details on the right, and two
 * actions at the bottom — Book Now filled black, Visit Store outlined.
 *
 * The app's photo carries a hardcoded "4.5". Ours shows Google's real rating,
 * always attributed, plus whether the shop's prices are published.
 */
export function StoreRow({
  store,
  priority = false,
  className,
}: {
  store: StoreSummaryDTO;
  priority?: boolean;
  className?: string;
}) {
  const category = getCategory(store.category);
  const openingHours = store.turnaroundDays;

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-card bg-white shadow-card transition-shadow duration-300 hover:shadow-card-lg",
        className
      )}
    >
      {/* Photo — roughly the app's 3:4 split against the detail column. */}
      <div className="relative w-[38%] shrink-0 overflow-hidden sm:w-[34%]">
        {store.coverImage ? (
          <Image
            src={store.coverImage}
            alt={`${store.name} — ${category?.singular ?? "store"} in ${
              store.locality?.name ?? store.city.name
            }`}
            fill
            sizes="(max-width: 640px) 40vw, 240px"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <StoreCover
            name={store.name}
            slug={store.slug}
            category={store.category}
            className="size-full transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
          <GoogleRating
            rating={store.googleRating}
            count={store.googleRatingCount}
            mapsUri={store.googleMapsUri}
            variant="pill"
          />
          {store.rateCardVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <ReceiptText aria-hidden className="size-3" />
              Prices
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 font-display text-base font-bold leading-snug text-ink-900 sm:text-lg">
              <Link
                href={store.href}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                {store.name}
              </Link>
            </h3>
            <SaveButton
              slug={store.slug}
              name={store.name}
              className="relative z-10"
            />
          </div>

          <p className="mt-1 flex items-center gap-1 text-xs text-ink-500 sm:text-sm">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">
              {store.locality?.name ?? store.city.name}
            </span>
          </p>

          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 sm:text-sm">
            {openingHours ? (
              <span className="flex items-center gap-1">
                <Clock aria-hidden className="size-3.5 shrink-0" />
                {openingHours === 0 ? "Same day" : `${openingHours} days`}
              </span>
            ) : null}
            {store.homeVisit ? (
              <span className="flex items-center gap-1 text-brand-600">
                <Home aria-hidden className="size-3.5 shrink-0" />
                Home visit
              </span>
            ) : null}
          </p>

          <p className="mt-1.5 font-display text-sm font-bold text-ink-900 sm:text-base">
            {formatPriceRange(store.priceMin, store.priceMax)}
          </p>
        </div>

        {/* Both sit above the stretched link so each is separately clickable. */}
        <div className="relative z-10 flex gap-2">
          <Link
            href={`${store.href}#book`}
            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-md bg-ink-900 px-2 text-xs font-semibold text-white transition-colors hover:bg-ink-800 sm:text-sm"
          >
            <CalendarClock aria-hidden className="size-3.5" />
            Book Visit
          </Link>
          <Link
            href={store.href}
            className="flex h-8 flex-1 items-center justify-center rounded-md border border-ink-900 px-2 text-xs font-semibold text-ink-900 transition-colors hover:bg-ink-50 sm:text-sm"
          >
            Visit Store
          </Link>
        </div>
      </div>
    </article>
  );
}
