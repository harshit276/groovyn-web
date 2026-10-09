import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { StoreGrid } from "@/components/store-grid";
import { Container } from "@/components/ui/container";
import { VisitOfferNote } from "@/components/visit-offer-note";
import { guidesForCategory } from "@/content/blog";
import { getLocalities, getLocality, listStores } from "@/lib/queries";
import { rankStores } from "@/lib/ranking";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { openGraphFor } from "@/lib/seo";
import { joinList } from "@/lib/seo-content";
import { getCategory, MIN_SHOPS_TO_INDEX_LOCALITY } from "@/lib/site";
import type { StoreSort } from "@/lib/types";

// Reads `searchParams` for sort and pagination, so it can't be prerendered.
// See the note in ../../page.tsx.
//
// Locality pages are the long tail: "tailors in Lajpat Nagar" is the query that
// actually converts, and it's where a directory beats a horizontal like
// Justdial. They're dynamic for now; making them cacheable means moving the
// sort/page controls into a client component.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/[category]/in/[locality]">): Promise<Metadata> {
  const {
    city: citySlug,
    category: categorySlug,
    locality: localitySlug,
  } = await params;

  const locality = await getLocality(citySlug, localitySlug);
  const category = getCategory(categorySlug);
  if (!locality || !category) return {};

  const { total } = await listStores({
    city: citySlug,
    category: categorySlug,
    locality: localitySlug,
    perPage: 1,
  });

  const noun = (total === 1 ? category.singular : category.name).toLowerCase();
  const title = `${category.name} in ${locality.name}, ${locality.city.name}${
    total ? `: ${total} ${total === 1 ? "Shop" : "Shops"}` : ""
  }`;
  // Describes only what the page has: addresses, Google ratings, starting prices
  // where known. It does not promise photos or price lists, which most listings
  // do not have yet.
  const description = `${total} ${noun} in ${locality.name}, ${locality.city.name}: addresses, Google ratings and starting prices where known, with free visit booking.`;

  const url = `/${citySlug}/${categorySlug}/in/${localitySlug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: openGraphFor({ title, description, url }),
    // A page with a single shop repeats that shop's own page. Keep it reachable
    // for visitors, and keep passing links, but out of the index.
    robots:
      total < MIN_SHOPS_TO_INDEX_LOCALITY
        ? { index: false, follow: true }
        : undefined,
  };
}

export default async function LocalityPage({
  params,
  searchParams,
}: PageProps<"/[city]/[category]/in/[locality]">) {
  const {
    city: citySlug,
    category: categorySlug,
    locality: localitySlug,
  } = await params;
  const sp = await searchParams;

  const locality = await getLocality(citySlug, localitySlug);
  const category = getCategory(categorySlug);
  if (!locality || !category) notFound();

  const str = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const [result, everyShop, allAreas] = await Promise.all([
    listStores({
      city: citySlug,
      category: categorySlug,
      locality: localitySlug,
      sort: (str(sp.sort) as StoreSort) ?? "relevance",
      page: Number(str(sp.page) ?? "1") || 1,
    }),
    // For the intro, which describes the whole area and not just this page of it.
    listStores({
      city: citySlug,
      category: categorySlug,
      locality: localitySlug,
      perPage: 48,
    }),
    getLocalities(citySlug, categorySlug),
  ]);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: locality.city.name, href: `/${citySlug}` },
    { name: category.name, href: `/${citySlug}/${categorySlug}` },
    {
      name: locality.name,
      href: `/${citySlug}/${categorySlug}/in/${localitySlug}`,
    },
  ];

  const basePath = `/${citySlug}/${categorySlug}/in/${localitySlug}`;
  const flatParams = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );

  // Intro built from this area's own data. The top-rated sentence appears only
  // when a shop here actually has a Google rating, and a single rating is said
  // to be just that.
  const noun = (result.total === 1 ? category.singular : category.name).toLowerCase();
  const rated = rankStores(everyShop.items, "rating").filter(
    (s) => s.googleRating != null
  );
  const best = rated[0];
  const ratingSentence = best
    ? ` ${best.name} has the highest Google rating here, ${best.googleRating?.toFixed(1)}${
        best.googleRatingCount
          ? ` from ${best.googleRatingCount.toLocaleString("en-IN")} reviews`
          : ""
      }${rated.length < everyShop.items.length ? `, though only ${rated.length} of the ${everyShop.items.length} shops listed here have a rating so far` : ""}.`
    : "";

  const nearby = allAreas
    .filter((a) => a.slug !== localitySlug)
    .sort((a, b) => b.storeCount - a.storeCount || a.name.localeCompare(b.name))
    .slice(0, 8);

  const guides = guidesForCategory(categorySlug).slice(0, 3);

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

          <p
            className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: category.accent }}
          >
            {locality.name} · {locality.city.name}
          </p>

          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl">
            {category.name} in {locality.name}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
            Groovyn lists {result.total} {noun} in {locality.name},{" "}
            {locality.city.name}.{ratingSentence} Each listing shows the address,
            Google rating and a starting price where we have one, and you can
            book a visit for free. Shops cannot pay to rank higher.
          </p>
        </div>
      </section>

      <Container className="py-10">
        <VisitOfferNote stores={everyShop.items} />

        <StoreGrid
          result={result}
          basePath={basePath}
          searchParams={flatParams}
        />

        <p className="mt-10">
          <Link
            href={`/${citySlug}/${categorySlug}`}
            className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-[3px] hover:text-brand-700"
          >
            See all {category.name.toLowerCase()} in {locality.city.name}
          </Link>
        </p>

        {nearby.length ? (
          <nav
            aria-label={`Other areas with ${category.name.toLowerCase()}`}
            className="mt-12 border-t border-ink-100 pt-8"
          >
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-950">
              {category.name} in other areas
            </h2>
            <p className="mt-1.5 text-sm text-ink-500">
              {joinList(nearby.slice(0, 3).map((a) => a.name))} and more.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {nearby.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/${citySlug}/${categorySlug}/in/${a.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900 ring-1 ring-ink-200 transition-colors hover:bg-ink-950 hover:text-white hover:ring-ink-950"
                  >
                    {a.name}
                    <span className="rounded-full bg-ink-100 px-1.5 text-xs font-bold text-ink-500">
                      {a.storeCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {guides.length ? (
          <section className="mt-14 border-t border-ink-100 pt-10">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-950">
              Guides to read first
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {guides.map((g) => (
                <PostCard key={g.slug} post={g} />
              ))}
            </div>
          </section>
        ) : null}

        <JsonLd
          data={[
            breadcrumbSchema(crumbs),
            itemListSchema(
              result.items,
              `${category.name} in ${locality.name}, ${locality.city.name}`
            ),
          ]}
        />
      </Container>
    </>
  );
}
