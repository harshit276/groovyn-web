/**
 * SEO audit. Crawls every URL in the sitemap on a running server and checks the
 * things search engines actually read.
 *
 *   npx next build && npx next start -p 3100
 *   node scripts/seo-audit.mjs http://localhost:3100
 *
 * Exits non-zero on any failure so it can gate a deploy. It audits a production
 * build, because `next dev` renders differently (and slowly) and would hide
 * problems that only exist in the built output.
 *
 * No dependencies: HTML is read with regular expressions, which is fine for
 * auditing our own well-formed output and would not be for arbitrary pages.
 */

const ORIGIN = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
const CONCURRENCY = 8;

const failures = [];
const warnings = [];
const fail = (url, msg) => failures.push({ url, msg });
const warn = (url, msg) => warnings.push({ url, msg });

/* ───────────────────────────── helpers ───────────────────────────── */

async function get(path) {
  const url = path.startsWith("http") ? path : ORIGIN + path;
  const res = await fetch(url, { redirect: "manual" });
  const text = await res.text();
  return { status: res.status, headers: res.headers, text, location: res.headers.get("location") };
}

/** Runs `worker` over `items` with bounded concurrency. */
async function pool(items, worker) {
  const queue = [...items];
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");

/** Visible text: comments and tags removed, entities decoded, whitespace folded. */
function visibleText(html) {
  return decode(
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(html, re) {
  const m = re.exec(html);
  return m ? decode(m[1]).trim() : null;
}

/** Attribute order varies, so read the tag and then the attribute. */
function metaContent(html, nameOrProp) {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  for (const tag of tags) {
    if (new RegExp(`(?:name|property)="${nameOrProp}"`).test(tag)) {
      const c = /content="([^"]*)"/.exec(tag);
      return c ? decode(c[1]) : "";
    }
  }
  return null;
}

function canonicalOf(html) {
  const tags = html.match(/<link\b[^>]*>/g) ?? [];
  for (const tag of tags) {
    if (/rel="canonical"/.test(tag)) {
      const h = /href="([^"]*)"/.exec(tag);
      return h ? decode(h[1]) : "";
    }
  }
  return null;
}

/* ───────────────────────────── per-page audit ───────────────────────────── */

const pageInfo = new Map(); // path -> { title, description, noindex }
const internalLinks = new Map(); // href -> first page that linked to it

async function auditPage(path) {
  const { status, text: html } = await get(path);
  if (status !== 200) {
    fail(path, `status ${status}`);
    return;
  }

  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/);
  const description = metaContent(html, "description");
  const robots = metaContent(html, "robots") ?? "";
  const canonical = canonicalOf(html);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  const noindex = /noindex/i.test(robots);

  pageInfo.set(path, { title, description, noindex });

  // Title
  if (!title) fail(path, "missing <title>");
  else {
    if (title.length > 70) fail(path, `title is ${title.length} chars: "${title}"`);
    else if (title.length > 62) warn(path, `title is ${title.length} chars and may truncate: "${title}"`);
    if (title.length < 20) warn(path, `title is short: "${title}"`);
  }

  // Description
  if (!description) fail(path, "missing meta description");
  else {
    if (description.length > 170) fail(path, `description is ${description.length} chars`);
    else if (description.length > 160) warn(path, `description is ${description.length} chars and may truncate`);
    if (description.length < 70) warn(path, `description is short (${description.length})`);
  }

  // H1
  if (h1s !== 1) fail(path, `${h1s} <h1> elements (want exactly 1)`);

  // Canonical: must exist, be absolute, and point at this page.
  if (!canonical) fail(path, "missing canonical");
  else {
    let cp;
    try {
      cp = new URL(canonical, ORIGIN).pathname;
    } catch {
      fail(path, `unparseable canonical "${canonical}"`);
    }
    const here = path.split("?")[0];
    if (cp && cp.replace(/\/$/, "") !== here.replace(/\/$/, "") && !noindex) {
      fail(path, `canonical points elsewhere: ${canonical}`);
    }
    if (!/^https?:\/\//.test(canonical)) warn(path, `canonical is not absolute: ${canonical}`);
  }

  // Open Graph
  if (!metaContent(html, "og:title")) warn(path, "missing og:title");
  if (!metaContent(html, "og:image")) warn(path, "missing og:image");

  // Structured data: must parse, and FAQ markup must match visible text.
  const visible = visibleText(html);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const nodes = [];
  for (const m of scripts) {
    try {
      const parsed = JSON.parse(m[1]);
      for (const n of Array.isArray(parsed) ? parsed : [parsed]) nodes.push(n);
    } catch (e) {
      fail(path, `invalid JSON-LD: ${e.message}`);
    }
  }
  for (const n of nodes) {
    if (!n["@type"]) fail(path, "JSON-LD node without @type");
    if (n["@type"] === "AggregateRating" || n.aggregateRating)
      fail(path, "aggregateRating present: we never mark up ratings");
    if (n["@type"] === "FAQPage") {
      for (const q of n.mainEntity ?? []) {
        const name = q.name;
        const answer = q.acceptedAnswer?.text ?? "";
        if (!visible.includes(name)) fail(path, `FAQ question not visible on page: "${name}"`);
        if (!visible.includes(answer)) fail(path, `FAQ answer not visible on page for: "${name}"`);
      }
    }
  }

  // Images need alt text (empty alt is fine: it marks a decorative image).
  const imgs = html.match(/<img\b[^>]*>/g) ?? [];
  const noAlt = imgs.filter((t) => !/\balt=/.test(t)).length;
  if (noAlt) fail(path, `${noAlt} <img> without an alt attribute`);

  // Collect internal links for the link check.
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = decode(m[1]).split("#")[0];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    if (/^\/(_next|api)\b/.test(href)) continue;
    if (!internalLinks.has(href)) internalLinks.set(href, path);
  }
}

