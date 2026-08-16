import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/**
 * Note the deliberate absence of AI-crawler blocks.
 *
 * groovyn.com currently serves Cloudflare's managed robots.txt, which blocks
 * GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot and others. For a
 * business whose value is being the answer to "where do I get a sherwani
 * stitched in Delhi", blocking assistants is self-harm — we want to be cited.
 *
 * IMPORTANT: this file only takes effect if Cloudflare isn't serving its own
 * robots.txt at the edge. Turn that managed rule off, or point DNS at Vercel.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Search results are near-infinite thin permutations — keep them out of
        // the crawl budget entirely. /admin is auth-gated and noindex too.
        disallow: ["/api/", "/search", "/admin"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
