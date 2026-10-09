import {
  AtSign,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { RateCard } from "@/components/rate-card";
import { StoreCard } from "@/components/store-card";
import { StoreGate } from "@/components/store-gate";
import { StoreHero } from "@/components/store-hero";
import { StoreTabs } from "@/components/store-tabs";
import { MobileBookBar } from "@/components/mobile-book-bar";
import { TypicalPrices } from "@/components/typical-prices";
import { VisitBooking } from "@/components/visit-booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/container";
import {
  getAllStorePaths,
  getServices,
  getSimilarStores,
  getStoreDetail,
} from "@/lib/queries";
import { breadcrumbSchema, storeSchema } from "@/lib/schema";
import { fitDescription, fitTitle } from "@/lib/seo";
import { getCategory } from "@/lib/site";

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
    ? ` ${store.rateCardVerified ? "Prices" : "Indicative prices"} from ₹${store.priceMin.toLocaleString("en-IN")}.`
    : "";

  // Shop names vary from "Kynaa" to "Roshan Tailors (House of Roshans)", so the
  // title steps down through shorter forms until one fits, and never cuts a name
  // in half to make room for a locality.
  const singular = category?.singular ?? "Store";
  const area = store.locality?.name ?? store.city.name;
  const title = fitTitle([
    `${store.name} — ${singular} in ${where}`,
    `${store.name} — ${singular} in ${area}`,
    `${store.name} — ${singular}, ${store.city.name}`,
    store.name,
  ]);

  // Says only what a listing reliably has. Most do not have photos or a rate
  // card yet, so neither is promised.
  const description = fitDescription(
    `${store.name}, ${where}. ${
      store.specialities.slice(0, 3).join(", ") || category?.blurb
    }.${priceHint} Address, contact details and free visit booking on Groovyn.`
  );

  return {
    title,
    description,
    alternates: { canonical: store.href },
    openGraph: {
      title,
      description,
      url: store.href,
      type: "website",
      // og:image comes from opengraph-image.tsx in this folder.
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
  const [similar, services] = await Promise.all([
    getSimilarStores(store),
    getServices(store.category),
  ]);

  // A shop with its own prices (given to us, or listed on its own website)
  // does not also need the city-wide ranges. A shop with none, or with only our
  // estimates, does.
  const hasOwnPrices = store.priceItems.some(
    (p) => p.source === "shop" || p.source === "menu" || p.source === "website"
  );
  const priceHints = [
    ...store.specialities,
    ...store.materials,
    store.about ?? "",
  ].join(" ");

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

  // One-tap chips on the booking form, taken from what this shop actually
  // prices rather than a generic list.
  const bookingSuggestions = [
    ...new Set(store.priceItems.map((p) => p.label)),
  ].slice(0, 5);

  return (
    <>
      <StoreGate
        storeName={store.name}
        category={category?.singular ?? "Shop"}
        accent={category?.accent ?? "#1976d2"}
      />

      <div className="gate-interior">
        <StoreHero store={store} crumbs={crumbs} />

        <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        {/* ── Main column ─────────────────────────────────────── */}
        {/* min-w-0: grid items default to min-width:auto, which lets the
            rate-card table's min-width push the whole page sideways. */}
        <div className="min-w-0">
          {/* Services / Gallery / Reviews, as the app lays it out. */}
          <StoreTabs
            tabs={[
              {
                id: "services",
                label: "Services",
                count: store.priceItems.length || undefined,
                panel: (
                  <div className="space-y-8">
                    {store.about ? (
                      <p className="max-w-2xl leading-relaxed text-ink-700">
                        {store.about}
                      </p>
                    ) : null}

                    {store.specialities.length || store.materials.length ? (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {store.specialities.length ? (
                          <div>
                            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                              Speciality
                            </h3>
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
                            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                              Works with
                            </h3>
                            <ul className="flex flex-wrap gap-1.5">
                              {store.materials.map((m) => (
                                <li key={m}>
                                  <Badge variant="outline">{m}</Badge>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <RateCard
                      items={store.priceItems}
                      verified={store.rateCardVerified}
                    />

                    {hasOwnPrices ? null : (
                      <TypicalPrices
                        services={services}
                        category={store.category}
                        categoryName={category?.name ?? "Shops"}
                        storeName={store.name}
                        cityName={store.city.name}
                        citySlug={store.city.slug}
                        hints={priceHints}
                        hasOwnPrices={store.priceItems.length > 0}
                      />
                    )}
                  </div>
                ),
              },
              {
                id: "gallery",
                label: "Gallery",
                count: store.images.length || undefined,
                panel: store.images.length ? (
                  <Gallery images={store.images} storeName={store.name} />
                ) : (
                  <p className="rounded-card border border-dashed border-ink-200 bg-white px-6 py-10 text-center text-ink-500">
                    No photos yet. We only publish pictures we&apos;ve taken
                    ourselves or been given permission to use.
                  </p>
                ),
              },
              {
                id: "reviews",
                label: "Reviews",
                panel: (
                  <p className="rounded-card border border-dashed border-ink-200 bg-white px-6 py-10 text-center text-ink-500">
                    No reviews yet.
                  </p>
                ),
              },
            ]}
          />

          <section className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
              <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink-950">
                <span className="grid size-8 place-items-center rounded-full bg-brand-50">
                  <Clock aria-hidden className="size-4 text-brand-600" />
                </span>
                Opening hours
              </h2>
              {/* An empty hours object means we never collected them — which is
                  not the same as the shop being shut. Rendering seven "Closed"
                  rows tells the visitor a trading business never opens. */}
              {Object.keys(store.openingHours).length ? (
                <dl className="space-y-1.5 text-sm">
                  {DAY_LABELS.map(([key, label]) => {
                    const value = store.openingHours[key];
                    const closed = !value || value === "closed";
                    return (
                      <div key={key} className="flex justify-between gap-4">
                        <dt className="text-ink-600">{label}</dt>
                        <dd className={closed ? "text-ink-400" : "text-ink-900"}>
                          {closed ? "Closed" : value.replace("-", " – ")}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              ) : (
                <p className="text-sm leading-relaxed text-ink-500">
                  Not published yet — please call the shop to confirm before
                  visiting.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
              <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink-950">
                <span className="grid size-8 place-items-center rounded-full bg-brand-50">
                  <MapPin aria-hidden className="size-4 text-brand-600" />
                </span>
                Address
              </h2>
              <address className="not-italic leading-relaxed text-ink-700">
                {store.address}
                {/* Researched addresses often already end in the pincode, so
                    only append it when it isn't there already. */}
                {store.pincode && !store.address.includes(store.pincode) ? (
                  <>
                    <br />
                    {store.pincode}
                  </>
                ) : null}
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
        {/* On a phone this comes first, booking before the other ways to
            reach the shop, because it was otherwise the last thing on a long
            page. From lg up it is the right-hand column, as before. */}
        <aside className="order-first min-w-0 lg:order-none lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-4">
            {/* The price range lives in the hero now — this card is purely
                the ways to reach the shop. */}
            <div className="order-2 rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:order-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                Reach the shop
              </p>

              {/* Two across on a phone, so the card stays short. An odd last
                  button takes the full row. */}
              <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
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

            {/* Anchor target for the listing card's "Book Visit" button, the
                phone's sticky bar, and the "book a free visit" links. */}
            <div id="book" className="order-1 scroll-mt-24 lg:order-2">
              <VisitBooking
                storeId={store.id}
                storeName={store.name}
                offersHomeVisit={store.homeVisit}
                homeVisitFee={store.homeVisitFee}
                source={`store:${store.slug}`}
                suggestions={bookingSuggestions}
                visitOffer={store.visitOffer}
                visitOfferTerms={store.visitOfferTerms}
              />
            </div>

            <p className="order-3 px-1 text-xs leading-relaxed text-ink-400">
              Something out of date on this page?{" "}
              <Link
                href="/contact"
                className="underline underline-offset-2 hover:text-ink-600"
              >
                Tell us
              </Link>
              .
            </p>
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
      </div>

      {/* Outside .gate-interior on purpose: that wrapper keeps a transform from
          its entrance animation, which would make this bar position itself
          against the whole page instead of the screen. */}
      <MobileBookBar phone={store.phone} storeName={store.name} />
    </>
  );
}
