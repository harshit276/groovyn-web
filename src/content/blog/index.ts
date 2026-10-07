import type { Post } from "@/lib/blog";

import { post as bestFabricMarkets } from "./best-fabric-markets-in-delhi";
import { post as diwaliStitching } from "./diwali-outfit-stitching-in-delhi";
import { post as howToChooseTailor } from "./how-to-choose-a-tailor-in-delhi";
import { post as measureBlouse } from "./how-to-measure-for-a-blouse-at-home";
import { post as measureLehenga } from "./how-to-measure-for-a-lehenga";
import { post as measureSuit } from "./how-to-measure-for-a-suit-and-shirt";
import { post as measureBody } from "./how-to-take-body-measurements-at-home";
import { post as lehengaRent } from "./lehenga-on-rent-in-delhi";
import { post as onlineMeasurement } from "./online-body-measurement-how-accurate";
import { post as lehengaChoice } from "./readymade-semi-stitched-or-custom-lehenga";
import { post as sherwaniCost } from "./sherwani-stitching-cost-in-delhi";
import { post as tailoringCharges } from "./tailoring-charges-in-delhi";
import { post as weddingTimeline } from "./when-to-order-wedding-outfits-delhi-timeline";

/**
 * Every post, newest first. Adding a post means adding it here; the quality
 * gate in scripts/verify-blog.ts then checks it before it can ship.
 */
const ALL: Post[] = [
  diwaliStitching,
  measureBody,
  measureBlouse,
  measureLehenga,
  measureSuit,
  onlineMeasurement,
  tailoringCharges,
  sherwaniCost,
  lehengaRent,
  lehengaChoice,
  howToChooseTailor,
  bestFabricMarkets,
  weddingTimeline,
];

export const POSTS: Post[] = [...ALL].sort(
  (a, b) =>
    new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
);

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** Posts named in `related`, in the order given, skipping any that do not exist. */
export function getRelated(post: Post): Post[] {
  return post.related
    .map((slug) => getPost(slug))
    .filter((p): p is Post => !!p && p.slug !== post.slug);
}

/** The newest `n` posts. */
export function latestPosts(n: number): Post[] {
  return POSTS.slice(0, n);
}

/** Guides most relevant to a listing category, used to cross-link from listings. */
export const GUIDES_FOR_CATEGORY: Record<string, string[]> = {
  tailors: [
    // Seasonal: first until Diwali has passed, then drop it from this list.
    "diwali-outfit-stitching-in-delhi",
    "how-to-choose-a-tailor-in-delhi",
    "tailoring-charges-in-delhi",
  ],
  boutiques: [
    "readymade-semi-stitched-or-custom-lehenga",
    "how-to-measure-for-a-blouse-at-home",
    "when-to-order-wedding-outfits-delhi-timeline",
  ],
  "fabric-shops": [
    "best-fabric-markets-in-delhi",
    "how-to-choose-a-tailor-in-delhi",
    "tailoring-charges-in-delhi",
  ],
  "rental-shops": [
    "lehenga-on-rent-in-delhi",
    "sherwani-stitching-cost-in-delhi",
    "when-to-order-wedding-outfits-delhi-timeline",
  ],
};

export function guidesForCategory(category: string): Post[] {
  return (GUIDES_FOR_CATEGORY[category] ?? [])
    .map((slug) => getPost(slug))
    .filter((p): p is Post => !!p);
}
