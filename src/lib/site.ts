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
  tagline: "Find the best tailors near you",
  description:
    "Find the best tailors, boutiques, fabric shops and rental stores near you in Delhi NCR. Compare ratings and prices, then book a visit for free.",
  url: resolveSiteUrl(),
  ogImage: "/og/default.png",
  email: "groovyntech@gmail.com",
  phone: "+917891467209",
  /**
   * City only for now. Add the street address and PIN code here when there is
   * one: the contact page, the privacy policy and the Organization markup all
   * read from this single place.
   */
  address: {
    locality: "Bengaluru",
    region: "Karnataka",
    country: "India",
    countryCode: "IN",
  },
  locale: "en_IN",
  sameAs: [
    "https://www.instagram.com/groovyn",
    "https://twitter.com/groovyn",
  ],
} as const;

/**
 * When the policy and about pages were last revised. Shown on each page and
 * used as its sitemap date, so the date reflects a real edit and not the day the
 * sitemap was built. Change it when you change the text of one of those pages.
 */
export const POLICIES_UPDATED = {
  iso: "2026-10-08",
  label: "8 October 2026",
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

/**
 * A locality page with fewer shops than this is thin: one shop on its own page
 * repeats the shop's own page. Below it the page stays reachable for visitors
 * and keeps passing links, but is `noindex` and left out of the sitemap.
 */
export const MIN_SHOPS_TO_INDEX_LOCALITY = 3;

/** The same rule for a city's category page: one shop is not a listing page. */
export const MIN_SHOPS_TO_INDEX_CATEGORY = 3;

/**
 * A service page lists the shops that offer it. With none, it is a title, a
 * sentence and a price chip repeated 26 times, which is what makes a search
 * engine discount a whole site. It becomes indexable on its own as shops publish
 * rate cards for the service.
 */
export const MIN_SHOPS_TO_INDEX_SERVICE = 3;

/** Route segments that can never be a store slug, because they're real pages. */
export const RESERVED_SEGMENTS = new Set(["in", "prices", "search", "api"]);
