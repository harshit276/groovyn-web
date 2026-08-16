import type { MetadataRoute } from "next";

import {
  getAllLocalityPaths,
  getAllStorePaths,
  getCities,
  getServices,
} from "@/lib/queries";
import { absoluteUrl, CATEGORIES } from "@/lib/site";

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
    getAllLocalityPaths(),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/claim"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/suggest"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((c) => ({
    url: absoluteUrl(`/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // City × category — the highest-value commercial pages on the site.
  const categoryPages: MetadataRoute.Sitemap = cities.flatMap((c) =>
    CATEGORIES.map((cat) => ({
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

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: absoluteUrl(`/services/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const pricePages: MetadataRoute.Sitemap = cities.flatMap((c) =>
    services.map((s) => ({
      url: absoluteUrl(`/${c.slug}/prices/${s.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  return [
    ...staticPages,
    ...cityPages,
    ...categoryPages,
    ...localityPages,
    ...storePages,
    ...servicePages,
    ...pricePages,
  ];
}
