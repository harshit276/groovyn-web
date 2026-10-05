import type { MetadataRoute } from "next";

import { POSTS } from "@/content/blog";
import {
  getAllLocalityPaths,
  getAllStorePaths,
  getCategoryCounts,
  getCities,
  getServicePriceIndex,
  getServices,
  listStores,
} from "@/lib/queries";
import {
  absoluteUrl,
  CATEGORIES,
  MIN_SHOPS_TO_INDEX_CATEGORY,
  MIN_SHOPS_TO_INDEX_LOCALITY,
  MIN_SHOPS_TO_INDEX_SERVICE,
} from "@/lib/site";

/**
 * The old site had no sitemap at all, so nothing past the homepage was
 * discoverable. Every indexable surface belongs here; /search is excluded
 * because it's noindex by design.
 *
 * Google caps a sitemap at 50,000 URLs. Well within that today — split with
 * generateSitemaps() once store count passes ~10k.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, services, storePaths, localityPaths] = await Promise.all([
    getCities(),
    getServices(),
    getAllStorePaths(),
    getAllLocalityPaths(MIN_SHOPS_TO_INDEX_LOCALITY),
  ]);

  const now = new Date();

  // Shop counts per city and category, so a thin page is never advertised.
  const countsByCity = new Map(
    await Promise.all(
      cities.map(async (c) => [c.slug, await getCategoryCounts(c.slug)] as const)
    )
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: new Date(POSTS[0]?.dateModified ?? now), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/measurements"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/claim"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/suggest"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((c) => ({
    url: absoluteUrl(`/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // City × category — the highest-value commercial pages on the site. Only the
  // ones with real depth: the page itself is `noindex` below the same threshold,
  // and a sitemap must never list a page that says not to index it.
  const categoryPages: MetadataRoute.Sitemap = cities.flatMap((c) =>
    CATEGORIES.filter(
      (cat) =>
        (countsByCity.get(c.slug)?.[cat.slug] ?? 0) >= MIN_SHOPS_TO_INDEX_CATEGORY
    ).map((cat) => ({
      url: absoluteUrl(`/${c.slug}/${cat.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }))
  );

  // The long tail: "tailors in Lajpat Nagar".
  const localityPages: MetadataRoute.Sitemap = localityPaths.map((l) => ({
    url: absoluteUrl(`/${l.city}/${l.category}/in/${l.locality}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const storePages: MetadataRoute.Sitemap = storePaths.map((s) => ({
    url: absoluteUrl(`/${s.city}/${s.category}/${s.store}`),
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Guides carry their real modified date. A sitemap that stamps every URL with
  // "now" teaches Google to ignore lastmod, which throws away a free freshness
  // signal for the pages that genuinely change.
  const blogPages: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.dateModified),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // The price index is only indexable for the city the benchmarks were
  // researched in. The other cities would repeat the same figures under a
  // different name, so they are noindex and stay out of the sitemap.
  const priceIndexPages: MetadataRoute.Sitemap = cities[0]
    ? [
        {
          url: absoluteUrl(`/${cities[0].slug}/prices`),
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
      ]
    : [];

  // A service page is only worth indexing once shops offer the service. The
  // page itself is `noindex` below the same threshold.
  const serviceTotals = await Promise.all(
    services.map(
      async (s) =>
        [s.slug, (await listStores({ service: s.slug, perPage: 1 })).total] as const
    )
  );
  const servicePages: MetadataRoute.Sitemap = serviceTotals
    .filter(([, total]) => total >= MIN_SHOPS_TO_INDEX_SERVICE)
    .map(([slug]) => ({
      url: absoluteUrl(`/services/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Only list price pages backed by real shop-supplied rate cards. Without them
  // every city renders the same national benchmark, and we would be submitting
  // dozens of near-duplicate thin pages — the fastest way to make Google
  // discount the whole domain. These reappear automatically as cards come in.
  const priceCandidates = await Promise.all(
    cities.flatMap((c) =>
      services.map(async (s) => {
        const index = await getServicePriceIndex(c.slug, s.slug);
        return index.sampleSize > 0
          ? {
              url: absoluteUrl(`/${c.slug}/prices/${s.slug}`),
              lastModified: now,
              changeFrequency: "weekly" as const,
              priority: 0.8,
            }
          : null;
      })
    )
  );
  const pricePages: MetadataRoute.Sitemap = priceCandidates.filter(
    (p): p is NonNullable<typeof p> => p !== null
  );

  return [
    ...staticPages,
    ...cityPages,
    ...categoryPages,
    ...localityPages,
    ...storePages,
    ...servicePages,
    ...priceIndexPages,
    ...pricePages,
    ...blogPages,
  ];
}
