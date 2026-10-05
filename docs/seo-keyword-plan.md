# SEO keyword plan

Written 2026-10-01. Read the next section before trusting any of it.

## What this is, and what it is not

**I did not have search-volume data.** The Ahrefs and Similarweb connectors need
authorising, and the web-search tool available here is US-based. So every
"potential" rating below is my judgement from the *shape* of each results page
(who ranks, what kind of page, how strong), not from measured volume. Before you
invest in any cluster, check it in **Google Search Console** (once the domain
moves) and **Google Keyword Planner** (free, India-specific).

What I did verify, by searching each query and reading who ranks:

| Query | Who ranks today | What that tells us |
|---|---|---|
| best tailors in Delhi | Tailors' own listicles (Silailor, Tailor Boutiques, Needles & Thimbles), Medium and LinkedIn posts, thin directories (Local Divine, ThreeBestRated) | Promotional, undisclosed ranking, almost no data. A neutral, data-backed page has a real gap to fill |
| how to measure for a salwar kameez / blouse | US and diaspora fashion brands (Utsav, Lashkaraa, Aza, Fabricoz) | Nothing India-native, nothing in cm *and* inches, no tailor vocabulary |
| lehenga on rent in Delhi | IndiaMART listings, WedMeGood, small blogs (ShaadiDukaan, MakeupWale), Flyrobe | Marketplace-dominated; a neutral checklist guide is differentiated |
| suit stitching charges in Delhi | Tailors' own price pages (Silailor, Iqbal Bros, Dori) | Each only shows its own prices; nobody publishes a neutral benchmark |
| buy lehenga online India | Etsy, Koskii, Panash, Zari Jaipur, Karmaplace | Pure e-commerce. Not winnable, and not your business (see below) |
| best fabric markets in Delhi | Hotel and travel blogs (Jaypee, Treebo, Fabhotels, Triphippies) | Low-authority sites. You hold real shop data in the same localities |
| online body measurement app | App-store listings, vendor blogs (3DLook, Mirrorsize, Grid Dynamics) | Vendors make unverifiable claims. An honest, private, in-browser tool is differentiated |
| how to choose a tailor | Western bespoke tailors | No Delhi-specific, neutral guide |

## Two terms to stop chasing

**"Buy lehenga" / "buy lehenga online".** The results page is product listings and
shopping features from e-commerce sellers. You do not sell lehengas, and a
directory cannot out-rank a store for a purchase query. The winnable intent sits
one step earlier, at the decision: *readymade vs semi-stitched vs custom*, what
each costs to finish, where in Delhi to get it done. That is the post we built
(`/blog/readymade-semi-stitched-or-custom-lehenga`), and it is the honest way to
capture people who start from "buy lehenga".

**"Best tailors in India".** You list Delhi NCR only. A page claiming India would
be claiming coverage you do not have, and Google will not reward it. The route to
national terms is to add cities with real data, one at a time, each with its own
listings. Do not create empty city pages to chase the keyword.

## Keyword map

Each keyword is assigned to exactly **one** page. Two pages chasing the same query
split their own ranking, so where a guide and a listing page overlap, the listing
takes the "shops" query and the guide takes the "how/what/why" query.

"Potential" is my unverified judgement: **High** = broad, recurring demand is
likely; **Med**; **Niche** = small but very high intent.
"Difficulty" is inferred from who ranks today: **Low** = weak or off-topic pages,
**Med**, **High** = strong, entrenched sites.

### A. Directory pages (the money pages)

| Keyword | Target URL | Potential | Difficulty | Status |
|---|---|---|---|---|
| best tailors in Delhi, tailors in Delhi, top tailors in Delhi | `/delhi/tailors` | High | High | Built. Title, data-built intro, FAQ and ranked order added |
| ladies tailor in Delhi, gents tailor in Delhi | `/delhi/tailors` (facets) | High | Med | Partial. See backlog: add dedicated pages once shops are tagged by gender |
| best boutiques in Delhi, designer boutiques in Delhi | `/delhi/boutiques` | Med | Med | Built |
| fabric shops in Delhi, cloth market in Delhi | `/delhi/fabric-shops` | High | Med | Built |
| rental shops in Delhi, dress on rent in Delhi | `/delhi/rental-shops` | Med | Med | Built |
| best tailors in Delhi NCR (Gurugram, Noida) | `/gurugram/tailors`, `/noida/tailors` | Med | Med | Built, but `noindex` until a city lists three shops in that category, so a thin page cannot drag the site down. It turns indexable on its own as shops are added |

