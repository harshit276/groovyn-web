import { BadgeCheck, CalendarClock, MapPin, Store as StoreIcon } from "lucide-react";
import Image from "next/image";

import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { GoogleRating } from "@/components/google-rating";
import { StoreCover } from "@/components/store-cover";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { getCategory } from "@/lib/site";
import type { StoreDetailDTO } from "@/lib/types";

/**
 * The arrival. A directory row and a shopfront are different experiences, and
 * the difference is mostly this: something full-bleed to walk into, and the
 * shop's name at a size that says it matters.
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

  return (
    <section className="relative isolate overflow-hidden bg-ink-900">
      <div className="absolute inset-0 -z-10">
        {hero ? (
          <Image
            src={hero.url}
            alt={hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
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
        <div className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/70 to-ink-950/25" />
      </div>

      <Container className="flex min-h-[22rem] flex-col justify-end py-8 sm:min-h-[26rem]">
        <div className="[&_a]:text-white/70 [&_a:hover]:text-brand-300 [&_li]:text-white/65 [&_span]:text-white">
          <Breadcrumbs crumbs={crumbs} />
        </div>

        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: category?.accent }}
        >
          {category?.singular}
          {store.establishedYear ? ` · since ${store.establishedYear}` : null}
        </p>

        <h1 className="max-w-3xl text-4xl leading-[1.05] text-white sm:text-6xl">
          {store.name}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/85">
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

        {store.rateCardVerified || store.verified || store.claimed ? (
          <div className="mt-5 flex flex-wrap gap-2">
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
      </Container>
    </section>
  );
}
