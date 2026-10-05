/**
 * Quality gate for blog posts.
 *
 * Run with `npm run verify:blog`. It exits non-zero on any failure, so it can
 * gate a deploy. Thin, duplicated or mis-linked content is the fastest way to
 * make a whole domain rank worse, so these checks are deliberately strict.
 *
 * It also checks the live data blocks against the database: a post that points
 * at a service or locality that does not exist would render an empty block.
 */

import { config } from "dotenv";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

import {
  headingId,
  headings,
  plainText,
  stripInline,
  wordCount,
  type Block,
  type Post,
} from "../src/lib/blog";
import { POSTS } from "../src/content/blog";

config();
neonConfig.webSocketConstructor = ws;

const LIMITS = {
  metaTitleMax: 52, // the site template adds " | Groovyn", 10 more: 62 in all
  metaTitleMin: 25,
  descriptionMin: 110,
  descriptionMax: 160,
  excerptMin: 60,
  excerptMax: 230,
  words: 900,
  h2: 4,
  faqMin: 4,
  faqAnswerWords: 20,
  internalLinks: 3,
};

/** Routes a post may link to, besides other posts. */
const STATIC_ROUTES = new Set(["/measurements", "/claim", "/suggest", "/blog"]);
const ROUTE_PATTERNS = [/^\/delhi(\/[a-z0-9-]+)*$/];

type Problem = { slug: string; message: string };
const problems: Problem[] = [];
const fail = (slug: string, message: string) => problems.push({ slug, message });

function linksIn(post: Post): string[] {
  const texts: string[] = [];
  for (const b of post.blocks) {
    switch (b.type) {
      case "h2":
      case "h3":
      case "p":
        texts.push(b.text);
        break;
      case "ul":
      case "ol":
        texts.push(...b.items);
        break;
      case "callout":
        texts.push(b.text);
        break;
      case "table":
        texts.push(...b.rows.flat());
        break;
    }
  }
  texts.push(...post.faq.map((f) => f.a));
  const out: string[] = [];
  const re = /\[[^\]]+\]\(([^)\s]+)\)/g;
  for (const t of texts) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(t))) out.push(m[1]);
  }
  return out;
}

function allText(post: Post): string[] {
  const out: string[] = [post.title, post.metaTitle, post.description, post.excerpt];
  for (const b of post.blocks) {
    switch (b.type) {
      case "h2":
      case "h3":
      case "p":
        out.push(b.text);
        break;
      case "ul":
      case "ol":
        out.push(...b.items);
        break;
      case "callout":
        out.push(b.title, b.text);
        break;
      case "table":
        out.push(...b.head, ...b.rows.flat(), b.note ?? "");
        break;
    }
  }
  for (const f of post.faq) out.push(f.q, f.a);
  return out;
}