### B. Locality long tail

The quietest, most winnable wins. Each is a page that already exists; it needs a
real intro and at least three shops to be worth indexing.

`/delhi/{category}/in/{locality}` for the 26 localities that have shops. The
largest: Connaught Place (10 tailors), Lajpat Nagar (6 fabric, 4 rental,
2 tailors), Chandni Chowk (5 fabric, 2 boutiques), Shahpur Jat (3 boutiques,
2 tailors), Greater Kailash 1 (3 tailors), Nehru Place (3 fabric).

| Keyword pattern | Example | Potential | Difficulty |
|---|---|---|---|
| tailors in {locality} | tailors in Connaught Place | Med | Low to Med |
| fabric shops in {locality} | fabric shops in Lajpat Nagar | Med | Low |
| boutiques in {locality} | boutiques in Shahpur Jat | Med | Low |
| lehenga on rent in {locality} | lehenga on rent in Lajpat Nagar | Niche | Low |

**Risk:** a locality page with one shop is thin. Index only those with three or
more, and `noindex` the rest until they grow.

### C. Price and cost

| Keyword | Target URL | Potential | Difficulty | Status |
|---|---|---|---|---|
| tailoring charges in Delhi, stitching charges in Delhi, tailor price list Delhi | `/blog/tailoring-charges-in-delhi` | High | Med | Built, with a live benchmark table |
| sherwani stitching cost Delhi, custom sherwani price Delhi | `/blog/sherwani-stitching-cost-in-delhi` | Med | Med | Built |
| lehenga on rent in Delhi price, bridal lehenga rental Delhi | `/blog/lehenga-on-rent-in-delhi` | High | Med | Built |
| Delhi clothing price index | `/delhi/prices` | Med | Low | Built. Indexable for Delhi only |
| blouse stitching charges Delhi, suit stitching cost Delhi | backlog | High | Med | See backlog |

### D. Measurements (your differentiator)

| Keyword | Target URL | Potential | Difficulty | Status |
|---|---|---|---|---|
| how to take body measurements at home, how to measure yourself for clothes | `/blog/how-to-take-body-measurements-at-home` | High | Med | Built |
| blouse measurements at home, how to take blouse measurements | `/blog/how-to-measure-for-a-blouse-at-home` | High | Low to Med | Built |
| how to measure for a lehenga | `/blog/how-to-measure-for-a-lehenga` | Med | Low | Built |
| how to measure for a suit, shirt and trouser measurements | `/blog/how-to-measure-for-a-suit-and-shirt` | Med | Med | Built |
| online body measurement, body measurement app, measure body with phone camera, how accurate are body measurement apps | `/blog/online-body-measurement-how-accurate` | Med | Med | Built |
| free body measurement online, body scan from photo | `/measurements` (the tool) | Med | Med | Built, with WebApplication markup |
| body measurement chart women / men, size chart in cm | backlog | High | High | See backlog |

### E. Choosing and buying

| Keyword | Target URL | Potential | Difficulty | Status |
|---|---|---|---|---|
| how to choose a tailor in Delhi, questions to ask a tailor | `/blog/how-to-choose-a-tailor-in-delhi` | Med | Low | Built |
| custom lehenga vs readymade, semi stitched lehenga meaning, readymade vs semi stitched | `/blog/readymade-semi-stitched-or-custom-lehenga` | Med | Med | Built. Also the honest route to "buy lehenga" |
| best fabric market in Delhi, Chandni Chowk fabric market, Karol Bagh fabric market, where to buy fabric in Delhi | `/blog/best-fabric-markets-in-delhi` | High | Low | Built. Highest-confidence opportunity |
| when to order wedding outfits, wedding outfit timeline | `/blog/when-to-order-wedding-outfits-delhi-timeline` | Med | Low | Built |

## Backlog: the next posts worth writing

Chosen because each one (a) answers a real question, (b) matches a service you
already have in the catalogue, and (c) has a weak or off-topic page ranking today.

