import { Clock, Home, MapPin, ReceiptText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SaveButton } from "@/components/save-button";
import { StoreCover } from "@/components/store-cover";
import { getCategory } from "@/lib/site";
import type { StoreSummaryDTO } from "@/lib/types";
import { cn, formatPriceRange } from "@/lib/utils";

/**
 * Store card, matched to the Android app: white card, rounded corners, soft
 * shadow, photo on top with a dark pill overlay, then name / locality / hours.
 * The app's heart sits on the card too — here it saves a shop locally rather
 * than to an account, since the web app has no login.
 */
export function StoreCard({
  store,
  className,
  priority = false,
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
        "group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow duration-300 hover:shadow-card-lg",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          feature ? "aspect-[16/10]" : "aspect-[4/3]"
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

        {/* The app puts its rating pill bottom-right over the photo. We have no
            ratings, so the same slot carries the thing we do have that nobody
            else does: whether the shop's prices are published. */}
        <div className="absolute bottom-2.5 right-2.5 flex gap-1.5">
          {store.rateCardVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <ReceiptText aria-hidden className="size-3" />
              Prices listed
            </span>
          ) : null}
          {store.homeVisit ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <Home aria-hidden className="size-3" />
              Home visit
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "font-display font-bold leading-snug text-ink-900",
              feature ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
            )}
          >
            <Link
              href={store.href}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {store.name}
            </Link>
          </h3>
          {/* Sits above the stretched link so the heart stays clickable. */}
          <SaveButton slug={store.slug} name={store.name} className="relative z-10" />
        </div>

        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          {store.locality?.name ?? store.city.name}
        </p>

        {feature && store.about ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-600">
            {store.about}
          </p>
        ) : null}

        {store.turnaroundDays ? (
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
            <Clock aria-hidden className="size-3.5 shrink-0" />
            {store.turnaroundDays === 0
              ? "Same day"
              : `${store.turnaroundDays} day turnaround`}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="font-display text-lg font-bold text-ink-900">
            {formatPriceRange(store.priceMin, store.priceMax)}
          </p>
          {category ? (
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: category.accent }}
            >
              {category.singular}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
