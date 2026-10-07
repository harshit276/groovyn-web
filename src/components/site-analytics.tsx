"use client";

import { Analytics, type BeforeSend } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Visit counts and real-user page speed, both from Vercel. They use no tracking
 * cookies and keep nothing that follows a person across sites. The privacy
 * policy describes them, so change that page if you change this one.
 *
 * Neither does anything until Web Analytics and Speed Insights are switched on
 * for the project in the Vercel dashboard (the Analytics and Speed Insights
 * tabs). They also do nothing in local development.
 *
 * This is a client component because the filters below are functions, which a
 * server component cannot hand to a client one.
 */

/** Cleans a URL before it is recorded. Returns null to drop the event. */
function clean(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }
  // Staff pages are not visits.
  if (url.pathname.startsWith("/admin")) return null;
  // Search terms and other query strings can hold personal details. Counting
  // the page is enough.
  url.search = "";
  url.hash = "";
  return url.toString();
}

const analyticsBeforeSend: BeforeSend = (event) => {
  const url = clean(event.url);
  return url ? { ...event, url } : null;
};

type SpeedBeforeSend = NonNullable<
  React.ComponentProps<typeof SpeedInsights>["beforeSend"]
>;

const speedBeforeSend: SpeedBeforeSend = (event) => {
  const url = clean(event.url);
  return url ? { ...event, url } : null;
};

export function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={analyticsBeforeSend} />
      <SpeedInsights beforeSend={speedBeforeSend} />
    </>
  );
}
