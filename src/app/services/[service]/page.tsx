import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { StoreCard } from "@/components/store-card";
import { Container, SectionHeading } from "@/components/ui/container";
import { getCities, getService, getServices, listStores } from "@/lib/queries";
import { breadcrumbSchema } from "@/lib/schema";
import { fitDescription, fitTitle, openGraphFor } from "@/lib/seo";
import { getCategory, MIN_SHOPS_TO_INDEX_SERVICE } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[service]">): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const service = await getService(serviceSlug);
  if (!service) return {};

  const title = fitTitle([
    `${service.name} in Delhi: Prices and Shops`,
    `${service.name} Prices in Delhi`,
  ]);

  const range =
    service.benchmarkMin && service.benchmarkMax
      ? ` Typical range ${formatINR(service.benchmarkMin)} to ${formatINR(service.benchmarkMax)}.`
      : "";
  const description = fitDescription(
    `${service.description ?? `${service.name} in Delhi NCR.`}${range} Compare shops and prices, then book a visit for free.`
  );

  // With fewer than a handful of shops offering it, this page is a title and a
  // price chip. Keep it reachable, keep it out of the index until it has depth.
  const { total } = await listStores({ service: serviceSlug, perPage: 1 });

  return {
    title,
    description,
    alternates: { canonical: `/services/${serviceSlug}` },
    openGraph: openGraphFor({
      title,
      description,
      url: `/services/${serviceSlug}`,
    }),
    robots:
      total < MIN_SHOPS_TO_INDEX_SERVICE
        ? { index: false, follow: true }
        : undefined,
  };
}

export default async function ServicePage({
  params,
}: PageProps<"/services/[service]">) {
  const { service: serviceSlug } = await params;
  const service = await getService(serviceSlug);
  if (!service) notFound();

  const category = getCategory(service.category);
  const [cities, stores] = await Promise.all([
    getCities(),
    listStores({ service: serviceSlug, sort: "relevance", perPage: 6 }),
  ]);

  const crumbs = [
    { name: "Home", href: "/" },
    ...(category && cities[0]
      ? [{ name: category.name, href: `/${cities[0].slug}/${category.slug}` }]
      : []),
    { name: service.name, href: `/services/${serviceSlug}` },
  ];

  return (
    <Container className="py-10">
      <Breadcrumbs crumbs={crumbs} />

      <header className="mb-10 max-w-3xl">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: category?.accent }}
        >
          {category?.name}
        </p>
        <h1 className="text-3xl text-ink-900 sm:text-4xl">{service.name}</h1>
        {service.description ? (
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            {service.description}
          </p>
        ) : null}
        {service.benchmarkMin && service.benchmarkMax ? (
          <p className="mt-4 inline-flex items-baseline gap-2 rounded-full bg-ink-50 px-4 py-2">
            <span className="text-sm text-ink-500">Typical range</span>
            <span className="font-display text-lg text-ink-900">
              {formatINR(service.benchmarkMin)} – {formatINR(service.benchmarkMax)}
            </span>
          </p>
        ) : null}
      </header>

      <section className="mb-14">
        <SectionHeading
          eyebrow="By city"
          title={`${service.name} prices near you`}
          description="Each city page shows an indicative range, and a shop’s own rate card where it has shared one."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}/prices/${serviceSlug}`}
              className="group flex items-center justify-between gap-4 rounded-card border border-ink-100 bg-white px-4 py-4 transition-colors hover:border-brand-300"
            >
              <span>
                <span className="block text-ink-900">{c.name}</span>
                <span className="text-xs text-ink-500">{c.state}</span>
              </span>
              <ArrowRight
                aria-hidden
                className="size-4 text-brand-500 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </section>

      {stores.items.length ? (
        <section>
          <SectionHeading eyebrow="Shops" title={`Offering ${service.name.toLowerCase()}`} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.items.map((s, i) => (
              <StoreCard key={s.id} store={s} priority={i < 3} />
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd data={breadcrumbSchema(crumbs)} />
    </Container>
  );
}
