/**
 * Google Places photo proxy.
 *
 * Google's terms do not let us download a Places photo and re-host it. The
 * image has to be fetched from their media endpoint and shown with the
 * photographer's attribution, so the database stores a reference
 * ("gplaces:places/<id>/photos/<id>") and this route resolves it at view time.
 *
 * Keeping it server-side also keeps GOOGLE_PLACES_API_KEY off the client.
 */

/** Exactly the shape Places issues — nothing else may reach the fetch. */
const REF_PATTERN = /^places\/[A-Za-z0-9_-]{1,128}\/photos\/[A-Za-z0-9_-]{1,512}$/;

const ALLOWED_WIDTHS = [240, 400, 640, 800, 1200, 1600];

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return new Response("Places photos are not configured.", { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref") ?? "";

  // An unvalidated ref would let a caller aim this fetch at any Google path,
  // signed with our key.
  if (!REF_PATTERN.test(ref)) {
    return new Response("Bad photo reference.", { status: 400 });
  }

  // Snap to a fixed ladder so callers cannot mint unlimited billable variants.
  const requested = Number(searchParams.get("w") ?? "800");
  const width =
    ALLOWED_WIDTHS.find((w) => w >= requested) ??
    ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];

  const upstream = new URL(`https://places.googleapis.com/v1/${ref}/media`);
  upstream.searchParams.set("maxWidthPx", String(width));
  upstream.searchParams.set("key", key);

  let res: Response;
  try {
    res = await fetch(upstream, { redirect: "follow" });
  } catch {
    return new Response("Upstream unavailable.", { status: 502 });
  }

  if (!res.ok || !res.body) {
    // Photo references do expire; a 404 here means the shop needs re-enriching.
    return new Response("Photo unavailable.", { status: res.status === 404 ? 404 : 502 });
  }

  const type = res.headers.get("content-type") ?? "image/jpeg";
  if (!type.startsWith("image/")) {
    return new Response("Unexpected upstream content.", { status: 502 });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": type,
      // Short shared cache only: enough to survive a page's own render burst
      // without becoming a stored copy of Google's content.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
