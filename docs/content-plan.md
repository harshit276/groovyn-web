# Groovyn: wedding-shopper content, page and discovery plan

Written 8 Oct 2026 by a content-strategy review, then checked against the code and the live site. Read-only research: it changes nothing by itself. Effort: S under a day, M 2 to 5 days, L over a week.

**In one line:** fix the trust claims and search, collect first-hand tags by phone, then publish a few evidence-backed wedding guides before the season opens on 21 Nov.

## What was checked against the real site (8 Oct)

| Claim in the review | Result |
|---|---|
| The home page over-promises ("published rates", "photos of actual work", "rate cards from the shop") | **Confirmed** in `src/app/page.tsx`, and similar lines on price pages. **Fixed in the working tree** (see below) |
| Multi-word searches return nothing | **Confirmed** on the live site: "bridal lehenga chandni chowk", "bandhgala tailor" and "silk fabric lajpat nagar" all returned 0 shops. **Fixed** with word-by-word matching (`src/lib/search-terms.ts`, `npm run verify:search`) |
| The visit token is made in the browser and never stored | **Confirmed** (`GV-` in `src/components/visit-booking.tsx`) |
| `npm run build` runs `prisma db push` | **Confirmed**: every deploy applies additive schema changes to the production database |
| Tag counts, SERP positions, autocomplete | Not re-checked. Treat as judgement |

## Do next, in order

1. **Remove over-claims (S; no data).** Done in code, awaiting deploy. The home page said "Verified listings with published rates... photos of actual work" and "Rate cards from the shop, not guesses". Reality: 0 verified, 0 photos, 0 rate cards. Cards now say "Indicative from ₹X" unless the shop's own rate card is behind it.
2. **Call-and-tag campaign (M, about 5 founder hours; 45 phones in `data/worklist.md`).** One 6-minute script: confirm the address; get the rate list on WhatsApp; ask for a small offer for people who book through Groovyn, in the shop's own words (this is what makes the "exclusive offer" real, and it shows only once the shop has agreed); tick which garments, fabrics and occasions they really take; last wedding-order date and lead times; number of trials; rental deposit and days.
3. **Fix multi-word search (S).** Done in code, awaiting deploy.
4. **Controlled tags with evidence (M; section 2).** Delhi tailors show 48 speciality values, 27 used once.
5. **Wedding pillar, bride and groom guides by 2 to 9 Nov (L).** Needs two market walks, 9 dated bridal quotes and photos.
6. **Rental and boutique pages first, then sherwani-on-rent (M; rental calls).**
7. **Re-gate `/services` pages on tag evidence; add about 10 offerings (M; item 2).** Cotton, georgette-chiffon, brocade-zari, velvet, bandhgala, bridal blouse.
8. **Swap the Diwali and timeline guides' "planning allowances" for dated, shop-quoted lead times (S; 10 tailors).**
9. **Reviews foundation (L; needs confirmed visits).** Review policy, privacy update, server-issued visit code, optional Google sign-in, verified-visit reviews. No rating markup until a shop has 5.
10. **Home role chooser (Bride, Groom, Family, Guest) and "Browse by what you need" chips (S).**

## 1. Journeys and queries

Evidence: India-locale Google autocomplete (typed queries, not volume) and the US-based WebSearch tool for SERPs (Indian positions unverified). Winnability is judgement.

