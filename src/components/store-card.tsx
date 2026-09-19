import {
  ArrowUpRight,
  Clock,
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
 * Grid card.
 *
 * Built to be scanned in a column of twelve: the photo does the selling, and
 * everything laid over it is a decision signal — rating, whether prices are
 * published, whether they come to you. The category accent tints the hover
 * bloom, so a mixed grid stays readable by colour alone.
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
  const cover = resolveStoreImage(store.coverImage, feature ? 800 : 640);
  const accent = category?.accent ?? "var(--color-brand-500)";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-100 transition-all duration-500",
        "hover:-translate-y-1.5 hover:shadow-3d-lg hover:ring-transparent",
        className
      )}
    >
      {/* Category-tinted bloom, only on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `0 24px 60px -28px ${accent}` }}
      />

      <div
        className={cn(
          "relative overflow-hidden",
          feature ? "aspect-[16/10]" : "aspect-[4/3]"
        )}
      >
        {cover ? (
          <Image
            src={cover}
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
            // Places photos are proxied per view and must not be persisted
            // as optimised copies on our side.
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

        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* Top rail: vertical + save. */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {category ? (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm"
              style={{ backgroundColor: accent }}
            >
              {category.singular}
            </span>
          ) : (
            <span />
          )}
          <SaveButton
            slug={store.slug}
            name={store.name}
            className="relative z-10 bg-white/85 backdrop-blur-sm hover:bg-white"
          />
        </div>

        {/* Bottom rail: rating plus the two signals people actually filter on. */}
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5">
          {store.googleRating != null ? (
            <a
              href={store.googleMapsUri ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink-900 shadow-sm"
              title={`Rated ${store.googleRating} on Google`}
            >
              <Star aria-hidden className="size-3 fill-amber-400 text-amber-400" />
              {store.googleRating.toFixed(1)}
              {store.googleRatingCount ? (
                <span className="font-medium text-ink-400">
                  ({store.googleRatingCount.toLocaleString("en-IN")})
                </span>
              ) : null}
              <span className="sr-only">on Google</span>
            </a>
          ) : null}

          {/* Only ever shown when the shop actually gave us an offer. */}
          {store.visitOffer ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-sm">
              <Gift aria-hidden className="size-3" />
              Visit offer
            </span>
          ) : null}

          {store.rateCardVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <ReceiptText aria-hidden className="size-3" />
              Prices listed
            </span>
          ) : null}

          {store.homeVisit ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <Home aria-hidden className="size-3" />
              Home visit
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className={cn(
            "font-display font-extrabold leading-tight tracking-tight text-ink-950",
            feature ? "text-2xl sm:text-3xl" : "text-lg"
          )}
        >
          <Link
            href={store.href}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {store.name}
          </Link>
        </h3>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink-500">
          <span className="flex items-center gap-1">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            {store.locality?.name ?? store.city.name}
          </span>
          {store.turnaroundDays != null ? (
            <>
              <span aria-hidden className="size-1 rounded-full bg-ink-200" />
              <span className="flex items-center gap-1">
                <Clock aria-hidden className="size-3.5 shrink-0" />
                {store.turnaroundDays === 0
                  ? "Same day"
                  : `${store.turnaroundDays} days`}
              </span>
            </>
          ) : null}
        </p>

        {feature && store.about ? (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-600">
            {store.about}
          </p>
        ) : null}

        {store.specialities.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {store.specialities.slice(0, feature ? 4 : 2).map((s) => (
              <li
                key={s}
                className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-600"
              >
                {s}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3 pt-4">
          <div className="min-w-0">
            {/* Only label it a starting price when there is one — "Starting
                from: On request" is nonsense. */}
            {store.priceMin != null ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                Starting from
              </p>
            ) : null}
            <p className="truncate font-display text-xl font-extrabold tracking-tight text-ink-950">
              {formatPriceRange(store.priceMin, store.priceMax)}
            </p>
          </div>

          <span
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold text-white transition-all duration-500 group-hover:gap-2.5"
            style={{ backgroundColor: accent }}
          >
            View shop
            <ArrowUpRight aria-hidden className="size-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
