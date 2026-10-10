/**
 * Manages the "Pieces from this shop" showcase on a shop's page.
 *
 * The rule: nothing is shown until the shop itself has said yes. A shop's
 * photos are the shop's, so this script will not read or show a shop's pieces
 * until you have recorded its permission with `approve`.
 *
 *   npm run products -- status
 *   npm run products -- feed <slug> <https://the-shops-own-site>
 *   npm run products -- approve <slug> "Owner, WhatsApp, 12 Oct 2026"
 *   npm run products -- refresh [slug] [--dry]
 *   npm run products -- revoke <slug>
 *
 * `feed` records the shop's own online shop (it must be a Shopify store, whose
 * public product list lives at /products.json). `refresh` reads up to 8 of its
 * pieces, a mix of kinds, with photo, price and link. Run `refresh` again
 * whenever you want prices brought up to date. `revoke` hides the showcase and
 * deletes what we hold.
 *
 * Pages refresh within the hour after a change.
 */
import "dotenv/config";

import { db } from "../src/lib/db";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 GroovynShowcase/1.0";
const MAX_PIECES = 8;
const MAX_PER_KIND = 2;

type ShopifyProduct = {
  title?: string;
  handle?: string;
  product_type?: string;
  images?: { src?: string }[];
  variants?: { price?: string; available?: boolean }[];
};

type Piece = {
  title: string;
  price: number;
  imageUrl: string;
  url: string;
  kind: string;
};

function origin(feed: string): string {
  return new URL(feed).origin;
}