- **Wedding shopping** ("wedding shopping delhi" + for bride / for groom / reddit): TravelTriangle, 10 markets, no prices [1]; Urban Company, 2019, one price [2]. Medium.
- **Bride** ("bridal lehenga delhi / chandni chowk / lajpat nagar", price, "under 50000"): WeddingBazaar [3], WeddingWire, WedMeGood with 981 Delhi NCR vendors [4]. Hard head; medium for dated-price long tails. "Bridal blouse stitching delhi" and "lehenga stitching cost in delhi" are held by vendor profiles; medium. Skip "near me" (map pack).
- **Rent and groom** ("lehenga on rent delhi" + under 3000 / rohini / rajouri garden; "sherwani on rent delhi lajpat nagar"; "sherwani for groom delhi"; "bandhgala tailor near me"): WeddingWire; WedMeGood list, 2020, no photos [5]; IndiaMART. Medium.
- **Family, guests, functions, festivals** (mother of the bride, bridesmaid, mehendi, haldi, sangeet, roka, Karwa Chauth): inspiration queries, held by Aza Fashions [8]. Win the rent, stitch or buy decision, not the ideas. Karwa Chauth (29 Oct) is too late for new URLs.
- **Fabric** ("silk / velvet / linen / cotton / georgette / brocade fabric delhi", "cloth market delhi for men"): IndiaMART, Jaypee blog with 12 markets and no lanes or prices [6]. Good. "Best fabric for lehenga" and "how to identify pure silk": Aza [7]; medium with Delhi prices and a demo.

"Best tailor in delhi" stays hard (see `docs/seo-plan.md`). Delhi-qualified suggestions exist for lehenga, sherwani, bandhgala, blouse, saree, suit, kurta pyjama, gown, silk, banarasi, velvet, linen, cotton, georgette, brocade, suiting and shirting. None exist for anarkali, salwar suit, chiffon, zari, "diwali tailor", "eid kurta stitching", "office wear tailor" or "express stitching": build nothing for them. "Reddit" trails 10+ suggestions, and shop-name searches exist ("pawan tailor delhi reviews"). Shoppers want peer opinion, which reviews answer.

Supply (Delhi, 69 shops; keyword match on tags and about text, unverified):

- About 20 show a bride word (7 tailors, 5 boutiques, 7 rentals, 1 fabric).
- 9 show a sherwani or bandhgala word (6 tailors, 2 rentals, 1 fabric), and no groom boutique exists.
- None of the 6 boutiques is in Lajpat Nagar, Karol Bagh, Rajouri Garden or South Ex, where the queries are.
- List Chandni Chowk and Gandhi Nagar sherwani sellers before promoting a groom page.

## 2. Page architecture

**Build pairs, not triples.** "Occasion x garment x fabric" is answered by search and filters (noindex). A page per combination is doorway abuse, pages "created to rank for specific, similar search queries" [11].

- **Occasion hubs are guides** (`/blog/...`, existing gate, live shop blocks): wedding pillar, bride, groom, guests. Title "Wedding Shopping in Delhi: Fabric, Tailors, Rentals"; H1 "Wedding shopping in Delhi, step by step".
- **Garment and fabric extend `/services/[slug]`** (26 rows, 3 indexable). Titles: "Bandhgala Tailors in Delhi: 5 Shops Compared", "Silk Fabric Shops in Delhi: 7 Compared by Market". The H1 drops the count. Shop type stays the category page.
- **Area:** keep `/in/[locality]` and add `Locality.parentId` so lanes roll up. Kinari Bazaar's 2 fabric shops sit outside Chandni Chowk's 5, and 6 of 10 Connaught Place tailors are in Shankar Market.
- **Budget:** bands inside offering pages; own pages only after 8 shop rate-card lines.
- **Area x tag:** nothing until 5 shops share a tag there (none do).
- **Links:** pillar to offering pages to shops, each linking back up and sideways to at most 6 siblings. Guide `shops` blocks need `tag` and `evidence` parameters; today they list top-rated shops whatever their speciality.

**Index only if** all of these hold:

- 5+ shops carry the tag, and 3 of them were stated by the shop within 12 months.
- The page has 300+ words specific to it, drawn from call notes.
- It has 4 page-specific FAQs and a "checked on" date per shop.
- The list is at most 60% of its parent category.
- Pillars need 1,500 words and two first-hand items.

Otherwise use `noindex,follow`, keep it out of the sitemap and nav, and reach it via filter chips. Category and locality keep the 3-shop rule. The 3 live service pages pass only on estimate-linked price lines: re-test them.

