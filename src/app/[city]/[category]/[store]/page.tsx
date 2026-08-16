import {
  AtSign,
  BadgeCheck,
  CalendarClock,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  Store as StoreIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { RateCard } from "@/components/rate-card";
import { StoreCard } from "@/components/store-card";
import { VisitBooking } from "@/components/visit-booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/container";
import { getAllStorePaths, getSimilarStores, getStoreDetail } from "@/lib/queries";
import { breadcrumbSchema, storeSchema } from "@/lib/schema";
import { getCategory } from "@/lib/site";
import { formatPriceRange } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const paths = await getAllStorePaths();
  return paths.map((p) => ({
    city: p.city,
    category: p.category,
    store: p.store,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[city]/[category]/[store]">): Promise<Metadata> {
  const { store: storeSlug } = await params;
  const store = await getStoreDetail(storeSlug);
  if (!store) return {};

  const category = getCategory(store.category);
  const where = store.locality
    ? `${store.locality.name}, ${store.city.name}`
    : store.city.name;

  const priceHint = store.priceMin
    ? ` Prices from ₹${store.priceMin.toLocaleString("en-IN")}.`
    : "";

  const title = `${store.name} — ${category?.singular ?? "Store"} in ${where}`;
  const description = `${store.name}, ${where}. ${
    store.specialities.slice(0, 3).join(", ") || category?.blurb
  }.${priceHint} Photos, price list, timings and contact details on Groovyn.`;

  return {
    title,
    description,
    alternates: { canonical: store.href },
    openGraph: {
      title,
      description,
      url: store.href,
      type: "website",
      images: store.coverImage
        ? [{ url: store.coverImage, width: 1200, height: 630, alt: store.name }]
        : undefined,
    },
  };
}

const DAY_LABELS: [string, string][] = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
];

export default async function StorePage({
  params,
}: PageProps<"/[city]/[category]/[store]">) {
  const { city: citySlug, category: categorySlug, store: storeSlug } = await params;

  const store = await getStoreDetail(storeSlug);
  // Guard against a store being reachable under the wrong city/category path,
  // which would otherwise create duplicate URLs for one listing.
  if (
    !store ||
    store.city.slug !== citySlug ||
    store.category !== categorySlug
  ) {
    notFound();
  }

  const category = getCategory(store.category);
  const similar = await getSimilarStores(store);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: store.city.name, href: `/${citySlug}` },
    { name: category?.name ?? categorySlug, href: `/${citySlug}/${categorySlug}` },
    ...(store.locality
      ? [
          {
            name: store.locality.name,
            href: `/${citySlug}/${categorySlug}/in/${store.locality.slug}`,
          },
        ]
      : []),
    { name: store.name, href: store.href },
  ];

  const waNumber = store.whatsapp?.replace(/[^0-9]/g, "");

  return (
    <Container className="py-10">
      <Breadcrumbs crumbs={crumbs} />

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        {/* ── Main column ─────────────────────────────────────── */}
        {/* min-w-0: grid items default to min-width:auto, which lets the
            rate-card table's min-width push the whole page sideways. */}
        <div className="min-w-0">
          <header className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {store.rateCardVerified ? (
                <Badge variant="rateCard">Rate card shared by shop</Badge>
              ) : null}
              {store.verified ? (
                <Badge variant="verified">
                  <BadgeCheck aria-hidden className="size-3" />
                  Details verified
                </Badge>
              ) : null}
              {store.claimed ? <Badge variant="dark">Owner managed</Badge> : null}
            </div>

            <h1 className="text-3xl text-ink-900 sm:text-4xl">{store.name}</h1>

            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-600">
              <span className="flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4 text-ink-400" />
                {store.locality ? `${store.locality.name}, ` : ""}
                {store.city.name}
              </span>
              {store.establishedYear ? (
                <span className="flex items-center gap-1.5">
                  <StoreIcon aria-hidden className="size-4 text-ink-400" />
                  Since {store.establishedYear}
                </span>
              ) : null}
              {store.turnaroundDays ? (
                <span className="flex items-center gap-1.5">
                  <CalendarClock aria-hidden className="size-4 text-ink-400" />
                  {store.turnaroundDays === 0
                    ? "Same day"
                    : `~${store.turnaroundDays} day turnaround`}
                </span>
              ) : null}
            </p>
          </header>

          <Gallery images={store.images} storeName={store.name} />

          {store.about ? (
            <section className="mt-8">
              <h2 className="mb-3 text-xl text-ink-900">About</h2>
              <p className="leading-relaxed text-ink-700">{store.about}</p>
            </section>
          ) : null}

          {store.specialities.length || store.materials.length ? (
            <section className="mt-8 grid gap-6 sm:grid-cols-2">
              {store.specialities.length ? (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">
                    Speciality
                  </h2>
                  <ul className="flex flex-wrap gap-1.5">
                    {store.specialities.map((s) => (
                      <li key={s}>
                        <Badge>{s}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {store.materials.length ? (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">
                    Works with
                  </h2>
                  <ul className="flex flex-wrap gap-1.5">
                    {store.materials.map((m) => (
                      <li key={m}>
                        <Badge variant="outline">{m}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="mt-10">
            <RateCard
              items={store.priceItems}
              storeName={store.name}
              verified={store.rateCardVerified}
            />
          </section>

          <section className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-card border border-paper-300 bg-paper-50 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base text-ink-900">
                <Clock aria-hidden className="size-4 text-brass-600" />
                Opening hours
              </h2>
              <dl className="space-y-1.5 text-sm">
                {DAY_LABELS.map(([key, label]) => {
                  const value = store.openingHours[key];
                  return (
                    <div key={key} className="flex justify-between gap-4">
                      <dt className="text-ink-600">{label}</dt>
                      <dd
                        className={
                          !value || value === "closed"
                            ? "text-ink-400"
                            : "text-ink-900"
                        }
                      >
                        {!value || value === "closed"
                          ? "Closed"
                          : value.replace("-", " – ")}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <div className="rounded-card border border-paper-300 bg-paper-50 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base text-ink-900">
                <MapPin aria-hidden className="size-4 text-brass-600" />
                Address
              </h2>
              <address className="not-italic leading-relaxed text-ink-700">
                {store.address}
                {store.pincode ? <><br />{store.pincode}</> : null}
              </address>
              {store.mapUrl ? (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <a href={store.mapUrl} target="_blank" rel="noopener noreferrer">
                    Get directions
                    <ExternalLink aria-hidden />
                  </a>
                </Button>
              ) : null}
            </div>
          </section>
        </div>

        {/* ── Sticky sidebar ──────────────────────────────────── */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            <div className="rounded-card border border-paper-300 bg-paper-50 p-5">
              <p className="text-xs uppercase tracking-wider text-ink-400">
                Typical range
              </p>
              <p className="mt-1 font-display text-2xl text-ink-900">
                {formatPriceRange(store.priceMin, store.priceMax)}
              </p>

              <div className="mt-4 grid gap-2">
                {store.phone ? (
                  <Button asChild variant="primary">
                    <a href={`tel:${store.phone.replace(/\s/g, "")}`}>
                      <Phone aria-hidden />
                      Call the shop
                    </a>
                  </Button>
                ) : null}

                {waNumber ? (
                  <Button asChild variant="whatsapp">
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `Hi, I found ${store.name} on Groovyn and wanted to ask about your services.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle aria-hidden />
                      WhatsApp
                    </a>
                  </Button>
                ) : null}

                {store.website ? (
                  <Button asChild variant="outline">
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <Globe aria-hidden />
                      Website
                    </a>
                  </Button>
                ) : null}

                {store.instagram ? (
                  <Button asChild variant="ghost">
                    <a
                      href={store.instagram}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <AtSign aria-hidden />
                      Instagram
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            <VisitBooking
              storeId={store.id}
              storeName={store.name}
              offersHomeVisit={store.homeVisit}
              homeVisitFee={store.homeVisitFee}
              source={`store:${store.slug}`}
            />

            {!store.claimed ? (
              <div className="rounded-card border border-dashed border-brass-400/60 bg-brass-200/20 p-5">
                <h2 className="text-base text-ink-900">Is this your shop?</h2>
                <p className="mt-1.5 text-sm text-ink-600">
                  Claim the listing to update photos, prices and timings. Free,
                  and always will be.
                </p>
                <Button asChild variant="brass" size="sm" className="mt-4 w-full">
                  <Link href={`/claim?store=${store.slug}`}>
                    Claim this listing
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {similar.length ? (
        <section className="mt-16">
          <SectionHeading
            eyebrow="Nearby"
            title={`Other ${category?.name.toLowerCase() ?? "stores"} around ${
              store.locality?.name ?? store.city.name
            }`}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd data={[storeSchema(store), breadcrumbSchema(crumbs)]} />
    </Container>
  );
}
