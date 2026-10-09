/**
 * Reads the prices a shop publishes on its own website and writes them to
 * data/web-prices.json, ready for `npm run import:web-prices`.
 *
 * Why this exists: most shops have no rate card with us yet, but some run an
 * online shop with public prices. Showing those, marked as the shop's own and
 * dated, is more useful than an empty price box and more honest than a guess.
 *
 * What it does and does not do:
 *  - It reads only public product pages and the public product feed of Shopify
 *    shops (/products.json). It does not log in, and it does not copy photos or
 *    descriptions, only a price range per product group.
 *  - It reports a range (lowest and highest listed price) for a named group of
 *    products, with how many products that range is based on, so the page can
 *    say "range across 8 products".
 *  - Groups are defined by hand below, because a product feed has no standard
 *    way to say "this is a lehenga". Check the output before importing it.
 *
 * Run: npm run collect:web-prices   (add a shop key to refresh just that shop)
 */
import fs from "node:fs";
import path from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 GroovynPriceCheck/1.0";

/**
 * Each group: label shown on the shop's page, unit, and how to pick products.
 * `type` matches the feed's product_type, `title` matches the product title.
 * Matching is case-insensitive.
 */
const SHOPS = {
  "asiana-couture-chandni-chowk": {
    site: "https://www.asianacouture.com",
    kind: "shopify",
    groups: [
      { label: "Lehenga sets", unit: "per set", type: "^lehenga$" },
      { label: "Anarkali sets", unit: "per set", type: "^anarkali$" },
    ],
  },
  "bhaavya-bhatnagar-shahpur-jat": {
    site: "https://www.bhaavya.com",
    kind: "shopify",
    groups: [
      { label: "Lehenga sets", unit: "per set", title: "lehenga" },
      { label: "Sari sets", unit: "per set", type: "^sari$" },
      { label: "Co-ord sets", unit: "per set", type: "^set$" },
      { label: "Dresses", unit: "per piece", type: "^dress$" },
      { label: "Blazers and pant suits", unit: "per piece", type: "^(blazer|pant suit)$" },
      { label: "Shirts and tops", unit: "per piece", type: "^(shirt|top)$" },
    ],
  },
  "chetna-bagga-nirvana-country": {
    site: "https://chetnabagga.com",
    kind: "shopify",
    groups: [
      { label: "Outfit sets", unit: "per set", type: "^ensemble$" },
      { label: "Dresses", unit: "per piece", type: "^dresses$" },
      { label: "Tops and blouses", unit: "per piece", type: "^(tops|blouse|blouses)$" },
      { label: "Pants and skirts", unit: "per piece", type: "^(pants|skirts)$" },
      { label: "Jackets", unit: "per piece", type: "^jackets$" },
    ],
  },
  "kapaas-by-nikita-sector-104": {
    site: "https://kapaasbynikita.com",
    kind: "shopify",
    groups: [
      { label: "Sarees", unit: "per piece", title: "\\b(saree|sari|sare)\\b" },
      { label: "Lehenga sets", unit: "per set", title: "lehenga" },
      { label: "Kurta sets", unit: "per set", type: "kurta set" },
      { label: "Unstitched suit sets", unit: "per set", type: "unstiched suit" },
    ],
  },
  "mr-fox-defence-colony": {
    site: "https://mrfox.in",
    kind: "shopify",
    groups: [
      { label: "Shirts", unit: "per piece", title: "\\bshirt\\b" },
      { label: "Kurtas and kurta sets", unit: "per piece", title: "kurta" },
      { label: "Sadri jackets", unit: "per piece", type: "sadri" },
      { label: "Suits", unit: "per piece", type: "^suit$" },
      { label: "Bandhgala, sherwani and achkan", unit: "per piece", title: "sherwani|bandhgala|bandhagala|achkan|jodhpuri" },
    ],
  },
  "kc-creations-lajpat-nagar": {
    site: "https://kccreations.com",
    kind: "shopify",
    groups: [
      { label: "Chanderi fabrics", unit: "per metre", type: "^chanderi$" },
      { label: "Cotton fabrics", unit: "per metre", type: "^cotton$" },
      { label: "Net fabrics", unit: "per metre", type: "^net$" },
      { label: "Satin fabrics", unit: "per metre", type: "^satin$" },
      { label: "Georgette fabrics", unit: "per metre", type: "^georgette$" },
      { label: "Unstitched suit sets", unit: "per set", type: "^unstitched suit$" },
    ],
  },
  "ramji-sons-lajpat-nagar": {
    site: "https://ramjisons.com",
    kind: "shopify",
    groups: [
      { label: "Brocade fabrics", unit: "per metre", type: "^brocade fabrics$" },
      { label: "Banarasi fabrics", unit: "per metre", type: "^banarasi fabrics$" },
      { label: "Net embroidery fabrics", unit: "per metre", type: "^net embroidery$" },
      { label: "Chanderi embroidery fabrics", unit: "per metre", type: "^chanderi embroidery$" },
      { label: "Unstitched suit sets", unit: "per set", type: "^unstitched suits$" },
      { label: "Sherwani and bandhgala sets", unit: "per set", title: "sherwani|bandhgala|bandhagala|achkan|jodhpuri" },
    ],
  },
};

