import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { SearchBox } from "@/components/search-box";
import { StoreCard } from "@/components/store-card";
import { Container, SectionHeading } from "@/components/ui/container";
import {
  getCategoryCounts,
  getCities,
  getCity,
  getLocalities,
  getServices,
  listStores,
} from "@/lib/queries";
import { breadcrumbSchema } from "@/lib/schema";
import { CATEGORIES } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[city]">): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCity(citySlug);
  if (!city) return {};

  const title = `Tailors, Boutiques, Fabric & Rental Shops in ${city.name}`;
  const description =
    city.blurb ??
    `Find verified tailors, boutiques, fabric shops and rental stores across ${city.name}, with real price lists and photos.`;

  return {
    title,
    description,
    alternates: { canonical: `/${citySlug}` },
    openGraph: { title, description, url: `/${citySlug}` },
  };
}

const COVERS: Record<string, string> = {
  tailors: "/images/tailor.webp",
  boutiques: "/images/boutique.webp",
  "fabric-shops": "/images/fabric.webp",
  "rental-shops": "/images/rental.webp",
};

export default async function CityPage({ params }: PageProps<"/[city]">) {
  const { city: citySlug } = await params;
  const city = await getCity(citySlug);
  if (!city) notFound();

  const [cities, counts, featured, localities, services] = await Promise.all([
    getCities(),
    getCategoryCounts(citySlug),
    listStores({ city: citySlug, sort: "relevance", perPage: 6 }),
    getLocalities(citySlug),
    getServices("tailors"),
  ]);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${citySlug}` },
  ];

  return (
    <Container className="py-10">
      <Breadcrumbs crumbs={crumbs} />

      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl text-ink-900 sm:text-5xl">
          Custom clothing in {city.name}
        </h1>
        {city.blurb ? (
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            {city.blurb}
          </p>
        ) : null}
        <div className="mt-8">
          <SearchBox cities={cities} defaultCity={citySlug} size="md" />
        </div>
      </header>

      <section className="mb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${citySlug}/${c.slug}`}
              className="group relative overflow-hidden rounded-card border border-paper-300"
            >
              <div className="relative aspect-3/2">
                <Image
                  src={COVERS[c.slug]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink-950/85 to-ink-950/10" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span
                    aria-hidden
                    className="mb-2 block h-0.5 w-8"
                    style={{ backgroundColor: c.accent }}
                  />
                  <h2 className="font-display text-xl text-paper-50">{c.name}</h2>
                  <p className="text-sm text-brass-300">
                    {counts[c.slug] ?? 0} listed
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {localities.length ? (
        <section className="mb-16">
          <SectionHeading
            eyebrow="Neighbourhoods"
            title={`Browse ${city.name} by locality`}
          />
          <ul className="flex flex-wrap gap-2">
            {localities.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/${citySlug}/tailors/in/${l.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-paper-400 bg-paper-50 px-3.5 py-1.5 text-sm text-ink-700 transition-colors hover:border-brass-400 hover:text-ink-900"
                >
                  {l.name}
                  <span className="text-xs text-ink-400">{l.storeCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {featured.items.length ? (
        <section className="mb-16">
          <SectionHeading eyebrow="Featured" title={`Worth knowing in ${city.name}`} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((s, i) => (
              <StoreCard key={s.id} store={s} priority={i < 3} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeading
          eyebrow="Price transparency"
          title={`What things cost in ${city.name}`}
          description="Built from rate cards shops have shared with us."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 9).map((s) => (
            <Link
              key={s.slug}
              href={`/${citySlug}/prices/${s.slug}`}
              className="group flex items-center justify-between gap-4 rounded-card border border-paper-300 bg-paper-50 px-4 py-3.5 transition-colors hover:border-brass-400"
            >
              <span className="text-ink-800">{s.name}</span>
              <ArrowRight
                aria-hidden
                className="size-4 text-brass-600 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </section>

      <JsonLd data={breadcrumbSchema(crumbs)} />
    </Container>
  );
}
