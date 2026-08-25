/**
 * Import researched stores into the database.
 *
 *   npm run import:stores -- data/delhi-tailors.json
 *   npm run import:stores -- data/delhi-tailors.json --dry-run
 *
 * The guard rails here are deliberate and load-bearing — see data/README.md.
 * They exist because the cheapest way to destroy a directory's credibility is
 * to publish a shop that does not exist, or a price the shop never quoted.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// Created lazily so --dry-run can validate a file without a database at all —
// validation is the part you want to run early and often.
let client: PrismaClient | null = null;

function getDb(): PrismaClient {
  if (client) return client;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env, or pass --dry-run to validate without writing."
    );
  }
  client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  return client;
}

const CATEGORIES = ["tailors", "boutiques", "fabric-shops", "rental-shops"] as const;

const priceItemSchema = z.object({
  label: z.string().min(1),
  priceMin: z.number().int().nonnegative().nullish(),
  priceMax: z.number().int().nonnegative().nullish(),
  unit: z.string().default("per piece"),
  note: z.string().nullish(),
  serviceSlug: z.string().nullish(),
  // Defaults to "estimate": if research produced it, the shop did not confirm it.
  source: z.enum(["shop", "menu", "estimate"]).default("estimate"),
});

const storeSchema = z.object({
  name: z.string().min(2),
  category: z.enum(CATEGORIES),
  city: z.string().min(1),
  cityName: z.string().nullish(),
  state: z.string().nullish(),
  locality: z.string().nullish(),
  localityName: z.string().nullish(),
  address: z.string().min(5),
  pincode: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  phone: z.string().nullish(),
  whatsapp: z.string().nullish(),
  website: z.union([z.url(), z.literal("")]).nullish(),
  instagram: z.union([z.url(), z.literal("")]).nullish(),
  about: z.string().nullish(),
  specialities: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  openingHours: z.record(z.string(), z.string()).default({}),
  priceMin: z.number().int().nonnegative().nullish(),
  priceMax: z.number().int().nonnegative().nullish(),
  turnaroundDays: z.number().int().nonnegative().nullish(),
  homeVisit: z.boolean().default(false),
  homeVisitFee: z.number().int().nonnegative().nullish(),
  establishedYear: z.number().int().min(1800).max(2100).nullish(),
  googlePlaceId: z.string().nullish(),
  priceItems: z.array(priceItemSchema).default([]),

  // Provenance. Non-negotiable — an unsourced record is indistinguishable
  // from a hallucinated one.
  sources: z.array(z.url()).min(1, "At least one source URL is required"),
  confidence: z.enum(["high", "medium", "low"]).default("medium"),
  notes: z.string().nullish(),
});

type StoreInput = z.infer<typeof storeSchema>;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Slug includes the locality so two "Sharma Tailors" in one city cannot collide. */
function storeSlug(s: StoreInput): string {
  const base = s.locality ? `${s.name}-${s.localityName ?? s.locality}` : s.name;
  return slugify(base);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const file = args.find((a) => !a.startsWith("--"));

  if (!file) {
    console.error("Usage: npm run import:stores -- <file.json> [--dry-run]");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(path.resolve(file), "utf8"));
  const list: unknown[] = Array.isArray(raw) ? raw : (raw.stores ?? []);
  console.log(`Read ${list.length} record(s) from ${file}\n`);

  const valid: StoreInput[] = [];
  let rejected = 0;

  for (const [i, entry] of list.entries()) {
    const parsed = storeSchema.safeParse(entry);
    if (!parsed.success) {
      rejected++;
      const label = (entry as { name?: string })?.name ?? `record #${i + 1}`;
      console.error(`REJECTED  ${label}`);
      for (const issue of parsed.error.issues) {
        console.error(
          `          ${issue.path.join(".") || "(root)"}: ${issue.message}`
        );
      }
      continue;
    }
    valid.push(parsed.data);
  }

  if (rejected) console.error("");
  console.log(`${valid.length} valid, ${rejected} rejected.`);

  if (dryRun) {
    console.log("\n--dry-run: nothing written.");
    for (const s of valid) {
      console.log(
        `  ${storeSlug(s).padEnd(46)} ${s.category.padEnd(14)} ${s.confidence.padEnd(6)} ${s.sources.length} source(s)`
      );
    }
    return;
  }

  const db = getDb();
  let created = 0;
  let updated = 0;

  for (const s of valid) {
    const city = await db.city.upsert({
      where: { slug: s.city },
      update: {},
      create: {
        slug: s.city,
        name: s.cityName ?? s.city,
        state: s.state ?? "",
      },
    });

    let localityId: string | null = null;
    if (s.locality) {
      const locality = await db.locality.upsert({
        where: { cityId_slug: { cityId: city.id, slug: s.locality } },
        update: {},
        create: {
          slug: s.locality,
          name: s.localityName ?? s.locality,
          cityId: city.id,
        },
      });
      localityId = locality.id;
    }

    const slug = storeSlug(s);
    const existing = await db.store.findUnique({ where: { slug } });

    const data = {
      name: s.name,
      category: s.category,
      cityId: city.id,
      localityId,
      about: s.about ?? null,
      address: s.address,
      pincode: s.pincode ?? null,
      lat: s.lat ?? null,
      lng: s.lng ?? null,
      phone: s.phone ?? null,
      whatsapp: s.whatsapp ?? s.phone ?? null,
      website: s.website || null,
      instagram: s.instagram || null,
      mapUrl:
        s.lat && s.lng
          ? `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`
          : null,
      specialities: JSON.stringify(s.specialities),
      materials: JSON.stringify(s.materials),
      openingHours: JSON.stringify(s.openingHours),
      priceMin: s.priceMin ?? null,
      priceMax: s.priceMax ?? null,
      turnaroundDays: s.turnaroundDays ?? null,
      homeVisit: s.homeVisit,
      homeVisitFee: s.homeVisitFee ?? null,
      establishedYear: s.establishedYear ?? null,
      googlePlaceId: s.googlePlaceId ?? null,

      // Enforced, not configurable: researched data is never "verified",
      // never carries a rate-card badge, and never brings a rating with it.
      verified: false,
      rateCardVerified: false,
      claimed: false,
      ratingAvg: null,
      ratingCount: 0,
      coverImage: null,
    };

    const store = existing
      ? await db.store.update({ where: { slug }, data })
      : await db.store.create({ data: { ...data, slug } });

    if (existing) updated++;
    else created++;

    // Replace price items wholesale so re-importing a corrected file is safe.
    await db.priceItem.deleteMany({ where: { storeId: store.id } });
    for (const [i, p] of s.priceItems.entries()) {
      const service = p.serviceSlug
        ? await db.service.findUnique({ where: { slug: p.serviceSlug } })
        : null;
      await db.priceItem.create({
        data: {
          storeId: store.id,
          serviceId: service?.id ?? null,
          label: p.label,
          priceMin: p.priceMin ?? null,
          priceMax: p.priceMax ?? null,
          unit: p.unit,
          note: p.note ?? null,
          source: p.source,
          sortOrder: i,
        },
      });
    }
  }

  console.log(`\nCreated ${created}, updated ${updated}.`);
  console.log(
    "All imported as unverified, with no images and no ratings. Verify by phone, then shoot photos and collect rate cards."
  );
  await db.$disconnect();
}

main()
  .catch(async (e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client?.$disconnect();
  });
