import type { CategorySlug } from "@/lib/site";

/**
 * Turns what someone types into something the database can answer.
 *
 * The old search looked for the whole phrase inside one field, so "bridal lehenga
 * chandni chowk" found nothing even though "lehenga" and "chandni chowk" each
 * found shops. A shopper types the way they think: a garment, an occasion, a
 * market. So the phrase is split into words, and a shop has to match every word
 * somewhere (name, about, speciality, fabric, address, area, services).
 *
 * Each word can stand for several spellings ("lehnga", "ghagra"), and words like
 * "tailor" or "rent" also count when they match the shop's category.
 */

export type SearchTerm = {
  /** The word as typed, for messages. */
  label: string;
  /** Spellings and synonyms. A shop matches the term if any one is found. */
  alternatives: string[];
  /** Set when the word names a kind of shop, so the category counts as a match. */
  category?: CategorySlug;
};

export type ParsedQuery = {
  terms: SearchTerm[];
  /** A budget typed as "under 5000", in rupees. */
  maxPrice?: number;
};

/** Words that carry no meaning for matching, or that we cannot act on yet. */
const IGNORED = new Set([
  "a", "an", "and", "at", "best", "by", "cheap", "delhi", "for", "get", "good",
  "i", "in", "looking", "me", "my", "ncr", "near", "nearby", "need", "new",
  "now", "of", "on", "open", "shop", "shops", "store", "stores", "the", "to",
  "top", "want", "with", "find", "buy",
  // Occasions. There are no occasion tags to match yet, so they must not make a
  // search fail. They stay out of the match until shops are tagged.
  "wedding", "shaadi", "shadi", "marriage", "reception", "sangeet", "mehendi",
  "mehndi", "haldi", "engagement", "roka", "festive", "festival", "diwali",
  "party", "occasion",
]);

/** Words that name a kind of shop. */
const CATEGORY_WORDS: Record<string, CategorySlug> = {
  tailor: "tailors", tailors: "tailors", tailoring: "tailors", darzi: "tailors",
  darji: "tailors", stitching: "tailors", stitch: "tailors", silai: "tailors",
  boutique: "boutiques", boutiques: "boutiques", designer: "boutiques",
  fabric: "fabric-shops", fabrics: "fabric-shops", cloth: "fabric-shops",
  kapda: "fabric-shops", textile: "fabric-shops", textiles: "fabric-shops",
  material: "fabric-shops", materials: "fabric-shops",
  rent: "rental-shops", rental: "rental-shops", rentals: "rental-shops",
  hire: "rental-shops", hiring: "rental-shops", renting: "rental-shops",
};

/** Other spellings and Hinglish. Keys are the typed word. */
const ALIASES: Record<string, string[]> = {
  lehenga: ["lehenga", "lehnga", "lehanga", "lengha", "ghagra", "ghagara"],
  lehnga: ["lehenga", "lehnga", "lehanga", "lengha", "ghagra", "ghagara"],
  lehanga: ["lehenga", "lehnga", "lehanga", "lengha", "ghagra", "ghagara"],
  lengha: ["lehenga", "lehnga", "lehanga", "lengha", "ghagra", "ghagara"],
  ghagra: ["lehenga", "lehnga", "lehanga", "lengha", "ghagra", "ghagara"],
  saree: ["saree", "sari"],
  sari: ["saree", "sari"],
  sherwani: ["sherwani", "achkan"],
  achkan: ["sherwani", "achkan"],
  bandhgala: ["bandhgala", "bandh gala", "jodhpuri"],
  jodhpuri: ["bandhgala", "bandh gala", "jodhpuri"],
  kurta: ["kurta", "kurti"],
  kurti: ["kurta", "kurti"],
  salwar: ["salwar", "shalwar"],
  shalwar: ["salwar", "shalwar"],
  suit: ["suit", "suiting"],
  bridal: ["bridal", "bride", "dulhan"],
  bride: ["bridal", "bride", "dulhan"],
  dulhan: ["bridal", "bride", "dulhan"],
  groom: ["groom", "dulha"],
  dulha: ["groom", "dulha"],
  alteration: ["alteration", "alter"],
  alterations: ["alteration", "alter"],
  ladies: ["ladies", "womenswear", "women's", "womens"],
  womens: ["ladies", "womenswear", "women's", "womens"],
  gents: ["gents", "menswear", "men's"],
  mens: ["gents", "menswear", "men's"],
  // Markets and areas people abbreviate.
  cp: ["connaught place"],
  gk: ["greater kailash"],
  kinari: ["kinari", "chandni chowk"],
  gurgaon: ["gurgaon", "gurugram"],
  ggn: ["gurugram"],
};

const MAX_TERMS = 8;

/** "under 5000", "below rs 3,500", "up to 2k". */
const BUDGET = /\b(?:under|below|upto|up\s*to|within|less\s*than)\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)\s*(k)?\b/i;

export function parseQuery(raw: string): ParsedQuery {
  let text = raw.toLowerCase();

  let maxPrice: number | undefined;
  const budget = BUDGET.exec(text);
  if (budget) {
    const n = Number(budget[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) maxPrice = budget[2] ? n * 1000 : n;
    text = text.replace(BUDGET, " ");
  }

  const words = text
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
    .filter((w) => w.length > 0 && !IGNORED.has(w));

  const seen = new Set<string>();
  const terms: SearchTerm[] = [];

  for (const word of words) {
    if (terms.length >= MAX_TERMS) break;
    if (seen.has(word)) continue;
    seen.add(word);

    const category = CATEGORY_WORDS[word];
    const alias = ALIASES[word];
    // Without an alias, also try the singular, so "lehengas" finds "lehenga".
    const singular = word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : null;
    const alternatives = alias ?? (singular ? [word, singular] : [word]);

    terms.push({ label: word, alternatives, ...(category ? { category } : {}) });
  }

  return { terms, ...(maxPrice != null ? { maxPrice } : {}) };
}