async function readFeed(feed: string, limit = 250): Promise<ShopifyProduct[]> {
  const res = await fetch(`${origin(feed)}/products.json?limit=${limit}`, {
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${origin(feed)}/products.json answered ${res.status}`);
  const data = (await res.json()) as { products?: ShopifyProduct[] };
  return data.products ?? [];
}

/**
 * Picks pieces worth showing: in stock, with a photo and a real price, newest
 * first as the shop lists them, and no more than two of one kind so the strip
 * does not read as eight versions of the same top.
 */
function choose(feed: string, products: ShopifyProduct[]): Piece[] {
  const base = origin(feed);
  const usable: Piece[] = [];
  for (const p of products) {
    const image = p.images?.[0]?.src;
    const inStock = (p.variants ?? []).filter((v) => v.available !== false);
    const prices = inStock.map((v) => Number(v.price)).filter((n) => n > 0);
    if (!image || !p.handle || !p.title || !prices.length) continue;
    usable.push({
      title: p.title.replace(/\s+/g, " ").trim().slice(0, 90),
      price: Math.round(Math.min(...prices)),
      imageUrl: image,
      url: `${base}/products/${p.handle}`,
      kind: (p.product_type ?? "").trim().toLowerCase() || "other",
    });
  }

  const picked: Piece[] = [];
  const perKind = new Map<string, number>();
  for (const piece of usable) {
    if (picked.length >= MAX_PIECES) break;
    const n = perKind.get(piece.kind) ?? 0;
    if (n >= MAX_PER_KIND) continue;
    perKind.set(piece.kind, n + 1);
    picked.push(piece);
  }
  // A shop with few kinds of piece: fill the rest in the shop's own order.
  for (const piece of usable) {
    if (picked.length >= MAX_PIECES) break;
    if (!picked.includes(piece)) picked.push(piece);
  }
  return picked;
}

async function needStore(slug: string | undefined) {
  if (!slug) throw new Error("Give the shop's slug.");
  const store = await db.store.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      productFeed: true,
      productsApproved: true,
      productsApprovalNote: true,
    },
  });
  if (!store) throw new Error(`No shop with the slug "${slug}".`);
  return store;
}

async function status() {
  const stores = await db.store.findMany({
    where: { OR: [{ productFeed: { not: null } }, { productsApproved: true }] },
    select: {
      slug: true,
      name: true,
      productFeed: true,
      productsApproved: true,
      productsApprovalNote: true,
      products: { select: { clicks: true } },
    },
    orderBy: { name: "asc" },
  });
  if (!stores.length) {
    console.log("No shop has a product feed yet. Start with: feed <slug> <site>");
    return;
  }
  for (const s of stores) {
    const clicks = s.products.reduce((n, p) => n + p.clicks, 0);
    console.log(
      `${s.productsApproved ? "SHOWN " : "hidden"}  ${s.slug}  ${s.productFeed ?? "(no feed)"}  ` +
        `${s.products.length} pieces, ${clicks} taps${s.productsApprovalNote ? `  [${s.productsApprovalNote}]` : ""}`
    );
  }
}

async function setFeed(slug: string | undefined, site: string | undefined) {
  const store = await needStore(slug);
  if (!site) throw new Error("Give the shop's own website, e.g. https://www.bhaavya.com");
  const url = new URL(site);
  if (url.protocol !== "https:") throw new Error("Use the https address of the shop's site.");
  const products = await readFeed(url.origin, 5);
  if (!products.length) throw new Error(`${url.origin}/products.json has no products. It must be a Shopify store.`);
  await db.store.update({ where: { id: store.id }, data: { productFeed: url.origin } });
  console.log(`${store.name}: feed set to ${url.origin} (it lists products). Not shown until you run approve.`);
}

async function approve(slug: string | undefined, note: string | undefined) {
  const store = await needStore(slug);
  if (!store.productFeed) throw new Error("Set the shop's feed first.");
  if (!note || note.trim().length < 8) {
    throw new Error('Say who agreed, how and when, e.g. "Owner, WhatsApp, 12 Oct 2026".');
  }
  await db.store.update({
    where: { id: store.id },
    data: { productsApproved: true, productsApprovalNote: note.trim() },
  });
  console.log(`${store.name}: approved (${note.trim()}). Now run: npm run products -- refresh ${slug}`);
}

async function refresh(slug: string | undefined, dry: boolean) {
  const stores = slug
    ? [await needStore(slug)]
    : await db.store.findMany({
        where: { productsApproved: true, productFeed: { not: null } },
        select: { id: true, name: true, productFeed: true, productsApproved: true, productsApprovalNote: true },
      });

  for (const store of stores) {
    if (!store.productsApproved || !store.productFeed) {
      console.log(`- ${store.name}: not approved, skipped. Ask the shop first.`);
      continue;
    }
    const pieces = choose(store.productFeed, await readFeed(store.productFeed));
    console.log(`- ${store.name}: ${pieces.length} pieces`);
    for (const p of pieces) console.log(`    ₹${p.price.toLocaleString("en-IN")}  ${p.title}  [${p.kind}]`);
    if (dry) continue;

    const now = new Date();
    const existing = await db.shopProduct.findMany({
      where: { storeId: store.id },
      select: { id: true, url: true },
    });
    const byUrl = new Map(existing.map((e) => [e.url, e.id]));
    const keep = new Set<string>();

    for (const [i, p] of pieces.entries()) {
      const id = byUrl.get(p.url);
      const data = { title: p.title, price: p.price, imageUrl: p.imageUrl, sortOrder: i, checkedAt: now };
      if (id) {
        await db.shopProduct.update({ where: { id }, data });
        keep.add(id);
      } else {
        const created = await db.shopProduct.create({ data: { ...data, storeId: store.id, url: p.url } });
        keep.add(created.id);
      }
    }
    const stale = existing.filter((e) => !keep.has(e.id)).map((e) => e.id);
    if (stale.length) await db.shopProduct.deleteMany({ where: { id: { in: stale } } });
  }
}

async function revoke(slug: string | undefined) {
  const store = await needStore(slug);
  await db.$transaction([
    db.shopProduct.deleteMany({ where: { storeId: store.id } }),
    db.store.update({
      where: { id: store.id },
      data: { productsApproved: false, productsApprovalNote: null },
    }),
  ]);
  console.log(`${store.name}: hidden, and the pieces we held are deleted.`);
}

async function main() {
  const [cmd, a, b] = process.argv.slice(2).filter((x) => x !== "--dry");
  const dry = process.argv.includes("--dry");
  switch (cmd) {
    case "status":
      return status();
    case "feed":
      return setFeed(a, b);
    case "approve":
      return approve(a, b);
    case "refresh":
      return refresh(a, dry);
    case "revoke":
      return revoke(a);
    default:
      console.log("Commands: status | feed <slug> <site> | approve <slug> \"<note>\" | refresh [slug] [--dry] | revoke <slug>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
