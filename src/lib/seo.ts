import { site } from "@/lib/site";

/**
 * Small, shared SEO helpers.
 *
 * Titles and descriptions used to be assembled inline on each page, which is how
 * a shop called "Roshan Tailors (House of Roshans)" ended up with an 80-character
 * title that search results cut off mid-name. Centralising the fitting logic
 * means every page obeys the same limits.
 */

/** The site template appends " | Groovyn", so a title has this much less room. */
const BRAND_SUFFIX = ` | ${site.name}`.length;

/** Roughly where search results start truncating a title, in characters. */
export const TITLE_BUDGET = 62;
export const DESCRIPTION_BUDGET = 158;

/**
 * Picks the most informative title that fits.
 *
 * Candidates run from most to least descriptive. The first whose length plus the
 * brand suffix fits the budget wins; if none fits, the last one is clipped. A
 * name is never cut mid-word to make room for a locality.
 */
export function fitTitle(candidates: string[], withBrand = true): string {
  const room = TITLE_BUDGET - (withBrand ? BRAND_SUFFIX : 0);
  for (const c of candidates) {
    if (c.length <= room) return c;
  }
  return clip(candidates[candidates.length - 1], room);
}

/** Clips to a word boundary and adds an ellipsis only when something was cut. */
export function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  // Only back up to a space if it does not throw away most of the text.
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

/** Fits a description to the budget. */
export function fitDescription(text: string): string {
  return clip(text, DESCRIPTION_BUDGET);
}

/**
 * The share image every page falls back to.
 *
 * Next merges `openGraph` shallowly, so a page that sets its own `openGraph`
 * object silently loses the image from the root `opengraph-image` file. Pages
 * without an image of their own spread this in to keep one.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.name}: find the best tailors and custom clothing shops near you`,
} as const;

export function openGraphFor(input: {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article";
}) {
  return {
    type: input.type ?? "website",
    siteName: site.name,
    locale: site.locale,
    title: input.title,
    description: input.description,
    url: input.url,
    images: [OG_IMAGE],
  };
}

/** "1 shop", "3 shops". */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
