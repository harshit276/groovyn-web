/**
 * Absolute base for canonicals, og:image and sitemap URLs.
 *
 * Order matters. Hardcoding groovyn.com made every canonical and share image on
 * the preview deployment point at a domain still serving the old site, so
 * previews were broken and untestable. Falling back to Vercel's own production
 * URL keeps them working before DNS is switched, and setting
 * NEXT_PUBLIC_SITE_URL overrides everything once the domain is live.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/** Single source of truth for anything that ends up in metadata or structured data. */
export const site = {
  name: "Groovyn",
  tagline: "Custom clothing, decoded",
  description:
    "Find verified tailors, boutiques, fabric shops and rental stores across Delhi NCR — with real rate cards, real work photos, and no spam calls.",
  url: resolveSiteUrl(),
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
