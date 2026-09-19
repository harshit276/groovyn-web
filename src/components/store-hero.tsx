import {
  BadgeCheck,
  CalendarClock,
  MapPin,
  Store as StoreIcon,
} from "lucide-react";
import Image from "next/image";

import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { GoogleRating } from "@/components/google-rating";
import { ShopStatus } from "@/components/shop-status";
import { StoreCover } from "@/components/store-cover";
import { Badge } from "@/components/ui/badge";
import { getCategory } from "@/lib/site";
import type { StoreDetailDTO } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";
import { isPlacesRef, resolveStoreImage } from "@/lib/images";

/**
 * The arrival. A directory row and a shopfront are different experiences, and
 * the difference is mostly this: something full-bleed to walk into, the shop's
 * name at a size that says it matters, and — the thing no listings site shows
 * — whether the shutter is actually up right now.
 */
export function StoreHero({
  store,
  crumbs,
}: {
  store: StoreDetailDTO;
  crumbs: Crumb[];
}) {
  const category = getCategory(store.category);
  const hero = store.images[0];
  const heroSrc = resolveStoreImage(hero?.url, 1600);

  return (
    <section
      data-dark-hero
      className="relative isolate -mt-20 overflow-hidden bg-ink-950 pt-20"
    >
      <div className="absolute inset-0 -z-10">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={hero!.alt}
            fill
            priority
            sizes="100vw"
            unoptimized={isPlacesRef(hero?.url)}
            className="scale-105 object-cover"
          />
        ) : (
          <StoreCover
            name={store.name}
            slug={store.slug}
            category={store.category}
            className="size-full"
            showMonogram={false}
          />
        )}
        {/* Weight the bottom so the name always has something to sit on. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/40" />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(80% 60% at 15% 100%, rgba(25,118,210,0.35), transparent 60%)",
          }}
        />
      </div>

      <div className="mx-auto flex min-h-[24rem] max-w-7xl flex-col justify-end px-5 py-10 sm:min-h-[30rem] sm:px-8 lg:px-12">
        <div className="[&_a:hover]:text-brand-300 [&_a]:text-white/60 [&_li]:text-white/55 [&_span]:text-white/80">
          <Breadcrumbs crumbs={crumbs} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{
              color: category?.accent,
              borderColor: `color-mix(in srgb, ${category?.accent} 40%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${category?.accent} 12%, transparent)`,
            }}
          >
            {category?.singular}
            {store.establishedYear ? ` · since ${store.establishedYear}` : null}
          </span>
          <ShopStatus hours={store.openingHours} />
        </div>

        <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
          {store.name}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/70">
          <span className="flex items-center gap-1.5 text-sm">
            <MapPin aria-hidden className="size-4 text-brand-300" />
            {store.locality ? `${store.locality.name}, ` : ""}
            {store.city.name}
          </span>

          {store.googleRating != null ? (
            <GoogleRating
              rating={store.googleRating}
              count={store.googleRatingCount}
              mapsUri={store.googleMapsUri}
              variant="pill"
            />
          ) : null}

          {store.turnaroundDays ? (
            <span className="flex items-center gap-1.5 text-sm">
              <CalendarClock aria-hidden className="size-4 text-brand-300" />
              {store.turnaroundDays === 0
                ? "Same day"
                : `~${store.turnaroundDays} day turnaround`}
            </span>
          ) : null}

          {store.materials.length ? (
            <span className="flex items-center gap-1.5 text-sm">
              <StoreIcon aria-hidden className="size-4 text-brand-300" />
              {store.materials.slice(0, 3).join(" · ")}
            </span>
          ) : null}
        </div>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-t border-white/10 pt-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Typical range
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {formatPriceRange(store.priceMin, store.priceMax)}
            </p>
          </div>

          {store.rateCardVerified || store.verified || store.claimed ? (
            <div className="flex flex-wrap gap-2">
              {store.rateCardVerified ? (
                <Badge variant="rateCard">Rate card from the shop</Badge>
              ) : null}
              {store.verified ? (
                <Badge variant="verified">
                  <BadgeCheck aria-hidden className="size-3" />
                  Details verified
                </Badge>
              ) : null}
              {store.claimed ? <Badge variant="dark">Owner managed</Badge> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
