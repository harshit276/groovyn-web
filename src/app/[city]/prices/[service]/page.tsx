import { Info } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { StoreGrid } from "@/components/store-grid";
import { Container, SectionHeading } from "@/components/ui/container";
import {
  getCities,
  getCity,
  getService,
  getServicePriceIndex,
  getServices,
  listStores,
} from "@/lib/queries";
import { breadcrumbSchema } from "@/lib/schema";
import { getCategory } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [cities, services] = await Promise.all([getCities(), getServices()]);
  return cities.flatMap((c) =>
    services.map((s) => ({ city: c.slug, service: s.slug }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[city]/prices/[service]">): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const [city, service] = await Promise.all([
    getCity(citySlug),
    getService(serviceSlug),
  ]);
  if (!city || !service) return {};

  const index = await getServicePriceIndex(citySlug, serviceSlug);
  const low = index.low ?? service.benchmarkMin;
  const high = index.high ?? service.benchmarkMax;

  const range =
    low && high ? ` — ₹${low.toLocaleString("en-IN")} to ₹${high.toLocaleString("en-IN")}` : "";

  const title = `${service.name} Price in ${city.name} (${new Date().getFullYear()})${range}`;
  const description = `What ${service.name.toLowerCase()} actually costs in ${city.name}, based on rate cards shared by local shops. Compare prices and find shops near you.`;

  // With no shop-supplied rate cards, every city falls back to the same national
  // benchmark — so /delhi/prices/x and /noida/prices/x would be identical thin
  // pages. Keep them out of the index until they carry real observed data;
  // they become indexable on their own once rate cards land.
  const indexable = index.sampleSize > 0;

  return {
    title,
    description,
    alternates: { canonical: `/${citySlug}/prices/${serviceSlug}` },
    openGraph: { title, description, url: `/${citySlug}/prices/${serviceSlug}` },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default async function PriceIndexPage({
  params,
}: PageProps<"/[city]/prices/[service]">) {
  const { city: citySlug, service: serviceSlug } = await params;

  const [city, service] = await Promise.all([
    getCity(citySlug),
    getService(serviceSlug),
  ]);
  if (!city || !service) notFound();

  const category = getCategory(service.category);
  const [index, stores] = await Promise.all([
    getServicePriceIndex(citySlug, serviceSlug),
    listStores({
      city: citySlug,
      category: service.category,
      service: serviceSlug,
      sort: "price_asc",
      perPage: 9,
    }),
  ]);

  // Fall back to the researched city benchmark when we don't yet have enough
  // shop-supplied cards to publish a real observed range.
  const usingBenchmark = index.sampleSize === 0;
  const low = index.low ?? service.benchmarkMin;
  const high = index.high ?? service.benchmarkMax;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${citySlug}` },
    { name: "Prices", href: `/${citySlug}/prices/${serviceSlug}` },
    { name: service.name, href: `/${citySlug}/prices/${serviceSlug}` },
  ];

  return (
    <Container className="py-10">
      <Breadcrumbs crumbs={crumbs} />

      <header className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
          Price index · {city.name}
        </p>
        <h1 className="text-3xl text-ink-900 sm:text-4xl">
          {service.name} price in {city.name}
        </h1>
        {service.description ? (
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            {service.description}
          </p>
        ) : null}
      </header>

      <section className="mb-12 overflow-hidden rounded-card border border-ink-100 bg-white">
        <div className="grid divide-y divide-ink-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="Typical low" value={low ? formatINR(low) : "—"} />
          <Stat
            label="Typical high"
            value={high ? formatINR(high) : "—"}
          />
          <Stat
            label={usingBenchmark ? "Rate cards collected" : "Based on"}
            value={
              usingBenchmark
                ? "0 so far"
                : `${index.sampleSize} rate card${index.sampleSize === 1 ? "" : "s"}`
            }
          />
        </div>

        <p className="flex items-start gap-2 border-t border-ink-100 bg-ground px-4 py-3 text-xs leading-relaxed text-ink-500">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {usingBenchmark
            ? `We haven't collected verified rate cards for ${service.name.toLowerCase()} in ${city.name} yet. The range above is our own market research and should be treated as indicative only.`
            : `Range built from ${index.sampleSize} price list${
                index.sampleSize === 1 ? "" : "s"
              } shared directly by shops in ${city.name}. Fabric is usually charged separately. Always confirm with the shop.`}
        </p>
      </section>

      {stores.items.length ? (
        <section>
          <SectionHeading
            eyebrow={category?.name ?? "Shops"}
            title={`Where to get ${service.name.toLowerCase()} in ${city.name}`}
            description="Sorted by starting price, lowest first."
          />
          <StoreGrid
            result={stores}
            basePath={`/${citySlug}/${service.category}`}
            searchParams={{ service: serviceSlug }}
          />
        </section>
      ) : null}

      <JsonLd data={breadcrumbSchema(crumbs)} />
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-6 text-center">
      <p className="text-xs uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1.5 font-display text-3xl text-ink-900">{value}</p>
    </div>
  );
}