/**
 * Read straight off a shop's own page, where there is no product feed. The
 * `evidence` is the wording on the page, kept so the number can be checked.
 */
const READ_BY_HAND = {
  "roshan-tailors-house-of-roshans-greater-kailash-1": {
    site: "https://www.houseofroshans.com",
    items: [
      {
        label: "Blouses",
        unit: "per piece",
        min: 2500,
        max: 8500,
        page: "https://www.houseofroshans.com/categories/all-blouses",
        evidence: "Price Range ₹ 2500 to ₹ 8500 (the price filter on the all-blouses page)",
        // The shop's own listing says these ship in 14 to 21 days.
        extra: "Made to order, shown on the site as shipping in 14 to 21 days.",
      },
    ],
  },
};

async function getJson(url) {
  const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function shopifyProducts(site) {
  const out = [];
  for (let page = 1; page <= 14; page++) {
    const data = await getJson(`${site}/products.json?limit=250&page=${page}`);
    if (!data.products?.length) break;
    out.push(...data.products);
    if (data.products.length < 250) break;
  }
  return out
    .map((p) => {
      const prices = (p.variants ?? []).map((v) => Number(v.price)).filter((n) => n > 0);
      return {
        title: p.title ?? "",
        type: (p.product_type ?? "").trim(),
        min: prices.length ? Math.min(...prices) : NaN,
        max: prices.length ? Math.max(...prices) : NaN,
      };
    })
    .filter((p) => Number.isFinite(p.min));
}

function pick(products, group) {
  const type = group.type ? new RegExp(group.type, "i") : null;
  const title = group.title ? new RegExp(group.title, "i") : null;
  return products.filter((p) => (type && type.test(p.type)) || (title && title.test(p.title)));
}

const only = process.argv[2];
const file = path.join(process.cwd(), "data", "web-prices.json");
const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { shops: {} };
const today = new Date().toISOString().slice(0, 10);
const result = { checkedAt: today, shops: { ...existing.shops } };

for (const [slug, shop] of Object.entries(SHOPS)) {
  if (only && only !== slug) continue;
  process.stdout.write(`${slug} ... `);
  try {
    const products = await shopifyProducts(shop.site);
    const items = [];
    for (const g of shop.groups) {
      const hits = pick(products, g);
      if (hits.length < 2) {
        process.stdout.write(`[skip ${g.label}: ${hits.length}] `);
        continue;
      }
      items.push({
        label: g.label,
        unit: g.unit,
        min: Math.min(...hits.map((h) => h.min)),
        max: Math.max(...hits.map((h) => h.max)),
        count: hits.length,
        page: shop.site,
      });
    }
    result.shops[slug] = { site: shop.site, checkedAt: today, items };
    console.log(`${products.length} products, ${items.length} groups`);
  } catch (e) {
    console.log(`FAILED (${e.message}); keeping the previous values`);
  }
}

for (const [slug, shop] of Object.entries(READ_BY_HAND)) {
  if (only && only !== slug) continue;
  result.shops[slug] = {
    site: shop.site,
    checkedAt: today,
    items: shop.items.map((i) => ({ ...i, count: undefined })),
  };
  console.log(`${slug} ... read by hand (${shop.items.length} groups)`);
}

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(result, null, 2) + "\n");
console.log(`\nWrote ${path.relative(process.cwd(), file)}`);
