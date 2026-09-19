import { ArrowUpRight, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Container } from "@/components/ui/container";
import { getCities, getServices } from "@/lib/queries";
import { breadcrumbSchema } from "@/lib/schema";
import { CATEGORIES } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[city]/prices">): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = (await getCities()).find((c) => c.slug === citySlug);
  if (!city) return {};

  const title = `Custom Clothing Prices in ${city.name} (${new Date().getFullYear()})`;
  const description = `What stitching, tailoring, boutique work and rentals actually cost in ${city.name} — a price index built from rate cards published by local shops.`;

  return {
    title,
    description,
    alternates: { canonical: `/${citySlug}/prices` },
    openGraph: { title, description, url: `/${citySlug}/prices` },
  };
}

/**
 * The price index for a city.
 *
 * This is the page the whole product argues for: not "here are shops", but
 * "here is what the work costs". Services are grouped by vertical so a
 * visitor can scan the one they came for, and every row is a doorway into the
 * per-service page that names the shops behind the number.
 */
export default async function CityPricesPage({
  params,
}: PageProps<"/[city]/prices">) {
  const { city: citySlug } = await params;

  // getCities returns the DTO, which carries storeCount; getCity returns the
  // raw row and does not.
  const [cities, services] = await Promise.all([getCities(), getServices()]);
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) notFound();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${citySlug}` },
    { name: "Prices", href: `/${citySlug}/prices` },
  ];

  // Group by vertical, keeping CATEGORIES' order so the page reads the same
  // way the nav does.
  const grouped = CATEGORIES.map((c) => ({
    category: c,
    services: services.filter((s) => s.category === c.slug),
  })).filter((g) => g.services.length > 0);

  const priced = services.filter((s) => s.benchmarkMin != null).length;

  return (
    <>
      <section
        data-dark-hero
        className="mesh-dark grain relative isolate -mt-20 overflow-hidden pt-20"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="[&_a:hover]:text-brand-300 [&_a]:text-white/55 [&_li]:text-white/50 [&_span]:text-white/75">
            <Breadcrumbs crumbs={crumbs} />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-300">
            Price index · {city.name}
          </p>

          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
            What should it cost?
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
            Typical {city.name} rates for stitching, tailoring, boutique work
            and rentals. Every number opens onto the shops behind it.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/12 pt-7 sm:grid-cols-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Services tracked
              </dt>
              <dd className="mt-1.5 font-display text-3xl font-extrabold tabular-nums tracking-tight text-white sm:text-4xl">
                {services.length}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                With a published range
              </dt>
              <dd className="mt-1.5 font-display text-3xl font-extrabold tabular-nums tracking-tight text-white sm:text-4xl">
                {priced}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Shops in {city.name}
              </dt>
              <dd className="mt-1.5 font-display text-3xl font-extrabold tabular-nums tracking-tight text-white sm:text-4xl">
                {city.storeCount}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="space-y-14">
          {grouped.map(({ category, services: list }) => (
            <section key={category.slug}>
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-100 pb-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: category.accent }}
                  />
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
                    {category.name}
                  </h2>
                </div>
                <Link
                  href={`/${citySlug}/${category.slug}`}
                  className="text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
                >
                  Browse {category.name.toLowerCase()} →
                </Link>
              </div>

              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/${citySlug}/prices/${s.slug}`}
                      className="group relative flex h-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-card transition-all duration-300 hover:border-transparent hover:shadow-3d"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                        style={{ backgroundColor: category.accent }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink-800">
                          {s.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-400">
                          {s.benchmarkMin != null && s.benchmarkMax != null
                            ? `${formatINR(s.benchmarkMin)} – ${formatINR(s.benchmarkMax)}`
                            : "Range being collected"}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="font-display text-base font-extrabold tracking-tight text-ink-950">
                          {s.benchmarkMin != null
                            ? `${formatINR(s.benchmarkMin)}+`
                            : "—"}
                        </span>
                        <ArrowUpRight
                          aria-hidden
                          className="size-4 text-ink-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-14 flex items-start gap-2.5 rounded-2xl border border-ink-100 bg-ink-50 px-5 py-4 text-sm leading-relaxed text-ink-600">
          <ReceiptText aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <span>
            Ranges are indicative and move with fabric, fit and finish. Where a
            shop has given us its rate card we show that shop&apos;s own
            numbers on its page — always confirm before ordering.
          </span>
        </p>

        <JsonLd data={[breadcrumbSchema(crumbs)]} />
      </Container>
    </>
  );
}
