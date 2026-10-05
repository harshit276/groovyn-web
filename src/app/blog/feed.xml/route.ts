import { POSTS } from "@/content/blog";
import { absoluteUrl, site } from "@/lib/site";

export const revalidate = 3600;

/** Escapes the five characters that are special in XML text and attributes. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS for the guides. Feed readers and some aggregators are a cheap, steady
 * source of discovery, and a valid feed is a signal that the blog is real.
 */
export function GET() {
  const items = POSTS.map((p) => {
    const url = absoluteUrl(`/blog/${p.slug}`);
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${new Date(p.datePublished).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`;
  }).join("\n");

  const latest = POSTS[0]?.dateModified ?? new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)} guides</title>
    <link>${esc(absoluteUrl("/blog"))}</link>
    <description>Plain-English guides to getting clothes made in Delhi.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>
    <atom:link href="${esc(absoluteUrl("/blog/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
