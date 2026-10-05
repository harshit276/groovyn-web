import type { Faq } from "@/lib/blog";
import { rankStores } from "@/lib/ranking";
import type { LocalityDTO, ServiceDTO, StoreSummaryDTO } from "@/lib/types";
import { formatINR } from "@/lib/utils";

/**
 * Copy for listing pages, generated from the directory's own data.
 *
 * A category page that is only a grid of cards gives a search engine very little
 * to understand, and boilerplate paragraphs copy-pasted across cities are worse
 * than nothing. So every sentence here is built from a fact about this page:
 * the real shop count, the real areas, the real top-rated shops, the real price
 * ranges. Where the data is thin, the copy says so instead of dressing it up.
 *
 * Nothing here is invented. If a fact is not available, the sentence is left out.
 */

type CategoryLike = { slug: string; name: string; singular: string };

export type CategorySeoInput = {
  category: CategoryLike;
  cityName: string;
  total: number;
  localities: LocalityDTO[];
  /** Every shop in this category and city, not just the current page. */
  stores: StoreSummaryDTO[];
  services: ServiceDTO[];
};

export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function noun(input: CategorySeoInput): string {
  return (input.total === 1 ? input.category.singular : input.category.name).toLowerCase();
}

function topLocalities(input: CategorySeoInput, n: number): LocalityDTO[] {
  return [...input.localities]
    .sort((a, b) => b.storeCount - a.storeCount || a.name.localeCompare(b.name))
    .slice(0, n);
}

/** The opening paragraph. One fact-built sentence per fact we actually have. */
export function categoryIntro(input: CategorySeoInput): string {
  const { cityName, total, localities } = input;
  const top = topLocalities(input, 3).map((l) => l.name);

  const areas = localities.length
    ? ` across ${localities.length} ${localities.length === 1 ? "area" : "areas"}`
    : "";
  const most = top.length > 1 ? `, with the most in ${joinList(top)}` : "";

  return (
    `Groovyn lists ${total} ${noun(input)} in ${cityName}${areas}${most}. ` +
    `Each listing shows the shop's address, its Google rating and a starting price where we have one, ` +
    `and you can book a visit for free. Shops cannot pay to rank higher.`
  );
}

type Range = { name: string; min: number; max: number };

function rangesFor(services: ServiceDTO[], slugs: string[]): Range[] {
  const out: Range[] = [];
  for (const slug of slugs) {
    const s = services.find((x) => x.slug === slug);
    if (s && s.benchmarkMin != null && s.benchmarkMax != null) {
      out.push({ name: s.name.toLowerCase(), min: s.benchmarkMin, max: s.benchmarkMax });
    }
  }
  return out;
}

/** "shirt stitching ₹450 to ₹900, ..." */
function describe(ranges: Range[]): string {
  return joinList(ranges.map((r) => `${r.name} ${formatINR(r.min)} to ${formatINR(r.max)}`));
}

const NOT_QUOTES = "These are benchmarks from our own research, not quotes.";

