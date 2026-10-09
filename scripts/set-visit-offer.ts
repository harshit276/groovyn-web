/**
 * Records the offer a shop has agreed to give people who book a visit through
 * Groovyn. It then shows on the shop's page and as a gold "Visit offer" badge
 * on its card.
 *
 *   npm run offer -- <shop-slug> "<offer, in the shop's words>" ["<terms>"]
 *   npm run offer -- <shop-slug> --clear
 *
 * Only run this for an offer the shop has told you, because the shop has to
 * honour whatever is published here when a visitor shows their visit token.
 * Never invent one. Pages refresh within the hour.
 */
import "dotenv/config";

import { db } from "../src/lib/db";

async function main() {
  const [slug, offer, terms] = process.argv.slice(2);
  if (!slug) {
    console.log('Usage: npm run offer -- <shop-slug> "<offer>" ["<terms>"]   or   -- <shop-slug> --clear');
    process.exit(1);
  }

  const store = await db.store.findUnique({
    where: { slug },
    select: { name: true, visitOffer: true, visitOfferTerms: true },
  });
  if (!store) {
    console.error(`No shop with the slug "${slug}".`);
    process.exit(1);
  }

  if (offer === "--clear") {
    await db.store.update({ where: { slug }, data: { visitOffer: null, visitOfferTerms: null } });
    console.log(`Cleared the visit offer for ${store.name}.`);
    return;
  }

  if (!offer) {
    console.log(`${store.name}: ${store.visitOffer ?? "no visit offer"}${store.visitOfferTerms ? ` (${store.visitOfferTerms})` : ""}`);
    return;
  }
  if (offer.length > 160) {
    console.error(`The offer is ${offer.length} characters. Keep it to 160 or fewer.`);
    process.exit(1);
  }

  await db.store.update({
    where: { slug },
    data: { visitOffer: offer.trim(), visitOfferTerms: terms?.trim() || null },
  });
  console.log(`Set the visit offer for ${store.name}: ${offer.trim()}${terms ? ` (${terms.trim()})` : ""}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
