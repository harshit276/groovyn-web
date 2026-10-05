import type { StoreSummaryDTO } from "@/lib/types";

/**
 * How shops are ordered.
 *
 * A page called "Best tailors in Delhi" that lists shops A to Z is not honest
 * about what it is. But the obvious fix, sorting by star rating, is worse: a
 * shop with one five-star review would outrank one with 653 reviews at 4.8.
 *
 * So the score is a Bayesian average. Each shop's Google rating is pulled
 * towards the average of its peers, and the fewer reviews it has, the harder it
 * is pulled. A shop only moves away from the average as it accumulates evidence.
 *
 *     score = (v / (v + m)) * R + (m / (v + m)) * C
 *
 *   R  the shop's Google rating        v  its number of Google reviews
 *   C  the mean rating of rated peers  m  the weight of the prior, in reviews
 *
 * Nothing here can be bought. The inputs are a third party's rating and a review
 * count, and a shop with no Google rating is ranked after the rated ones rather
 * than being invented a score.
 */

/** How many reviews it takes for a shop's own rating to outweigh the average. */
const PRIOR_WEIGHT = 50;
/** Used only when no peer has a rating to average. */
const FALLBACK_MEAN = 4.2;

export function googleScores(
  stores: Pick<StoreSummaryDTO, "id" | "googleRating" | "googleRatingCount">[]
): Map<string, number | null> {
  const rated = stores.filter((s) => s.googleRating != null);
  const mean = rated.length
    ? rated.reduce((sum, s) => sum + (s.googleRating ?? 0), 0) / rated.length
    : FALLBACK_MEAN;

  const out = new Map<string, number | null>();
  for (const s of stores) {
    if (s.googleRating == null) {
      out.set(s.id, null);
      continue;
    }
    // A rating with no count is treated as a single review: real, but weak.
    const v = Math.max(1, s.googleRatingCount ?? 1);
    out.set(
      s.id,
      (v / (v + PRIOR_WEIGHT)) * s.googleRating +
        (PRIOR_WEIGHT / (v + PRIOR_WEIGHT)) * mean
    );
  }
  return out;
}

/** Descending, with unrated shops after rated ones. */
function byScore(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return b - a;
}

/**
 * - `relevance`: what we know about the shop first (a published rate card, then
 *   verification), then how well-reviewed it is, then name.
 * - `rating`: how well-reviewed it is, then name.
 */
export function rankStores(
  stores: StoreSummaryDTO[],
  mode: "relevance" | "rating"
): StoreSummaryDTO[] {
  const scores = googleScores(stores);

  return [...stores].sort((a, b) => {
    if (mode === "relevance") {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.rateCardVerified !== b.rateCardVerified) return a.rateCardVerified ? -1 : 1;
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
    }
    const byRating = byScore(scores.get(a.id) ?? null, scores.get(b.id) ?? null);
    if (byRating !== 0) return byRating;
    return a.name.localeCompare(b.name);
  });
}
