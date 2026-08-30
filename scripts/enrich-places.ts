// tsx does not load .env the way Next.js does — load it explicitly.
import "dotenv/config";

/**
 * Enrich listings with Google Places data.
 *
 *   npm run enrich -- --dry-run           show what would change
 *   npm run enrich -- --limit 10          do a small batch first
 *   npm run enrich -- --refresh           re-fetch shops that already have a place ID
 *
 * ── On caching, which shapes this script ──────────────────────────────────
 * Google's terms let you store a Place ID indefinitely, but not most other
 * Places content — hours and phone numbers are meant to be refreshed, not
 * warehoused forever. So this script treats Places as a *discovery and
 * verification* tool rather than a permanent source of truth:
 *
 *   - googlePlaceId       stored permanently (allowed, and the key for refresh)
 *   - lat/lng             stored — coordinates of a physical shop are a fact
 *   - phone               only filled when we have none; your own confirmed
 *                         number always wins
 *   - openingHours        stored with placesSyncedAt so staleness is visible;
 *                         re-run with --refresh on a schedule
 *
 * It never overwrites anything a human verified. Google's rating is stored in
 * googleRating (never ratingAvg) because it must always be shown as Google's,
 * with attribution, and must never enter our own aggregateRating markup.
 * Review *text* is not fetched at all — that carries the tightest restrictions.
 */
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

/**
 * Field mask drives the billing SKU, so keep it tight — every extra field can
 * bump the request into a more expensive tier.
 */
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.nationalPhoneNumber",
  "places.regularOpeningHours",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
].join(",");

type PlaceResult = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  regularOpeningHours?: {
    periods?: {
      open?: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }[];
  };
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Google returns periods keyed 0=Sunday; we store {mon: "11:00-20:00"}. */
function toOpeningHours(place: PlaceResult): Record<string, string> {
  const periods = place.regularOpeningHours?.periods;
  if (!periods?.length) return {};

  const hours: Record<string, string> = {};
  for (const p of periods) {
    if (!p.open) continue;
    const key = DAY_KEYS[p.open.day];
    if (!key) continue;
    const open = `${pad(p.open.hour)}:${pad(p.open.minute)}`;
    const close = p.close
      ? `${pad(p.close.hour)}:${pad(p.close.minute)}`
      : "23:59";
    hours[key] = `${open}-${close}`;
  }
  // Days Google omits are closed — say so explicitly rather than leaving a gap.
  for (const key of DAY_KEYS) {
    if (!(key in hours)) hours[key] = "closed";
  }
  return hours;
}

async function findPlace(query: string): Promise<PlaceResult | null> {
  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      // Bias to Delhi NCR so a same-named shop elsewhere doesn't win.
      locationBias: {
        circle: {
          center: { latitude: 28.6139, longitude: 77.209 },
          radius: 50000,
        },
      },
      maxResultCount: 1,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Places API ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as { places?: PlaceResult[] };
  return data.places?.[0] ?? null;
}

/** Loose check that the match is the same shop, not a coincidence. */
function looksLikeMatch(storeName: string, place: PlaceResult): boolean {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const a = norm(storeName);
  const b = norm(place.displayName?.text ?? "");
  if (!b) return false;
  return a.includes(b.slice(0, 6)) || b.includes(a.slice(0, 6));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const refresh = args.includes("--refresh");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx > -1 ? Number(args[limitIdx + 1]) : undefined;

  if (!API_KEY) {
    console.error(
      "GOOGLE_PLACES_API_KEY is not set.\n\n" +
        "  1. console.cloud.google.com → create a project\n" +
        "  2. Enable billing, then enable 'Places API (New)'\n" +
        "  3. Credentials → create an API key, restrict it to Places API\n" +
        "  4. Add GOOGLE_PLACES_API_KEY to .env\n\n" +
        "Free tier: 10K Essentials / 5K Pro calls per SKU per month. This script\n" +
        "uses ~1 call per shop, so a few hundred shops costs nothing."
    );
    process.exitCode = 1;
    return;
  }

  const stores = await db.store.findMany({
    where: refresh ? {} : { googlePlaceId: null },
    include: { city: { select: { name: true } }, locality: { select: { name: true } } },
    orderBy: { name: "asc" },
    ...(limit ? { take: limit } : {}),
  });

  console.log(
    `${stores.length} shop(s) to process${dryRun ? " (dry run)" : ""}.\n`
  );

  let matched = 0;
  let unmatched = 0;
  let failed = 0;

  for (const s of stores) {
    const query = [s.name, s.locality?.name, s.city.name].filter(Boolean).join(", ");

    try {
      const place = await findPlace(query);

      if (!place) {
        unmatched++;
        console.log(`  no match   ${s.name}`);
        continue;
      }

      if (!looksLikeMatch(s.name, place)) {
        unmatched++;
        console.log(
          `  ambiguous  ${s.name}  ->  "${place.displayName?.text}" (skipped)`
        );
        continue;
      }

      const hours = toOpeningHours(place);
      const gained: string[] = [];
      if (place.location) gained.push("geo");
      if (Object.keys(hours).length) gained.push("hours");
      if (!s.phone && place.nationalPhoneNumber) gained.push("phone");
      if (!s.website && place.websiteUri) gained.push("website");
      if (place.rating) gained.push(`rating ${place.rating}`);

      matched++;
      console.log(
        `  matched    ${s.name.padEnd(34)} ${gained.join(", ") || "place id only"}`
      );

      if (!dryRun) {
        await db.store.update({
          where: { id: s.id },
          data: {
            googlePlaceId: place.id,
            lat: place.location?.latitude ?? s.lat,
            lng: place.location?.longitude ?? s.lng,
            // Never overwrite what we already hold — ours may be human-verified.
            phone: s.phone ?? place.nationalPhoneNumber ?? null,
            website: s.website ?? place.websiteUri ?? null,
            mapUrl: place.location
              ? `https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}&query_place_id=${place.id}`
              : s.mapUrl,
            openingHours: Object.keys(hours).length
              ? JSON.stringify(hours)
              : s.openingHours,
            googleRating: place.rating ?? null,
            googleRatingCount: place.userRatingCount ?? null,
            googleMapsUri: place.googleMapsUri ?? null,
            placesSyncedAt: new Date(),
          },
        });
      }
    } catch (e) {
      failed++;
      console.error(`  ERROR      ${s.name}: ${e instanceof Error ? e.message : e}`);
      // A 4xx usually means the key or field mask is wrong for every call, so
      // stop rather than burning quota repeating the same mistake.
      if (e instanceof Error && /Places API 4/.test(e.message)) {
        console.error("\nAborting — this looks like a key or configuration problem.");
        break;
      }
    }

    // Gentle pacing. Well under any rate limit, and keeps spend predictable.
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log(
    `\nMatched ${matched}, unmatched ${unmatched}, failed ${failed}.` +
      (dryRun ? " Nothing written." : "")
  );
  if (!dryRun && matched) {
    console.log(
      "Opening hours come from Google and go stale — re-run with --refresh periodically."
    );
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await db.$disconnect();
  process.exitCode = 1;
});
