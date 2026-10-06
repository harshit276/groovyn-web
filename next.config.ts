import type { NextConfig } from "next";

/**
 * The address the site is meant to be reached at, taken from the same
 * NEXT_PUBLIC_SITE_URL that drives canonicals and the sitemap, so there is one
 * place to change if the main address ever moves from www to the bare domain.
 *
 * Returns null on localhost and on a *.vercel.app address, where redirecting
 * "to the main address" would only loop or break local work.
 */
function canonicalOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.hostname === "localhost" || url.hostname.endsWith(".vercel.app")) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  async redirects() {
    const origin = canonicalOrigin();

    return [
      // The old groovyn.com site had language paths. They no longer exist, so
      // send them to the home page instead of a dead end.
      {
        source: "/:locale(hi-in|de-de|es-es|fr-fr|nl-nl|zh-cn)/:path*",
        destination: "/",
        permanent: true,
      },
      // One copy of the site. Without this, groovyn-web.vercel.app serves every
      // page a second time. Only the production alias matches: preview
      // deployments have their own hostnames. API routes are left alone so a
      // client that calls the old address keeps working.
      ...(origin
        ? [
            {
              source: "/:path((?!api(?:/|$)).*)",
              has: [{ type: "host" as const, value: "groovyn-web.vercel.app" }],
              destination: `${origin}/:path`,
              permanent: true,
            },
          ]
        : []),
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // The measurement scan needs the camera. Nothing else needs a
          // microphone, so switch it off.
          { key: "Permissions-Policy", value: "camera=(self), microphone=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