**Evidence tiers:** L0 listed (public text). L1 stated (shop told us, dated). L2 seen (our visit or photo). L3 customer-confirmed (2+ verified-visit reviews). Only L2 and above earns "best for".

**Buildable now** (Delhi, L0, unverified):

- Tailors: suit 21, bandhgala 5, blouse 5, salwar 5.
- Fabric: cotton 10, silk 6-7, linen 5, brocade 5, zari-gota 5, handloom 5-6, georgette 4.
- Rental: wedding 6-7, lehenga 4, gown 4.

Build these noindex and graduate them after calls. **Needs new data:** every occasion, bridal blouse (1), lehenga stitching (2), velvet (2), rush orders, audience.

**Model** (additive only; `npm run build` runs `prisma db push`): `Tag{type, slug, label, aliases}`, `StoreTag{evidence, source, checkedAt, note}`, `Store.rushDays`, and `PriceItem.source "customer"`.

- garment (16): bridal-lehenga, lehenga, saree, blouse, bridal-blouse, salwar-suit, anarkali, kurti-set, gown, indo-western, sherwani, bandhgala (incl. achkan, jodhpuri), kurta-pyjama, suit, tuxedo, shirt-trouser
- fabric (14): silk, banarasi, brocade-jacquard, georgette, chiffon, velvet, satin-crepe, net-organza, chanderi, cotton, khadi-handloom, linen, suiting, shirting
- craft (6): zari-zardozi, gota-patti, chikankari, kundan-stone, hand-embroidery, trims-laces
- occasion (10): wedding, engagement-roka, mehendi, haldi, sangeet-cocktail, reception, karwa-chauth, diwali-festive, eid, office-formal
- role (4): bride, groom, family, guest. Audience (3): women, men, kids
- mode (8): custom-stitching, alterations, made-to-measure, ready-to-wear, semi-stitched, rental, from-reference-photo, in-house-handwork

Migration: Bespoke, Men's and Formal Suits become suit; Saris and Sarees become saree. "Bridal" alone is ambiguous, so ask on the call.

## 3. Search and filter design

Facets:

- **Occasion:** new tags from calls; show the facet once 3+ shops are tagged.
- **Garment:** services plus tags; replaces the noisy speciality dropdown.
- **Fabric:** `materials` mapped (35% filled); ask tailors too.
- **Budget:** per-garment shop or menu price lines plus the 33%-filled band. `maxPrice` exists in `listStores` but not the UI. Show bands only where 5+ shops have data.
- **Area:** locality plus roll-up; "near me" once lat/lng coverage is measured.
- **Home visit:** 1 of 36 tailors.
- **Open now:** `getOpenState` exists. Label "as listed", exclude unknowns, and refresh the 30 Aug Places data first.
- **Rating:** "Google 4.5+", later "Groovyn visitors 4+, 3+ verified", never blended.

Done so far (8 Oct, working tree): the phrase is split into words and a shop must match every word; alternate spellings and Hinglish (lehnga, ghagra, darzi, silai, dulhan, cp, gk) are understood; "under 5000" is read as a budget; and if nothing matches every word the closest matches are shown with a note. Still to do: tag-driven facets, relaxing in a stated order, and a zero-result log.

Search design for the rest:

- Classify tokens by alias tables (garment, fabric, occasion, area, shop type, "under 30000", "near me", "open now") and AND them.
- Under 3 results, relax budget, then fabric, then occasion, then area, and say so.
- Group garment queries by route (buy: boutiques; make: tailors, fabric; rent), ordered by evidence tier then adjusted rating. Nothing is paid.
- Log zero-result queries weekly: they are your call list and calendar.
- Fix type-ahead: localities always link to /tailors.

## 4. Content calendar: 25 pieces