function costFaq(input: CategorySeoInput): Faq | null {
  const { category, cityName, services } = input;

  switch (category.slug) {
    case "tailors": {
      const r = rangesFor(services, ["shirt-stitching", "blouse-stitching", "suit-stitching"]);
      if (!r.length) return null;
      return {
        q: `How much does tailoring cost in ${cityName}?`,
        a: `Stitching charges vary with the garment, the fabric and the shop. Our indicative ranges include ${describe(r)}, and the full list is on our price index. ${NOT_QUOTES} Ask the shop to price your exact garment.`,
      };
    }
    case "boutiques": {
      const r = rangesFor(services, ["designer-lehenga", "bridal-lehenga", "party-gown"]);
      if (!r.length) return null;
      return {
        q: `How much does a designer lehenga or gown cost in ${cityName}?`,
        a: `It depends on the label, the work on the garment and whether it is made to order. Our indicative ranges include ${describe(r)}. ${NOT_QUOTES}`,
      };
    }
    case "fabric-shops": {
      const r = rangesFor(services, ["suiting-fabric", "shirting-fabric"]);
      if (!r.length) return null;
      return {
        q: `How much does fabric cost in ${cityName}?`,
        a: `It depends on the fabric, the quality and the market. Suiting and shirting are sold by the metre, and our indicative ranges are ${describe(r)}. ${NOT_QUOTES}`,
      };
    }
    case "rental-shops": {
      const r = rangesFor(services, ["sherwani-rental", "lehenga-rental"]);
      if (!r.length) return null;
      return {
        q: `How much does it cost to rent a lehenga or sherwani in ${cityName}?`,
        a: `Our indicative ranges are ${describe(r)}. Designer and bridal pieces can sit well above these, and most shops add a refundable deposit, so ask for the total and how many days it covers before you book. ${NOT_QUOTES}`,
      };
    }
    default:
      return null;
  }
}

export function categoryFaqs(input: CategorySeoInput): Faq[] {
  const { category, cityName, stores } = input;
  const faqs: Faq[] = [];
  const name = category.name.toLowerCase();

  // 1. "Best" — the question the page is titled around.
  const rated = rankStores(stores, "rating").filter((s) => s.googleRating != null);
  const topRated = rated.slice(0, 3).map((s) => {
    const reviews = s.googleRatingCount
      ? ` from ${s.googleRatingCount.toLocaleString("en-IN")} Google reviews`
      : "";
    return `${s.name} (${s.googleRating?.toFixed(1)}${reviews})`;
  });

  faqs.push({
    q: `Which are the best ${name} in ${cityName}?`,
    a:
      `There is no single best ${category.singular.toLowerCase()}: it depends on what you want made, your budget and your area. ` +
      `To shortlist quickly, sort this page by Top rated on Google, which ranks shops by their Google rating adjusted for how many reviews they have. ` +
      (topRated.length
        ? `At the moment the highest-rated are ${joinList(topRated)}. `
        : "") +
      `Only ${rated.length} of the ${stores.length} shops listed have a Google rating so far, so treat ratings as one input and not the whole picture. Shops cannot pay to rank higher.`,
  });

  // 2. Cost.
  const cost = costFaq(input);
  if (cost) faqs.push(cost);

  // 3. Areas.
  const top = topLocalities(input, 4);
  if (top.length > 1) {
    faqs.push({
      q: `Which areas of ${cityName} have the most ${name}?`,
      a: `On Groovyn, the most are in ${joinList(top.map((l) => `${l.name} (${l.storeCount})`))}. You can browse by area using the list at the bottom of this page.`,
    });
  }

  // 4. Home visits: only when at least one listed shop offers them.
  const homeVisit = stores.filter((s) => s.homeVisit).length;
  if (category.slug === "tailors" && homeVisit > 0) {
    faqs.push({
      q: `Do any ${name} in ${cityName} offer home visits?`,
      a: `${homeVisit} of the ${stores.length} ${name} listed here offer home measurement visits. Use the home visit filter at the top of the list to see ${homeVisit === 1 ? "it" : "them"}.`,
    });
  }

  // 5. Booking.
  faqs.push({
    q: "Can I book a visit through Groovyn?",
    a: "Yes. Open any shop and request a visit for a day and time that suits you. Booking is free, there is no payment and no obligation, your details go to that shop only, and we never sell your number.",
  });

  // 6. Measurements, where they matter.
  if (category.slug === "tailors" || category.slug === "boutiques") {
    faqs.push({
      q: "How do I get my measurements right before I visit?",
      a: "Take them with a soft tape by following our step-by-step measuring guides, or try our free measurement scan for a starting set that your tailor then confirms with a tape. The scan runs in your browser and uploads nothing.",
    });
  }

  return faqs;
}