1. **Body measurement chart for women, with cm and inches.** A reference table people bookmark. Highest evergreen pull of anything here, and the most competitive.
2. **Men's shirt, kurta and trouser size chart for India (S to XXL in cm).** Same.
3. **Saree blouse vs readymade blouse: which to choose, and what stitching costs.** Links to `blouse-stitching`.
4. **Alteration charges in Delhi: hemming, taking in, zips, lengthening.** The catalogue has an `alterations` service; the only India source ranking is a single pickup-service blog.
5. **Saree fall and pico charges in Delhi.** Small, specific, high intent. The `saree-fall-pico` service exists.
6. **Anarkali and salwar suit stitching: what to measure and what it costs.**
7. **Kurta pyjama stitching: measurements, fabric needed and cost.**
8. **Bridesmaid and guest outfits: rent, buy or stitch?**
9. **How to read a tailor's quote: a worked example.** Builds on the pricing post.
10. **Fabric guide: silk, linen, suiting and shirting, and what to ask the seller.** Links to all four fabric services.
11. **Wedding shopping in Delhi: a one-day route by market.** Combines fabric, trims and tailors by area.
12. **Gender-specific tailor pages** ("ladies tailor in Delhi", "gents tailor in Delhi") once shops are tagged. Needs a schema change, so it is a product task first.

## Technical SEO: done, and still to do

**Done in this pass**

- 12 guides, 13,773 words, behind a quality gate (`npm run verify:blog`) that fails on thin content, over-long titles, bad descriptions, duplicate headings, broken internal links and dead live-data blocks.
- `BlogPosting`, `FAQPage`, `BreadcrumbList` and `WebApplication` structured data. No ratings markup anywhere; Google's ratings are displayed and labelled, never marked up.
- Category pages: keyword-led titles with the year and real shop count, an intro and FAQ built from the page's own data, related guides, and matching FAQ markup.
- Shop ordering fixed. Pages titled "Best tailors in Delhi" had been sorting A to Z. They now rank by Google rating adjusted for review count, so 4.8 from 653 reviews beats 5.0 from 2. Shops cannot pay to move up.
- Sitemap now includes the blog (with real modified dates), the measurement tool and the Delhi price index. Gurugram and Noida price indexes are `noindex` so they do not duplicate Delhi's figures.
- Thin pages kept out of the index: a city category page, a locality page or a `/services/...` page is `noindex` and left out of the sitemap until it lists three shops. Visitors can still reach them, and they flip to indexable by themselves as shops are added.
- Per-guide share images (WhatsApp previews), an RSS feed, and `llms.txt`.
- Guides linked from the header, footer, home page, category pages and the measurement page.

**Still to do (I cannot do these for you)**

1. **Move groovyn.com to this site.** None of this ranks while groovyn.com still serves the old site. On Vercel, set `NEXT_PUBLIC_SITE_URL=https://groovyn.com` *before* the switch so canonicals, the sitemap and share images use the right domain.
2. **Turn off Cloudflare's managed robots.txt**, which blocks AI crawlers and will override the `robots.ts` in this repo.
3. **Verify the domain in Google Search Console** and Bing Webmaster Tools, submit `/sitemap.xml`, and check Coverage after a week.
4. **Finish the Google ratings.** Only 11 of 36 tailors, 3 of 19 fabric shops and 2 of 6 boutiques have a rating. Re-run `npm run enrich -- --refresh` (after rotating the key you pasted in chat). Pages titled "Best" look far stronger when most shops carry a rating.
5. **Backlinks.** For a competitive head term like "best tailors in Delhi", on-page work is necessary but not enough. The natural source is the shops themselves: when an owner claims a listing, offer a "Listed on Groovyn" badge that links back. Local press and wedding-planning communities are the other honest routes. Do not buy links.
6. **Publish real rate cards.** The pricing pages are the clearest thing competitors cannot copy, and they only become real when shops publish. Every rate card you collect converts an indicative range into a shop's own figure.

## What to expect

A new domain with new content takes months, not weeks. Order of likely results:

1. **First 4 to 10 weeks:** the low-difficulty, specific pages start to surface. Fabric markets, how to choose a tailor, lehenga measurement, the locality pages.
2. **Months 3 to 6:** the measurement guides and pricing pages, as they pick up links and as Google sees the site is maintained.
3. **Later, and only with backlinks and ratings:** "best tailors in Delhi" itself.

Watch these in Search Console, not rankings tools: impressions and average
position per page, then clicks. Re-check this document after 90 days and cut any
cluster that has not moved.

## Rules that keep this credible

- No invented statistics, quotes, reviews or shop claims. If a fact is not in the data, the sentence is left out.
- Prices are labelled as indicative benchmarks, and shop-supplied rates are labelled separately. The two never look alike.
- Update `dateModified` only when a post genuinely changes.
- Every new post must pass `npm run verify:blog` before it ships.