Every piece has a two-sentence answer first, a decision table, dated prices with source, a tag-filtered `shops` block and 4 FAQs. It links to the pillar, its offering, category and locality pages. Intent: I info, C commercial, T transactional, L local. Wedding dates cluster 21 Nov to 13 Dec, mid-Jan to Feb, 1 to 14 Mar, 18 to 29 Apr and May (sources differ by days) [10]. Bridal stitching needs 8 to 10 weeks, so February weddings order now.

Fieldwork packs:

- **A:** Chandni Chowk and Lajpat Nagar walks, photos, 9 dated quotes for one bridal brief.
- **B:** 8 rental calls (days, deposit, trial, cleaning).
- **C:** 4 fabric shops, dated per-metre ranges (silk, velvet, net, brocade), one burn-test demo.
- **D:** tailor calls (lead time, price range, trials).
- **E:** 30+ verified reviews.

About 20 founder hours unlock items 1 to 21.

1. 23 Oct, P1. **Indian Wedding Shopping Checklist: Bride, Groom, Family** → "indian bridal shopping checklist" (I). Per function: outfit, fabric, fitting, order-by.
2. 2 Nov, P0. **Wedding Shopping in Delhi: Fabric, Tailor, Rent** → "wedding shopping delhi" (I, C). Buy, make or rent; six steps; markets by need; budget ladder. A, D.
3. 5 Nov, P0. **How Groovyn Reviews Work.** Trust page: verified visits, moderation, incentives.
4. 9 Nov, P0. **Bridal Lehenga Price in Delhi: Chandni Chowk, Lajpat Nagar, Shahpur Jat** → "bridal lehenga price in delhi" (C). One brief, three markets. A.
5. 9 Nov, P0. **Groom Wear in Delhi: Sherwani, Bandhgala, Suit or Rent** → "sherwani for groom delhi" (C). Four routes. B, D.
6. 16 Nov, P0. **Sherwani on Rent in Delhi: Prices, Deposits, Trial** → "sherwani on rent delhi" (T). Terms table. B.
7. 16 Nov, P0. **Best Fabric for a Bridal Lehenga: Silk, Velvet, Net or Brocade** → "fabric for bridal lehenga" (I). Season, weight, per-metre ranges. C.
8. 23 Nov, P0. **Chandni Chowk for Weddings, Lane by Lane** → "chandni chowk wedding shopping" (I, C). One-day route. A.
9. 23 Nov, P1. **Bridal Blouse Stitching in Delhi: Cost, Lead Time, What to Ask** → "bridal blouse stitching delhi" (L). D.
10. 30 Nov, P1. **Lajpat Nagar for Weddings: Stitch, Rent, Fabric in One Trip** → "lajpat nagar wedding shopping" (C). A.
11. 30 Nov, P1. **Lehenga Stitching Cost in Delhi With Your Own Fabric** → "lehenga stitching cost in delhi" (C). D.
12. 7 Dec, P1. **Guest and Bridesmaid Outfits: Rent, 7-Day Stitch or Buy** → "bridesmaid lehenga delhi" (C). Decision table. B, D.
13. 7 Dec, P1. **Bandhgala, Jodhpuri, Achkan or Sherwani, and Which Tailors** → "sherwani vs bandhgala" (I). D.
14. 14 Dec, P1. **Check Silk, Georgette and Velvet Before You Buy** → "how to identify pure silk" (I). Touch, burn, bill. C.
15. 14 Dec, P2. **Fabric for a Sherwani or Bandhgala, and How Much** → "best fabric for sherwani" (I). C.
16. 21 Dec, P2. **Roka to Reception: Rent, Stitch or Buy by Function** → "sangeet outfit" (I). D.
17. 4 Jan, P2. **Reception and Cocktail: Gown, Indo-Western or Tuxedo** → "gown on rent delhi" (T). B, D.
18. 11 Jan, P2. **Mother of the Bride and Groom: Outfits, Fabrics, Fittings** → "mother of the bride outfit indian" (I). D.
19. 18 Jan, P2. **Suit and Shirt Fabric by Season in Delhi** → "suit fabric delhi" (C). C.
20. 25 Jan, P2. **Shankar Market, Connaught Place: A Tailor Lane Guide** → "shankar market tailors" (L). Walk, D.
21. 1 Feb, P2. **Summer Wedding Fabrics for April and May Dates** → "fabric for summer wedding lehenga" (I). C.
22. Feb, P1. **Tailor, Boutique, Readymade or Rent: Five Questions.** No fieldwork.
23. 8 Feb, P3, conditional. **Eid Outfits in Delhi: Order-By Dates** (Eid al-Fitr about 9 to 11 Mar, moon-dependent [10]). Only if 3+ Old Delhi tailors confirm Eid orders. D.
24. Mar, P3. **What Delhi Customers Actually Paid.** First verified-visit price survey, n shown. E.
25. Mar, P3. **Shops Customers Rated Best for Bridal Blouses, Sherwanis, Rentals.** Lists with 5+ reviews only. E.