/* ───────────────────────────── main ───────────────────────────── */

async function main() {
  console.log(`Auditing ${ORIGIN}\n`);

  // 1. Sitemap.
  const sm = await get("/sitemap.xml");
  if (sm.status !== 200) {
    console.error(`sitemap.xml returned ${sm.status}`);
    process.exit(1);
  }
  const urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const u = new URL(decode(m[1]));
    return u.pathname + u.search;
  });
  const unique = [...new Set(urls)];
  console.log(`sitemap: ${unique.length} URLs`);
  if (unique.length !== urls.length) warn("/sitemap.xml", `${urls.length - unique.length} duplicate URLs`);

  // 2. Crawl every sitemap URL.
  await pool(unique, auditPage);

  // 3. A page in the sitemap must be indexable.
  for (const [p, info] of pageInfo) {
    if (info.noindex) fail(p, "is noindex but listed in the sitemap");
  }

  // 4. Duplicate titles and descriptions across indexable pages.
  for (const field of ["title", "description"]) {
    const seen = new Map();
    for (const [p, info] of pageInfo) {
      if (!info[field] || info.noindex) continue;
      (seen.get(info[field]) ?? seen.set(info[field], []).get(info[field])).push(p);
    }
    for (const [value, pages] of seen) {
      if (pages.length > 1) {
        // Store and locality templates legitimately share phrasing, so only
        // flag an exact duplicate.
        warn(pages[0], `${pages.length} pages share the same ${field}: "${value.slice(0, 70)}" (${pages.slice(0, 3).join(", ")})`);
      }
    }
  }

  // 5. Internal links: every distinct target must resolve.
  const targets = [...internalLinks.keys()].filter((h) => !pageInfo.has(h.split("?")[0]));
  console.log(`links: ${internalLinks.size} distinct internal targets, ${targets.length} outside the sitemap to check`);
  await pool(targets, async (href) => {
    const r = await get(href);
    if (r.status >= 400) fail(href, `broken internal link (status ${r.status}), linked from ${internalLinks.get(href)}`);
    else if (r.status >= 300 && r.status < 400) warn(href, `redirects (${r.status}) to ${r.location}, linked from ${internalLinks.get(href)}`);
  });

  // 6. Non-page resources.
  const robots = await get("/robots.txt");
  if (robots.status !== 200) fail("/robots.txt", `status ${robots.status}`);
  else {
    if (!/Sitemap:/i.test(robots.text)) fail("/robots.txt", "no Sitemap line");
    if (/Disallow:\s*\/\s*$/m.test(robots.text)) fail("/robots.txt", "disallows the whole site");
    for (const bot of ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot"])
      if (new RegExp(`User-agent:\\s*${bot}`, "i").test(robots.text))
        warn("/robots.txt", `blocks ${bot}: you want to be cited by AI assistants`);
  }

  const feed = await get("/blog/feed.xml");
  if (feed.status !== 200 || !/<rss/.test(feed.text)) fail("/blog/feed.xml", "not a valid RSS response");
  else if (!/application\/rss\+xml/.test(feed.headers.get("content-type") ?? ""))
    fail("/blog/feed.xml", "wrong content-type");
  else {
    const items = (feed.text.match(/<item>/g) ?? []).length;
    console.log(`feed: ${items} items`);
  }

  const llms = await get("/llms.txt");
  if (llms.status !== 200 || !llms.text.startsWith("# ")) fail("/llms.txt", "missing or malformed");

  const og = await fetch(`${ORIGIN}/blog/how-to-choose-a-tailor-in-delhi/opengraph-image`);
  if (og.status !== 200 || !(og.headers.get("content-type") ?? "").startsWith("image/"))
    fail("/blog/.../opengraph-image", `status ${og.status}, ${og.headers.get("content-type")}`);

  // 7. Report.
  const indexable = [...pageInfo.values()].filter((i) => !i.noindex).length;
  console.log(`\naudited ${pageInfo.size} pages (${indexable} indexable)`);

  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 40)) console.log(`  ~ ${w.url}  ${w.msg}`);
    if (warnings.length > 40) console.log(`  ...and ${warnings.length - 40} more`);
  }

  if (failures.length) {
    console.error(`\nFAIL: ${failures.length} problem(s):`);
    for (const f of failures.slice(0, 60)) console.error(`  x ${f.url}  ${f.msg}`);
    if (failures.length > 60) console.error(`  ...and ${failures.length - 60} more`);
    process.exit(1);
  }
  console.log("\nPASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
