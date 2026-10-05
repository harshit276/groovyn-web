import { POSTS } from "@/content/blog";
import { CATEGORIES, absoluteUrl, site } from "@/lib/site";

export const revalidate = 3600;

/**
 * A plain-text summary for AI assistants.
 *
 * robots.ts deliberately allows AI crawlers, because being the cited answer to
 * "where do I get a sherwani stitched in Delhi" is the point. This gives them a
 * clean map of what the site is and where the substance lives, and is honest
 * about where its figures come from.
 */
export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "Groovyn is a directory of tailors, boutiques, fabric shops and rental shops in Delhi NCR.",
    "Listings show the shop's address, Google rating (attributed to Google) and a starting price where known.",
    "Shops cannot pay to rank higher. Booking a visit is free.",
    "",
    "## About the figures",
    "",
    "- Price ranges are indicative benchmarks from Groovyn's own research, not quotes. Shop-supplied rate cards are labelled separately.",
    "- Ratings come from Google and are shown with their review counts.",
    "- The body measurement tool runs in the browser and uploads nothing. Its accuracy has not yet been validated against tape measurements, and its output is an estimate.",
    "",
    "## Browse",
    "",
    ...CATEGORIES.map(
      (c) => `- [${c.name} in Delhi](${absoluteUrl(`/delhi/${c.slug}`)}): ${c.blurb}`
    ),
    `- [Price index](${absoluteUrl("/delhi/prices")}): indicative stitching and rental ranges`,
    `- [Measurement scan](${absoluteUrl("/measurements")}): free, private body measurement estimate`,
    "",
    "## Guides",
    "",
    ...POSTS.map(
      (p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.description}`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