async function main() {
  const slugs = new Set(POSTS.map((p) => p.slug));

  // Live data, for the dynamic blocks.
  let serviceSlugs: Set<string> | null = null;
  let localityKeys: Set<string> | null = null;
  if (process.env.DATABASE_URL) {
    const db = new PrismaClient({
      adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
    });
    try {
      const [services, localities] = await Promise.all([
        db.service.findMany({ select: { slug: true, category: true } }),
        db.locality.findMany({
          where: { city: { slug: "delhi" } },
          select: { slug: true, stores: { select: { category: true } } },
        }),
      ]);
      serviceSlugs = new Set(services.map((s) => `${s.category}:${s.slug}`));
      localityKeys = new Set(
        localities.flatMap((l) =>
          [...new Set(l.stores.map((s) => s.category))].map((c) => `${c}:${l.slug}`)
        )
      );
    } finally {
      await db.$disconnect();
    }
  } else {
    console.log("(DATABASE_URL not set: skipping live-block checks)\n");
  }

  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();

  for (const post of POSTS) {
    const s = post.slug;

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) fail(s, "slug must be lowercase and hyphenated");
    if (seenSlugs.has(s)) fail(s, "duplicate slug");
    seenSlugs.add(s);
    if (seenTitles.has(post.metaTitle)) fail(s, "duplicate metaTitle");
    seenTitles.add(post.metaTitle);

    // Titles and descriptions.
    if (post.metaTitle.length > LIMITS.metaTitleMax)
      fail(s, `metaTitle is ${post.metaTitle.length} chars (max ${LIMITS.metaTitleMax}): "${post.metaTitle}"`);
    if (post.metaTitle.length < LIMITS.metaTitleMin)
      fail(s, `metaTitle is too short (${post.metaTitle.length})`);
    const d = post.description.length;
    if (d < LIMITS.descriptionMin || d > LIMITS.descriptionMax)
      fail(s, `description is ${d} chars (want ${LIMITS.descriptionMin}-${LIMITS.descriptionMax})`);
    const e = post.excerpt.length;
    if (e < LIMITS.excerptMin || e > LIMITS.excerptMax)
      fail(s, `excerpt is ${e} chars (want ${LIMITS.excerptMin}-${LIMITS.excerptMax})`);

    // Depth.
    const words = wordCount(post);
    if (words < LIMITS.words) fail(s, `only ${words} words (min ${LIMITS.words})`);
    const h2s = headings(post);
    if (h2s.length < LIMITS.h2) fail(s, `only ${h2s.length} H2 sections (min ${LIMITS.h2})`);
    const ids = h2s.map((h) => h.id);
    if (new Set(ids).size !== ids.length) fail(s, "duplicate H2 heading ids");
    for (const b of post.blocks)
      if ((b.type === "h2" || b.type === "h3") && !headingId(b.text))
        fail(s, `heading produces an empty id: "${b.text}"`);

    // FAQ.
    if (post.faq.length < LIMITS.faqMin) fail(s, `only ${post.faq.length} FAQs (min ${LIMITS.faqMin})`);
    for (const f of post.faq) {
      if (!f.q.trim().endsWith("?")) fail(s, `FAQ question should end with "?": "${f.q}"`);
      // The FAQPage markup carries the answer verbatim, so it cannot hold inline
      // markup without the structured data showing raw brackets and asterisks.
      if (/\*\*|\]\(/.test(f.a)) fail(s, `FAQ answer contains markup: "${f.q}"`);
      const n = stripInline(f.a).split(/\s+/).length;
      if (n < LIMITS.faqAnswerWords) fail(s, `FAQ answer too thin (${n} words): "${f.q}"`);
    }

    // Keyword coverage: every significant word of the primary keyword should be
    // in the H1 or the meta title, or the page is not about what it targets.
    const head = `${post.title} ${post.metaTitle}`.toLowerCase();
    for (const w of post.primaryKeyword.toLowerCase().split(/\s+/)) {
      if (w.length >= 3 && !head.includes(w))
        fail(s, `primary keyword word "${w}" is not in the title or meta title`);
    }

    // Links.
    const links = linksIn(post);
    const internal = links.filter((l) => l.startsWith("/"));
    if (internal.length < LIMITS.internalLinks)
      fail(s, `only ${internal.length} internal links (min ${LIMITS.internalLinks})`);
    for (const l of links) {
      if (!l.startsWith("/")) {
        fail(s, `external link "${l}": posts should not send readers away`);
        continue;
      }
      const path = l.split("#")[0].split("?")[0];
      const blogMatch = /^\/blog\/([a-z0-9-]+)$/.exec(path);
      if (blogMatch) {
        if (!slugs.has(blogMatch[1])) fail(s, `links to a post that does not exist: ${l}`);
        if (blogMatch[1] === s) fail(s, `links to itself: ${l}`);
      } else if (!STATIC_ROUTES.has(path) && !ROUTE_PATTERNS.some((r) => r.test(path))) {
        fail(s, `links to an unknown route: ${l}`);
      }
    }

    // Related.
    if (post.related.length < 2) fail(s, "needs at least 2 related posts");
    for (const r of post.related) {
      if (!slugs.has(r)) fail(s, `related slug does not exist: ${r}`);
      if (r === s) fail(s, "related includes itself");
    }

    // Dates.
    const pub = Date.parse(post.datePublished);
    const mod = Date.parse(post.dateModified);
    if (Number.isNaN(pub) || Number.isNaN(mod)) fail(s, "invalid date");
    else if (mod < pub) fail(s, "dateModified is before datePublished");

    // Text hygiene.
    for (const t of allText(post)) {
      if (/\bTODO\b|lorem ipsum|\bFIXME\b/i.test(t)) fail(s, `placeholder text: "${t.slice(0, 50)}"`);
      if ((t.match(/\*\*/g) ?? []).length % 2 !== 0) fail(s, `unbalanced ** in: "${t.slice(0, 60)}"`);
      if (/\s{2,}/.test(t.replace(/\n/g, " "))) fail(s, `double space in: "${t.slice(0, 60)}"`);
      if (/\[[^\]]*\]\([^)]*$/.test(t)) fail(s, `broken link markup in: "${t.slice(0, 60)}"`);
    }
    for (const b of post.blocks) {
      if (b.type === "table") {
        for (const r of b.rows)
          if (r.length !== b.head.length)
            fail(s, `table row has ${r.length} cells but the header has ${b.head.length}: "${r[0]}"`);
        if (b.head.some((h) => !h.trim())) fail(s, "table has an empty header cell");
      }
    }

    // Live blocks.
    for (const b of post.blocks as Block[]) {
      if (b.type === "services" && b.only && serviceSlugs) {
        for (const slug of b.only)
          if (!serviceSlugs.has(`${b.category}:${slug}`))
            fail(s, `services block: no ${b.category} service "${slug}"`);
      }
      if (b.type === "shops" && b.locality && localityKeys) {
        if (!localityKeys.has(`${b.category}:${b.locality}`))
          fail(s, `shops block: no ${b.category} shops in "${b.locality}"`);
      }
    }
  }

  // Cross-post: near-duplicate intros are a thin-content signal.
  const intros = POSTS.map((p) => ({
    slug: p.slug,
    text: stripInline(p.blocks.find((b) => b.type === "p" && "text" in b)?.["text" as never] ?? "").slice(0, 80),
  }));
  for (let i = 0; i < intros.length; i++)
    for (let j = i + 1; j < intros.length; j++)
      if (intros[i].text && intros[i].text === intros[j].text)
        fail(intros[i].slug, `same opening as ${intros[j].slug}`);

  // Report.
  console.log(`Checked ${POSTS.length} posts\n`);
  console.log("slug".padEnd(50) + "words".padStart(6) + "  H2  FAQ  links  title");
  for (const p of POSTS) {
    console.log(
      p.slug.padEnd(50) +
        String(wordCount(p)).padStart(6) +
        String(headings(p).length).padStart(4) +
        String(p.faq.length).padStart(5) +
        String(linksIn(p).length).padStart(7) +
        `  ${p.metaTitle.length}`
    );
  }
  const total = POSTS.reduce((n, p) => n + wordCount(p), 0);
  console.log(`\n${total.toLocaleString()} words in total`);
  void plainText;

  if (problems.length) {
    console.error(`\nFAIL: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  [${p.slug}] ${p.message}`);
    process.exit(1);
  }
  console.log("\nPASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