## 5. Upgrades to existing pages

**Shop pages** (about 280 words plus "No photos, price list, reviews yet" notices):

- "Stated for" chips with evidence and date ("Bandhgala: confirmed by phone, 21 Oct"), linking indexable offering pages.
- Replace the notices with "Ask before you book", built only from what is unconfirmed for that shop (rental: deposit, days, cleaning; tailor: trials, advance, written delivery date). Add FAQs built only from stated facts. No shared boilerplate.
- Show the shop rate card (dated) beside the Delhi indicative range, never merged. Add an evidence ledger (Google rating pulled on, call on, photo credit) and "nearby" by shared tag.

**Category and locality pages:**

- A top-8 comparison table: area, Google rating and count, stated for, price with its label, lead time, checked on.
- A two-line "How we chose" plus honest completeness ("14 of 36 confirmed by phone").
- "Browse by what you need" chips.
- On localities, a first-hand "what this market is good for" and computed lines ("4 of 6 fabric shops here list suiting or shirting").

**Guides:** founder byline, "prices dated" box, corrections log.

**"Best for" labels, computed only:** "Stated for X (call, date)", "Most Google reviews here (50+)", "Highest Google rating here (50+ reviews)", "Lowest listed price (shop rate card only)", "Open Sundays (as listed)", "Stated rush: N days", "Home visits". "Best for X" needs L3: 3+ verified-visit reviews averaging 4.3+ on that service, n shown.

## 6. User feedback in the plan

**Flow.**

- Book, then a server-issued short code. Today's `GV-` token is made in the browser and never stored, so no shop can check it.
- The shop confirms the visit by WhatsApp reply, or staff set the existing `visited` status.
- Then: a single-use review link (60 days), Google sign-in, four factual questions (fit, finish, delivered on the promised date, final price equal to quote) plus text, moderation, publish.
- Verified visits only at launch. Signed-in Q&A sits on shop pages; each shop answer counts as L1 evidence.

**Sign-in, honestly and privately.**

- Scopes `openid email profile` only. Put the consent screen In production, because Testing mode caps at 100 users and 7-day authorisations [17].
- Show first name and initial, never email or photo. The phone goes only to the booked shop.
- Browsing, calling, WhatsApp and booking work without signing in. The offer stays public in the shop's words with terms and an end date.
- Sign-in is optional for the pass (a guest booking gets one too) and required only for reviews and Q&A. Gating an advertised offer behind personal data risks India's "forced action" dark-pattern rule [15].
- Suggested copy: "Sign in with Google to get your visit pass and rate this shop afterwards. We get your name and email, post nothing, and never show your email or share it with shops."
- Update the privacy policy (it says sign-in cookies are staff-only). Take separate consents for booking, publishing your review, and updates (off by default). Allow deletion.
- Meet the DPDP notice-and-consent standard now; it applies from 13 May 2027 [14].

**Incentives.** None for ratings; the offer rewards the visit, not the review. Any thank-you for feedback is identical for every rating, marked on the review, and asked of every visitor. BIS IS 19000:2022 wants rewards independent of content and flagged [13].

