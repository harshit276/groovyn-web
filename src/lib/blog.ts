import type { CategorySlug } from "@/lib/site";

/**
 * Blog content model.
 *
 * Posts are typed data rather than markdown or HTML, for three reasons:
 *
 *  - Nothing authored here can inject markup. Every string is rendered as React
 *    text, so a stray `<` in a post is a character, not a bug.
 *  - Styling is one decision made once. A post cannot drift off-brand.
 *  - Structure is machine-readable, so the table of contents, reading time,
 *    FAQ markup and sitemap entries are derived from the post instead of being
 *    kept in sync by hand.
 *
 * The dynamic blocks (`services`, `shops`, `localities`) read live data at
 * render time. A guide that says "suit stitching costs X" should be showing the
 * same X as the price page, and should update when it does.
 *
 * Inline markup inside any text field: `**bold**` and `[label](/path)`.
 */

export type CalloutTone = "tip" | "warning" | "note";

export type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; tone: CalloutTone; title: string; text: string }
  | {
      type: "table";
      caption?: string;
      head: string[];
      rows: string[][];
      note?: string;
    }
  /** Live benchmark table from the services catalogue. */
  | { type: "services"; category: CategorySlug; only?: string[]; note?: string }
  /** Live shop cards from the directory. */
  | {
      type: "shops";
      category: CategorySlug;
      locality?: string;
      limit?: number;
      title?: string;
    }
  /** Live list of localities, with counts, linking to their listing pages. */
  | { type: "localities"; category: CategorySlug; limit?: number; title?: string }
  | { type: "cta"; kind: "measure" | "tailors" | "rentals" | "fabric" };

export type Faq = { q: string; a: string };

export type PostCluster = "measurements" | "prices" | "choosing";

export const CLUSTER_META: Record<
  PostCluster,
  { label: string; blurb: string }
> = {
  measurements: {
    label: "Measurements",
    blurb: "Take your own measurements, and know when a tape is not enough.",
  },
  prices: {
    label: "Prices & costs",
    blurb: "What stitching, sherwanis and rentals cost, and why quotes differ.",
  },
  choosing: {
    label: "Choosing & buying",
    blurb: "Pick the right tailor, fabric market and outfit route.",
  },
};

export type Post = {
  slug: string;
  /** The on-page H1. */
  title: string;
  /** The <title>. The site template appends " | Groovyn", so keep it short. */
  metaTitle: string;
  description: string;
  excerpt: string;
  cluster: PostCluster;
  /** ISO dates. `dateModified` moves only when the content materially changes. */
  datePublished: string;
  dateModified: string;
  /** The one query this post exists to answer. Documentation, not markup. */
  primaryKeyword: string;
  blocks: Block[];
  faq: Faq[];
  /** Slugs of related posts, in display order. */
  related: string[];
};

export function postHref(slug: string): string {
  return `/blog/${slug}`;
}

/* ─────────────────────────── derived values ─────────────────────────── */

/** Lowercase, hyphenated id for a heading, stable across renders. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function headings(post: Post): { id: string; text: string }[] {
  return post.blocks
    .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: headingId(b.text), text: b.text }));
}

/** Strips inline markup so word counts and descriptions see plain prose. */
export function stripInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1");
}

function blockText(block: Block): string {
  switch (block.type) {
    case "h2":
    case "h3":
    case "p":
      return block.text;
    case "ul":
    case "ol":
      return block.items.join(" ");
    case "callout":
      return `${block.title} ${block.text}`;
    case "table":
      return [block.caption ?? "", block.head.join(" "), ...block.rows.map((r) => r.join(" "))].join(" ");
    default:
      return "";
  }
}

export function plainText(post: Post): string {
  const body = post.blocks.map(blockText).join(" ");
  const faq = post.faq.map((f) => `${f.q} ${f.a}`).join(" ");
  return stripInline(`${body} ${faq}`);
}

export function wordCount(post: Post): number {
  const text = plainText(post).trim();
  return text ? text.split(/\s+/).length : 0;
}

/** 200 words a minute is a fair pace for instructional reading. */
export function readingMinutes(post: Post): number {
  return Math.max(1, Math.round(wordCount(post) / 200));
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
