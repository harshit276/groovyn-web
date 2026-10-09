/**
 * Loads data/web-prices.json (from `npm run collect:web-prices`) into the
 * database as price items marked source "website".
 *
 * Safe to run again: it replaces a shop's website-sourced items and never
 * touches items the shop gave us (source "shop" or "menu") or our own
 * estimates. A shop that already has a rate card of its own is skipped.
 *
 * Run `npm run import:web-prices -- --dry` first to see what it would do.
 */
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { db } from "../src/lib/db";

type Item = {
  label: string;
  unit: string;
  min: number;
  max: number;
  count?: number;
  evidence?: string;
  extra?: string;
};
type Shop = { site: string; checkedAt: string; items: Item[] };

const dry = process.argv.includes("--dry");

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function noteFor(item: Item, checkedAt: string): string {
  const basis = item.count
    ? `Range across ${item.count} products listed on the shop’s website`
    : "Listed on the shop’s website";
  return `${basis}, checked ${longDate(checkedAt)}.${item.extra ? ` ${item.extra}` : ""}`;
}

async function main() {
  const file = path.join(process.cwd(), "data", "web-prices.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as { shops: Record<string, Shop> };

  console.log(dry ? "DRY RUN: nothing will be written\n" : "Writing to the database\n");

  for (const [slug, shop] of Object.entries(data.shops)) {
    const store = await db.store.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        category: true,
        rateCardVerified: true,
        priceItems: { select: { id: true, source: true } },
      },
    });
    if (!store) {
      console.log(`- ${slug}: no such shop, skipped`);
      continue;
    }

    const own = store.priceItems.filter((p) => p.source === "shop" || p.source === "menu");
    if (store.rateCardVerified || own.length) {
      console.log(`- ${store.name}: has its own rate card, skipped`);
      continue;
    }

    const items = shop.items.filter((i) => Number.isFinite(i.min) && Number.isFinite(i.max));
    if (!items.length) {
      console.log(`- ${store.name}: nothing to import`);
      continue;
    }

    // The one range shown on the shop's card and page header. A fabric shop sells
    // by the metre and also by the set, and ₹190 to ₹17,250 would mix the two,
    // so for fabric it is the per-metre rows only.
    const headline =
      store.category === "fabric-shops"
        ? items.filter((i) => i.unit === "per metre")
        : items;
    const rangeItems = headline.length ? headline : items;
    const low = Math.min(...rangeItems.map((i) => i.min));
    const high = Math.max(...rangeItems.map((i) => i.max));
    console.log(
      `- ${store.name}: ${items.length} price rows, range ₹${low.toLocaleString("en-IN")} to ₹${high.toLocaleString("en-IN")}`
    );

    if (dry) continue;

    await db.$transaction([
      // Replace earlier website rows, and any of our estimates for this shop:
      // the shop's own published figures are better than a benchmark.
      db.priceItem.deleteMany({
        where: { storeId: store.id, source: { in: ["website", "estimate"] } },
      }),
      db.priceItem.createMany({
        data: items.map((i, n) => ({
          storeId: store.id,
          label: i.label,
          priceMin: i.min,
          priceMax: i.max,
          unit: i.unit,
          note: noteFor(i, shop.checkedAt),
          source: "website",
          sortOrder: n,
        })),
      }),
      db.store.update({
        where: { id: store.id },
        data: { priceMin: low, priceMax: high },
      }),
    ]);
  }

  console.log(dry ? "\nDry run finished." : "\nDone.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