**Moderation.** Publish criteria at `/review-policy`. Publish or reject, never rewrite (authors may edit, marked). Keep removals and reasons for 180 days and answer flaggers with reasons. Shops reply once, may dispute with an invoice, and cannot remove.

**Markup and ranking.**

- Add `aggregateRating` and `review` to a shop page only with 5+ published verified reviews shown there, from signed-in users, unedited by staff or shop.
- Google wants ratings "sourced directly from users", visible on the page, not compiled by editors or taken from other sites, and it excludes reviews the business controls [12].
- Never include Google's numbers, and never mark up list pages.
- Groovyn ratings enter the adjusted score only at 5+ reviews with the same prior of 50. Update `/how-we-rank` in the same change.

**Feeding content.** Add per-question stats in guides ("17 of 23 verified blouse orders on time", n shown, minimum 5). Keep customer-reported prices as source "customer", apart from rate cards. Repeated questions become guides. FAQ markup no longer earns rich results for most sites [16].

## 7. Risks and what not to do

- Estimates are not evidence: all 43 price lines are estimates and alone make 3 service pages indexable. Count L1 and above. No tag x area x budget matrices or templated paragraphs.
- "Best" needs its method line and honest completeness (20 of 75 shops have any rating).
- Never gate offers or prices behind sign-in. No countdowns or "only N slots"; false urgency is a named dark pattern [15].
- Skip "replica" lehenga framing and designer names as keywords; say "works from a reference photo".
- Never run `db:seed` on production (18 synthetic shops). Refresh the 30 Aug Places data before "open now".
- No Gurugram or Noida pages until 10+ shops per category. Demand exists ("lehenga on rent gurgaon"), but supply is 5 and 1.

## Not verified

- Counts are keyword matches on `data/delhi-batch-*.json`, not the live database.
- Autocomplete is not volume. `site:` fails in the search tool, so indexing is unchecked.
- WeddingBazaar returned 403; the BIS Feb 2026 scheme PDF and Reddit threads were unreadable.
- DPDP, BIS and dark-pattern details come from search or fetch summaries, so have them checked by a lawyer before relying on them.
- One fetch summary said 97 shop URLs; the raw sitemap has 118 URLs and 75 shops.
- Bhai Dooj and Chhath dates conflicted with Diwali on 8 Nov and were not used.

## Sources

- [1] traveltriangle.com/blog/wedding-shopping-in-delhi/
- [2] urbancompany.com/blog/delhi-wedding-shopping-guide-defence-colony-edition
- [3] weddingbazaar.com/blog/best-bridal-lehenga-shops-in-chandni-chowk
- [4] wedmegood.com/vendors/delhi-ncr/bridal-wear/
- [5] wedmegood.com/blog/10-places-where-you-find-sherwanis-on-rent-in-delhi/amp
- [6] jaypeehotels.com/blog/best-cloth-markets-in-delhi
- [7] azafashions.com/blog/finding-your-dream-bridal-lehenga-fabric-silk-velvet-or-net
- [8] azafashions.com/blog/what-to-wear-to-an-indian-wedding-as-a-guest/
- [10] theweddingfocus.com/blog/wedding-dates-2026/, daanyam.in/blog/vivah-muhurat-2026-27-choosing-your-wedding-date, blog.wego.com/ramadan-2027/
- [11] developers.google.com/search/docs/essentials/spam-policies
- [12] developers.google.com/search/docs/appearance/structured-data/review-snippet
- [13] medianama.com/2022/12/223-summary-bis-standard-online-reviews-e-commerce/
- [14] barandbench.com/view-point/meity-notifies-final-digital-personal-data-protection-rules-2025
- [15] jsalaw.com/newsletters-and-updates/ccpa-issues-guidelines-for-prevention-and-regulation-of-dark-patterns-2023/
- [16] developers.google.com/search/blog/2023/08/howto-faq-changes
- [17] support.google.com/cloud/answer/15549945
