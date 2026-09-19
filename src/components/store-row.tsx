import {
  CalendarClock,
  Clock,
  DoorOpen,
  Gift,
  Home,
  MapPin,
  ReceiptText,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SaveButton } from "@/components/save-button";
import { StoreCover } from "@/components/store-cover";
import { isPlacesRef, resolveStoreImage } from "@/lib/images";
import { getCategory } from "@/lib/site";
import type { StoreSummaryDTO } from "@/lib/types";
import { cn, formatPriceRange } from "@/lib/utils";

/**
 * Listing row: photo left, details right, two actions at the foot.
 *
 * "Visit store" leads with a door because arriving at a shop page raises the
 * shutter — the icon is a promise the next screen keeps. It is the primary of
 * the pair; booking is the narrower intent and sits beside it.
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
  const turnaround = store.turnaroundDays;
  const cover = resolveStoreImage(store.coverImage, 400);
  const accent = category?.accent ?? "var(--color-brand-500)";

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-100 transition-all duration-500",
        "hover:-translate-y-1 hover:shadow-3d-lg hover:ring-transparent",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `0 22px 55px -30px ${accent}` }}
      />

      <div className="relative w-[38%] shrink-0 overflow-hidden sm:w-[34%]">
        {cover ? (
          <Image
            src={cover}
            alt={`${store.name} — ${category?.singular ?? "store"} in ${
              store.locality?.name ?? store.city.name
            }`}
            fill
            sizes="(max-width: 640px) 40vw, 240px"
            priority={priority}
            unoptimized={isPlacesRef(store.coverImage)}
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
          />
        ) : (
          <StoreCover
            name={store.name}
            slug={store.slug}
            category={store.category}
            className="size-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
          />
        )}

        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" />

        {category ? (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm"
            style={{ backgroundColor: accent }}
          >
            {category.singular}
          </span>
        ) : null}

        <div className="absolute inset-x-2 bottom-2 flex flex-wrap items-center gap-1">
          {store.googleRating != null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-ink-900 shadow-sm">
              <Star aria-hidden className="size-2.5 fill-amber-400 text-amber-400" />
              {store.googleRating.toFixed(1)}
              <span className="sr-only">on Google</span>
            </span>
          ) : null}
          {store.visitOffer ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow-sm">
              <Gift aria-hidden className="size-2.5" />
              Offer
            </span>
          ) : null}
          {store.rateCardVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <ReceiptText aria-hidden className="size-2.5" />
              Prices
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 font-display text-base font-extrabold leading-snug tracking-tight text-ink-950 sm:text-lg">
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

          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500 sm:text-sm">
            <span className="flex items-center gap-1">
              <MapPin aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">
                {store.locality?.name ?? store.city.name}
              </span>
            </span>
            {turnaround != null ? (
              <>
                <span aria-hidden className="size-1 rounded-full bg-ink-200" />
                <span className="flex items-center gap-1">
                  <Clock aria-hidden className="size-3.5 shrink-0" />
                  {turnaround === 0 ? "Same day" : `${turnaround} days`}
                </span>
              </>
            ) : null}
            {store.homeVisit ? (
              <>
                <span aria-hidden className="size-1 rounded-full bg-ink-200" />
                <span className="flex items-center gap-1 font-medium text-brand-600">
                  <Home aria-hidden className="size-3.5 shrink-0" />
                  Home visit
                </span>
              </>
            ) : null}
          </p>

          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
              From
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-ink-950 sm:text-lg">
              {formatPriceRange(store.priceMin, store.priceMax)}
            </span>
          </div>
        </div>

        {/* Both sit above the stretched link so each stays separately clickable. */}
        <div className="relative z-10 flex gap-2">
          <Link
            href={store.href}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-950 px-2 text-xs font-bold text-white transition-all hover:gap-2.5 sm:text-sm"
          >
            <DoorOpen aria-hidden className="size-3.5" />
            Visit store
          </Link>
          <Link
            href={`${store.href}#book`}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-ink-200 px-2 text-xs font-bold text-ink-900 transition-colors hover:border-ink-950 hover:bg-ink-50 sm:text-sm"
          >
            <CalendarClock aria-hidden className="size-3.5" />
            Book visit
          </Link>
        </div>
      </div>
    </article>
  );
}
