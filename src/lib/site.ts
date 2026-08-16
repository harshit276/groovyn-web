/** Single source of truth for anything that ends up in metadata or structured data. */
export const site = {
  name: "Groovyn",
  tagline: "Custom clothing, decoded",
  description:
    "Find verified tailors, boutiques, fabric shops and rental stores across Delhi NCR — with real rate cards, real work photos, and no spam calls.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://groovyn.com",
  ogImage: "/og/default.png",
  email: "info@groovyn.com",
  phone: "+917891467209",
  locale: "en_IN",
  sameAs: [
    "https://www.instagram.com/groovyn",
    "https://twitter.com/groovyn",
  ],
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

/**
 * The four verticals. Order here drives nav, the home grid and sitemap priority.
 * `schemaType` maps each to the closest schema.org LocalBusiness subtype —
 * there is no TailorShop type, so tailors ride on ClothingStore + additionalType.
 */
export const CATEGORIES = [
  {
    slug: "tailors",
    name: "Tailors",
    singular: "Tailor",
    blurb: "Stitching, alterations and bespoke fitting",
    accent: "var(--color-cat-tailor)",
    schemaType: "ClothingStore",
    additionalType: "https://www.wikidata.org/wiki/Q662729",
  },
  {
    slug: "boutiques",
    name: "Boutiques",
    singular: "Boutique",
    blurb: "Designer ethnic and occasion wear",
    accent: "var(--color-cat-boutique)",
    schemaType: "ClothingStore",
    additionalType: "https://www.wikidata.org/wiki/Q2477969",
  },
  {
    slug: "fabric-shops",
    name: "Fabric Shops",
    singular: "Fabric Shop",
    blurb: "Suiting, shirting, silks and raw material",
    accent: "var(--color-cat-fabric)",
    schemaType: "Store",
    additionalType: "https://www.wikidata.org/wiki/Q11460",
  },
  {
    slug: "rental-shops",
    name: "Rental Shops",
    singular: "Rental Shop",
    blurb: "Sherwanis, lehengas and gowns on rent",
    accent: "var(--color-cat-rental)",
    schemaType: "Store",
    additionalType: "https://www.wikidata.org/wiki/Q1195942",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Route segments that can never be a store slug, because they're real pages. */
export const RESERVED_SEGMENTS = new Set(["in", "prices", "search", "api"]);
