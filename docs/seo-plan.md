# Groovyn SEO Plan

Written 6 Oct 2026 for https://www.groovyn.com. A 90-day plan to get groovyn.com found for tailors, boutiques, fabric and rentals in Delhi NCR, built from a live check of the site.

This plan covers the next 90 days and what comes after. It is built from a live check of www.groovyn.com on 6 Oct 2026, your own listing data, Lighthouse reports and a look at who ranks for your target searches today.

I had no search-volume data. Every 'odds' rating below is judgement from the search results pages, not measured demand. Search Console will replace those guesses with real numbers within a few weeks, and the plan is meant to be re-cut then.

## Progress

- **9 Oct.** Ready in the working copy, waiting for your go-ahead to deploy: the claim-your-shop page, header button, footer link and home section are gone (old links go to Contact). Phone fixes: category pages no longer scroll sideways, the booking form comes right after the shop header with a Book a free visit bar at the bottom of the screen, and the home hero is realigned. Every shop page without a price list now shows typical Delhi prices, clearly labelled, and prices read off 8 shops' own websites are ready to load. There is a Book through Groovyn section on the home page, and a gold Visit offer badge that appears only when a shop has agreed to an offer.
- **8 Oct.** A content review of the site for wedding shoppers is done (docs/content-plan.md). It found that the home page over-promised, and that multi-word searches returned nothing. Both are fixed in the working copy and wait for deploy. Its ten next steps are in the new phase below, and its 25-piece wedding calendar is under Content.
- **8 Oct.** Now live: the Diwali outfit stitching guide, a 2026 to 2027 season section in the wedding timeline guide, visit-count and page-speed tracking (it starts counting once you switch Web Analytics and Speed Insights on in Vercel), and an IndexNow submission of all 118 pages to Bing and other search engines. Search Console is a Domain property and has read the sitemap. So far Google has indexed 1 page and shows 3 search clicks in total. Still to do: switch on Vercel Analytics and Speed Insights, request indexing in Search Console for the key pages, image descriptions and page speed.
- **7 Oct.** Live now: About, Contact, FAQ, How we rank, Privacy Policy, Terms of Use and Cancellations and Refunds, with groovyntech@gmail.com and Bengaluru as the contact details. Also fixed: og:url on /measurements, /claim and /suggest, redirects for the old language paths and for groovyn-web.vercel.app, and security headers. The 12 guides were already live. Still open from week one: analytics, image descriptions, page speed, the seasonal pages and the Search Console steps.

## The short version

- **Google barely knows the domain.** A search for site:groovyn.com shows one page, the old home page. Domain age is not a ranking factor, so treat this as a new site on a good address, not an old site with authority. The visitor numbers you saw were probably Cloudflare's, which count bots and were for the old site.
- **The site itself is healthy.** Mobile Lighthouse on the home page scores 100 for SEO, redirects and the sitemap are clean, and the admin area is locked. The gaps are trust pages (none exist), analytics (none installed), thin shop pages and zero photos.
- **Do not fight on breadth.** Justdial shows about 41,000 Delhi tailors. You list 75. Win on trust instead: honest ranking, real prices, real photos, a free measurement tool, and local guides written from first-hand visits.
- **The next four weeks matter most.** Fix the gaps, get shops to send their rate lists, photos and a visit offer, and publish the seasonal pages before Karwa Chauth (29 Oct), Diwali (8 Nov) and the wedding season, which resumes after 20 Nov.

### If you only have an hour a day

- Check Search Console is a Domain property and the sitemap is submitted (10 min).
- Rotate the Google key and revoke the Cashfree key (15 min).
- Send me your business details for the About, Privacy and Terms pages.
- WhatsApp 10 shops a day with the message in Appendix B, asking for their rate list, three photos and a small offer for Groovyn visitors. This is the highest-leverage task in the plan.
- Photograph one shop on your way somewhere: front, inside, one sample of their work.

## What I checked on the live site

- **Live since:** 6 Oct 2026 at www.groovyn.com (groovyn.com redirects to it)
- **Pages in the sitemap:** 110: 75 shops, 12 guides, 7 locality, 5 city, 4 category, 3 service, 4 other
- **Listings:** 75 (Delhi 69, Gurugram 5, Noida 1). Tailors 36, fabric 19, rental 8, boutiques 6 in Delhi
- **Shops with a Google rating:** 20 of 75 (median 123 reviews)
- **Shops with photos, verified, their own rate card:** 0, 0, 0
- **Bookings, shop offers, reviews so far:** 0, 0, 0 (the new site is only hours old)
- **Pages Google shows for the domain:** 1 (the old home page)
- **Median shop page length:** 284 words: one short unique paragraph, hours, address and a booking form, plus 'No photos yet', 'No price list yet' and 'No reviews yet' notices
- **Lighthouse, mobile, home:** Performance 93, Accessibility 97, Best practices 100, SEO 100. LCP 2.9 s
- **Analytics installed:** None

- OK: **HTTPS and redirects.** HTTPS with HSTS. http redirects to https, and groovyn.com redirects to www.groovyn.com. One canonical host.
- OK: **robots.txt and sitemap.** Crawling allowed, including AI crawlers. /api, /search and /admin disallowed. Sitemap has 110 URLs, all on www.groovyn.com. Cloudflare's own robots.txt is gone now the cloud is grey.
- OK: **Canonicals and share tags.** Correct on every page I sampled, except /measurements (see below).
- OK: **Admin area.** /admin redirects to the login page, which is noindex, nofollow.
- OK: **Speed on cached pages.** Home and guides respond in 0.1 to 0.2 s. Brotli compression is on. CLS is 0 or close to it on every page tested.
- GAP: **No trust or legal pages.** /about, /contact, /privacy, /terms, /refund-policy and /faq all return 404. Needed for trust, for India's data-protection rules (you collect phone numbers and body measurements), and usually for the Play Store and payment gateway. (task `p0-trust`)
- GAP: **No analytics.** No Google Analytics, Vercel Analytics or similar. You cannot see visitors, calls or bookings on the new site. (task `p0-analytics`)
- GAP: **Duplicate copy of the site.** groovyn-web.vercel.app serves the whole site with a 200. Its canonical points at www.groovyn.com, but a redirect is cleaner. (task `p0-redirects`)
- GAP: **Old language paths.** The old site had /hi-in, /de-de, /es-es, /fr-fr, /nl-nl and /zh-cn. They now 404. (task `p0-redirects`)
- GAP: **Main address is www.** You asked for groovyn.com. Vercel made www primary. Fine for SEO if consistent, cheap to change this week, harder later. (task `p0-host`)
- GAP: **Empty image descriptions.** Every image has empty alt text, so none can appear in image search or help a screen reader. (task `p0-bugs`)
- GAP: **No photos on any shop.** 0 of 75 listings have a photo. Competitors show them. (task `p1-photos`)
- GAP: **Thin shop pages.** 206 to 345 words each (median 284). Only the short about paragraph is unique. Photos, price list and reviews show 'No ... yet' notices, and the only images are logos. Schema has name, address, phone and sameAs only: no location, opening hours, image or price range. (task `p1-shop-v2`)
- GAP: **Listing pages are not cached.** Category, locality and price pages take 0.4 to 0.55 s to first byte, are never cached, and ship 200 to 280 KB of HTML. (task `p1-isr`)
- GAP: **Wrong og:url on /measurements.** Its og:url is the home page, so a link share can preview the wrong page. (task `p0-bugs`)
- GAP: **Mobile LCP slightly slow.** LCP is 2.5 to 2.9 s on mobile (the target is 2.5 s or less). Unused JavaScript of 21 to 28 KB, old-browser JavaScript of 14 KB on every page, and colour-contrast warnings on every page plus heading-order and list markup warnings on some. (task `p0-perf`)
- GAP: **Google data is stale.** Some hours, phone numbers and ratings were last pulled on 30 Aug (37 days ago). Google limits how long that content may be kept. The old API key needs rotating before a refresh. (task `p0-keys`)
- GAP: **Security headers.** Only HSTS is set. (task `p0-headers`)

### Lighthouse, mobile, 6 Oct 2026

| Page | Perf | A11y | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Home | 93 | 97 | 100 | 100 | 2.9 s | 150 ms | 0 |
| Category (/delhi/tailors) | 95 | 92 | 100 | 100 | 2.8 s | 70 ms | 0 |
| Shop page | 95 | 96 | 100 | 100 | 2.8 s | 130 ms | 0.001 |
| Guide | 95 | 96 | 100 | 100 | 2.8 s | 50 ms | 0 |
| Measurement tool | 97 | 96 | 100 | 100 | 2.5 s | 100 ms | 0 |

## Who we are up against

| Kind of search | Example | Who ranks today | Our odds |
|---|---|---|---|
| Head terms | best tailors in Delhi, tailors near me | Justdial (about 41,000 Delhi tailor listings), tailor-brand listicles, chotu.com locality pages | Hard now. Medium after links and data |
| Price questions | blouse stitching charges Delhi, saree fall pico charges | IndiaMART directories, tailors' own price lists (Silailor, Karina, makemy.design) | Medium. Wins with real rate cards |
| How-to | how to measure for a blouse, size charts | US and diaspora fashion brands, YouTube | Medium to good. India-specific, cm and inches, tailor vocabulary |
| Markets | fabric market Delhi, Chandni Chowk lanes | Travel and hotel blogs, TripAdvisor, Quora | Good. Weak competition and you hold real shop data |
| Bridal and rental | lehenga on rent Delhi, bridal boutiques | WedMeGood, Weddingz, IndiaMART, YouTube tours | Medium. Needs first-hand detail |
| Doorstep | tailor at home Delhi, doorstep tailor | Silailor, Apnaa Darzi, Tailor Boutiques, MS Creation, Doorstep Stitch | Medium. Partner with them rather than fight |
| Tools | fabric calculator, size converter | A few small tools (for example stitchmagic.in) | Good. Few India-first tools, and tools attract links |
| Brand | groovyn | Nothing yet | Good once indexed |

### What we have that they do not

- **Neutral ranking.** Shops cannot pay to rank. Best-of pages sort by Google rating adjusted for review count. Say so on a methodology page.
- **Honest prices.** Shop-supplied rate cards are kept apart from estimates. Almost nobody publishes verified Delhi price lists.
- **A free, private measurement tool** that runs on the phone and admits its accuracy limits.
- **Local depth written from first-hand visits.** Competitors write market guides from a desk.
- **A booking flow,** so a ranking can turn into a visit.

## The plan, in order

### This week (6 to 12 Oct)

Close the gaps, start measuring, and publish the seasonal pages before the festival rush.

- [x] **Make sure Search Console is a Domain property and the sitemap is in** (You, effort S, high impact, Foundation) `p0-gsc`
  In Search Console, Settings should show 'Domain: groovyn.com'. If it shows a property starting with https://, add a Domain property too (Add property, Domain, groovyn.com, then add the TXT record in Cloudflare). Then Sitemaps, and submit `sitemap.xml` for www.groovyn.com.
- [ ] **Request indexing for the 10 key pages** (You, effort S, high impact, Foundation) `p0-index`
  URL Inspection, paste each URL, Request indexing: home, /delhi/tailors, /delhi/fabric-shops, /delhi/boutiques, /delhi/rental-shops, /blog, /measurements, /blog/best-fabric-markets-in-delhi, /blog/tailoring-charges-in-delhi, /blog/when-to-order-wedding-outfits-delhi-timeline. Google allows about 10 a day.
- [ ] **Add the site to Bing Webmaster Tools** (You, effort S, med impact, Foundation) `p0-bing`
  Use 'Import from Google Search Console'. Bing's index also feeds Copilot and some AI answers.
- [ ] **Decide the main address: keep www or switch to groovyn.com** (You, effort S, med impact, Foundation) `p0-host`
  Both are fine for SEO if one is used everywhere. Keeping www needs no work. To switch: Vercel, Domains, make groovyn.com primary and let www redirect to it, change `NEXT_PUBLIC_SITE_URL` to `https://groovyn.com`, redeploy. Decide this week, before Google settles on www.
- [ ] **Rotate the Google API key and revoke the Cashfree key** (You, effort S, high impact, Foundation) `p0-keys`
  The Google key was pasted in chat. The Cashfree production key sits in the public Android repo (github.com/groovyn/android-app-user). Put the new Google key in your local .env and in Vercel. Never paste it in chat.
- [ ] **Check the Android listing and Cashfree dashboard for dead links** (You, effort S, high impact, Foundation) `p0-play`
  The old site's pages are gone. In Play Console check the privacy-policy URL and website link. In Cashfree check the business website and policy URLs. They must point at pages that exist (see the trust pages task).
- [x] **Build About, Contact, Privacy, Terms, Refund, 'How we rank' and Editorial policy** (Claude, effort M, high impact, Foundation) `p0-trust`
  Plus footer links and Organization schema with logo and social links. I need your registered business name, address, contact email and phone, a grievance-officer name, and your social profile links. Have a lawyer or CA read the legal text before you rely on it.
- [ ] **Install analytics and conversion events** (Claude, effort S, high impact, Measurement) `p0-analytics`
  Vercel Web Analytics (free, no cookies) and, if you want it, GA4. Events: booking started and submitted, scan started and completed, call tap, directions tap, shop-website tap, WhatsApp tap. Tell me if you want GA4 and send the measurement ID.
- [ ] **Fix og:url, image descriptions and the Lighthouse warnings** (Claude, effort S, med impact, Pages) `p0-bugs`
  Correct og:url on /measurements and add an og:url equals canonical check to the audit script. Write real alt text for non-decorative images. Fix colour contrast, heading order and list markup.
- [x] **Redirect the old paths and the vercel.app copy** (Claude, effort S, med impact, Foundation) `p0-redirects`
  301 the old /hi-in, /de-de, /es-es, /fr-fr, /nl-nl and /zh-cn paths to the home page. Redirect groovyn-web.vercel.app to the main address so only one copy exists.
- [x] **Add security headers** (Claude, effort S, low impact, Foundation) `p0-headers`
  X-Content-Type-Options, Referrer-Policy, frame-ancestors, and a Permissions-Policy that still allows the camera on the measurement page.
- [x] **Publish the festival and wedding-season pages by 12 Oct** (You + Claude, effort M, high impact, Content) `p0-seasonal`
  (1) 'Diwali outfit stitching in Delhi: order-by dates and express options' (Karwa Chauth Thu 29 Oct, Dhanteras Fri 6 Nov, Diwali Sun 8 Nov). (2) Update the wedding timeline guide for this season: it resumes after Devuthani Ekadashi on 20 Nov, so the booking rush is now. Link a Panchang source for dates rather than copying them. You: name 3 to 5 tailors who really take express orders and their last-order dates.
- [ ] **Bring mobile LCP under 2.5 s** (Claude, effort S, med impact, Pages) `p0-perf`
  Prioritise the main image, drop unused fonts and JavaScript, remove old-browser polyfills. Current LCP: home 2.9 s, category 2.8 s.
- [ ] **Refresh Google Places data, then show 'last verified' on shop pages** (Claude, effort S, med impact, Data) `p0-refresh`
  Needs the new key from the rotation task. Then a monthly refresh reminder, so hours and ratings never go stale.

### Weeks 2 to 5 (13 Oct to 9 Nov)

Make shop pages worth ranking, start earning trust, and publish the price guides.

- [ ] **Ask shops on WhatsApp for a rate list, photos and a visit offer** (You, effort M, high impact, Data) `p1-claim-drive`
  Message the 36 tailors first, then 19 fabric shops, 8 rentals and 6 boutiques, with the text in Appendix B. The public claim page was removed on 9 Oct, so shops now send things to you on WhatsApp and you pass them to me. Goal: 15 shops with a rate list or photos by 9 Nov. Each one brings a real price, a better page and a likely link back.
- [ ] **Add an admin form for a shop's rate card, photos, hours and visit offer** (Claude, effort M, high impact, Data) `p1-admin-editor`
  With the claim page gone, this is how what shops send you reaches their page without a developer. Today a visit offer can be set with 'npm run offer', and prices read off a shop's own website can be loaded with 'npm run import:web-prices'.
- [ ] **Photograph 25 shops, 3 photos each** (You, effort L, high impact, Data) `p1-photos`
  Front with the sign, inside, one sample of their work. Ask permission. Name files like `grover-tailors-khan-market-front.jpg`. I add upload, compression, alt text and an image sitemap. Photos are 0 of 75 today.
- [ ] **Collect 20 rate cards from tailors** (You, effort M, high impact, Data) `p1-ratecards`
  A phone photo of their price list is enough. I enter them as 'shop-supplied, dated'. This is what unlocks real price pages and the price index, which competitors cannot copy.
- [ ] **Shop page v2 and richer schema** (Claude, effort M, high impact, Pages) `p1-shop-v2`
  Sections: services and starting prices, specialities, good for, open now, map and directions, photos, nearby alternatives, a shop-specific FAQ and an 'ask before you book' checklist, with a last-verified date. Cut template filler. Add location, opening hours, image, area served and price range (only when the shop supplied it). Never put Google ratings into `aggregateRating`.
- [ ] **Make listing pages cacheable** (Claude, effort M, med impact, Pages) `p1-isr`
  Show every shop on one page (up to 48) and move sorting into the browser, so category, locality and price pages can be cached. Target first byte under 150 ms and HTML under 120 KB.
- [ ] **Publish four price guides** (Claude, effort M, high impact, Content) `p1-price-posts`
  Blouse stitching charges, alteration charges, saree fall and pico charges, suit stitching charges. Label figures 'indicative' until rate cards cover them, and say how the numbers were gathered.
- [ ] **Fabric calculator tool page** (Claude, effort M, med impact, Content) `p1-fabric-calc`
  Metres needed for lehenga, kurta, blouse, suit and sherwani by size and fabric width (44 or 58 inch). An indexable page with explanation and FAQ. Tools earn links that articles do not.
- [ ] **Grow listings from 75 to about 110 where it unlocks pages** (You + Claude, effort M, high impact, Data) `p1-listing-growth`
  Eight locality and category pairs have exactly 2 shops. One more each makes eight new indexable pages. Find shops through Google Places, verify by phone, and keep the quality gate: operational, phone, hours, address. Never bulk-add thin listings.
- [ ] **Create the brand profiles** (You, effort M, med impact, Authority) `p1-profiles`
  LinkedIn page, Instagram, YouTube, Pinterest, Facebook page and Crunchbase, all with the same name, logo and website. Send me the links for the schema `sameAs` field.
- [ ] **Record four short measuring videos** (You, effort M, med impact, Content) `p1-videos`
  Blouse, kurta, trousers, lehenga. Post on YouTube Shorts and Instagram, and I embed them on the matching guides. Video results appear for 'how to measure' searches.
- [ ] **First 15 outreach messages** (You + Claude, effort M, high impact, Authority) `p1-outreach`
  5 wedding bloggers or planners, 5 Delhi shopping or food creators who do market tours, 5 fashion-college communities. I draft each one around a concrete asset (the measurement tool, the fabric market guide). You send them.
- [ ] **List doorstep tailoring brands and publish the home-visit page** (You + Claude, effort M, med impact, Data) `p1-homevisit`
  Contact about 6 (for example Silailor, Apnaa Darzi, Tailor Boutiques, MS Creation, Doorstep Stitch, Darzi On Call). List only with consent. Then publish `/delhi/tailors/home-visit`. Only 1 of 36 tailors offers home visits today.
- [ ] **After 2 to 3 weeks, check which pages Google indexed** (You, effort S, high impact, Measurement) `p1-gsc-review`
  Search Console, Pages. Send me the 'Why pages aren't indexed' list. It tells us which templates Google judges thin.

### Content and discovery upgrades (From the 8 Oct content review)

Make the site answer a wedding shopper's real questions, with evidence a visitor can trust. The full review is in docs/content-plan.md.

- [ ] **Correct the over-promising copy and price labels** (Claude, effort S, high impact, Pages) `cr-copy`
  The home page said listings had published rates and photos of actual work, and other pages said prices came from rate cards, when none have yet. Cards now say 'Indicative from' unless the shop's own rate card is behind the price. Ready in the working copy, waiting to be deployed.
- [ ] **Make search understand how shoppers type** (Claude, effort S, high impact, Pages) `cr-search`
  'bridal lehenga chandni chowk' used to return no shops. Search now matches word by word, understands spellings and Hinglish (lehnga, ghagra, darzi, cp), reads 'under 5000' as a budget, and says so when it has to loosen a search. Ready in the working copy, waiting to be deployed.
- [ ] **Call and tag your shops: one 6-minute script** (You, effort M, high impact, Data) `cr-calls`
  About 5 hours for the 45 phones in data/worklist.md. Confirm the address, get the rate list on WhatsApp, ask for a small offer for Groovyn visitors in the shop's own words, tick which garments, fabrics and occasions they really take, their last wedding-order date, lead time, number of trials, and for rentals the deposit and days. This unlocks most of the rest of this phase.
- [ ] **Add a controlled tag list and show tags with their evidence** (Claude, effort M, high impact, Data) `cr-tags`
  Garment, fabric, craft, occasion, role and mode tags, each marked as listed, stated by the shop (dated), seen by us, or confirmed by customers. Delhi tailors currently carry 48 free-text speciality values and 27 are used once. Needs the calls first.
- [ ] **Wedding shopping pillar plus bride and groom guides, by 9 Nov** (You + Claude, effort L, high impact, Content) `cr-pillar`
  Needs two market walks (Chandni Chowk and Lajpat Nagar), nine dated bridal quotes and your photos. These are the pages that can rank for a new wedding shopper. See the calendar below.
- [ ] **Rental and boutique pages first, then sherwani on rent** (You + Claude, effort M, med impact, Content) `cr-rental`
  Eight rental calls for days, deposit, trial and cleaning. No boutique currently sits in Lajpat Nagar, Karol Bagh, Rajouri Garden or South Ex, where wedding shoppers search, so those areas need listings before pages.
- [ ] **Re-gate service pages on tag evidence and add about 10 offerings** (Claude, effort M, med impact, Pages) `cr-services`
  Three service pages are indexable only because of estimated price lines. Index a page only when 5 or more shops carry the tag and 3 were stated by the shop within a year. New offerings: cotton, georgette and chiffon, brocade and zari, velvet, bandhgala, bridal blouse.
- [ ] **Swap the Diwali and timeline 'planning allowances' for shop-quoted lead times** (You + Claude, effort S, med impact, Content) `cr-leadtimes`
  Ask 10 tailors for their real festival-week and wedding-season lead times and update both guides with dated figures.
- [ ] **Google sign-in and verified-visit reviews** (You + Claude, effort L, high impact, Data) `cr-accounts`
  Needs your three decisions (who can review, what the coupon is, the Google login key). Reviews tied to a confirmed visit get a Verified badge; no rating markup until a shop has 5 genuine reviews; visit offers come from the shop and are not tied to the rating given.
- [ ] **Home page: Bride, Groom, Family, Guest chooser and 'browse by what you need' chips** (Claude, effort S, med impact, Pages) `cr-home`
  Lets a wedding shopper start from who they are and what they need, and routes to the right guide or filtered list.
- [ ] **Phone layout: no sideways scroll, booking up front, a Book a free visit bar** (Claude, effort S, high impact, Pages) `cr-phone`
  Category pages used to scroll sideways on phones, the booking form was the last thing on a long shop page, and the home hero chip was cut off at the screen edge. All fixed, and every page checked at 375 and 320 px wide. Ready in the working copy, waiting to be deployed.
- [ ] **Typical Delhi prices on every shop page, plus prices read off shops' own websites** (Claude, effort M, high impact, Data) `cr-prices-fallback`
  A shop with no price list now shows typical Delhi ranges for shops of its kind, labelled as ours. Eight shops that publish prices on their own websites get those ranges instead, marked as the shop's own with the date we checked (npm run collect:web-prices, then npm run import:web-prices). Ready in the working copy, waiting to be deployed.
- [ ] **Win real 'book through Groovyn' offers from shops** (You + Claude, effort M, high impact, Data) `cr-offers`
  The site has a Book through Groovyn section and a gold Visit offer badge, but the badge appears only when a shop has agreed to an offer. Ask on the same call (see data/worklist.md), and I set it with npm run offer. Never advertise a discount no shop has agreed to.
- [ ] **Boutique products: a showcase that links to the boutique's own shop** (You + Claude, effort L, med impact, Pages) `cr-boutique-products`
  Awaiting your choice. The proposal is to show a few pieces from boutiques that already sell online, with photo, price and a 'Buy on their website' button, and only with each boutique's written OK. Selling and taking payment on Groovyn itself needs a registered business, GST, payment-gateway KYC, a returns policy and a change to the Terms, so it comes later, if the showcase gets clicks.

### Weeks 6 to 9 (10 Nov to 7 Dec)

Add depth: local guides, tools, the first price index, and the first links.

- [ ] **Size charts and a converter** (Claude, effort M, high impact, Content) `p2-size-charts`
  Women's and men's charts in cm and inches, India, US, UK and EU, from published sources that I link. The tailor angle: sizes are for readymade clothes, and for stitching you measure.
- [ ] **Three more measuring guides** (Claude, effort S, med impact, Content) `p2-measure-posts`
  Kurta pyjama and salwar suit, sherwani and bandhgala, trousers and shirt. Use your photos and videos.
- [ ] **Four first-hand market guides** (You + Claude, effort L, high impact, Content) `p2-market-guides`
  Chandni Chowk lanes (Katra Neel, Kinari Bazaar, Nai Sarak), Lajpat Nagar, Karol Bagh against Sarojini Nagar, Shahpur Jat. You walk each market: photos, 5 shops, lane names, price ranges. I write and fact-check with you. This is the biggest trust gain, because competitors write these from a desk.
- [ ] **Sherwani on rent guide, and richer rental listings** (Claude, effort S, med impact, Content) `p2-sherwani-rent`
  Prices, deposits, return rules and fitting time, taken from the 8 rental listings plus a call to each.
- [ ] **A 'tailors near me' page** (Claude, effort M, med impact, Pages) `p2-near-me`
  Sorts by the nearest shop using the phone's location, with an indexable introduction. Aimed at mobile 'near me' searches. The map pack will stay hard, so this is a bonus rather than a bet.
- [ ] **Tag shops to services so service pages can be indexed** (Claude, effort M, med impact, Pages) `p2-service-pages`
  Aim for the 12 most-searched services to each have 3 or more shops (blouse, suit, kurta, salwar, lehenga, sherwani, shirt, trouser, alteration, saree fall and pico, bridal blouse, blazer). Today only 3 of 26 have enough.
- [ ] **Publish the first Delhi stitching price index** (You + Claude, effort M, high impact, Authority) `p2-price-index`
  From 20 or more verified rate cards, with the method, sample size and date shown. This is the main PR asset and the most citable page on the site.
- [ ] **Ten pitches for the price index and tools** (You + Claude, effort M, high impact, Authority) `p2-pr`
  HT City, Times of India Delhi, Delhi blogs, and startup press (YourStory, Inc42) for the founder angle. One concrete number per pitch.
- [ ] **Ask shops that send a rate card to add the badge** (You, effort S, med impact, Authority) `p2-badge`
  On their website or Instagram bio. Target: 10 links from shop sites.
- [ ] **Pilot first-party reviews** (You + Claude, effort M, med impact, Data) `p2-reviews`
  After a booked visit, a WhatsApp request. Only real reviews, shown in full on the shop page. Consider review markup once a shop has 5 or more genuine ones.
- [ ] **Grow listings from about 110 to 150** (You + Claude, effort M, high impact, Data) `p2-growth-2`
  Next localities: Karol Bagh, South Extension, Sarojini Nagar, Rajouri Garden, Janakpuri, Dwarka. Same quality gate.
- [ ] **Rewrite titles for pages with views but few clicks** (Claude, effort S, med impact, Measurement) `p2-ctr`
  Using 3 to 4 weeks of Search Console data: pages with many impressions, CTR under 2% and position better than 15. Change one thing at a time and wait 4 weeks.

### Weeks 10 to 13 (8 Dec to 4 Jan)

Widen carefully, review against the markers, and set up the next quarter.

- [ ] **Build Gurugram and Noida before promoting them** (You + Claude, effort L, med impact, Data) `p3-ncr`
  Get each to 10 or more shops per category. Under 3 shops their pages stay noindex.
- [ ] **Add Hindi and Hinglish terms to the top pages** (Claude, effort M, med impact, Content) `p3-hinglish`
  People search 'darzi near me', 'ladies tailor', 'silai' and 'boutique near me'. Work those words into headings and FAQs on the 10 best pages. Judge Hindi versions of the top 5 guides afterwards.
- [ ] **Four decision guides** (Claude, effort M, med impact, Content) `p3-guides-2`
  A one-day wedding shopping route, tailor against boutique against readymade, a fabric guide with Delhi prices, and a guest-outfit guide.
- [ ] **Second outreach wave** (You + Claude, effort M, high impact, Authority) `p3-links-2`
  30 messages, reusing what got replies. Add podcast and YouTube collaborations.
- [ ] **Connect Ahrefs or sign up for Ahrefs Webmaster Tools** (You, effort S, med impact, Authority) `p3-ahrefs`
  Free for your own site. Lets me see backlinks and compare against chotu.com, silailor.in and needlesnthimbles.com to find sites that link to them but not to you.
- [ ] **Review Core Web Vitals from real users** (Claude, effort S, low impact, Pages) `p3-cwv`
  Search Console, Core Web Vitals, once there is enough data. Fix the worst templates first.
- [ ] **Run the 20-prompt AI visibility check** (You + Claude, effort S, med impact, Measurement) `p3-ai`
  See Appendix D. Record whether Groovyn is mentioned or cited in ChatGPT, Perplexity, Gemini and Google's AI answers, then fix gaps.
- [ ] **90-day review** (You + Claude, effort S, high impact, Measurement) `p3-review`
  Compare with the 'on track' markers, refresh the 10 oldest pages, and write the next quarter's plan.

### Every week and month (Ongoing)

The habits that keep the work compounding.

- [ ] **Monday, 20 minutes: Search Console** (You, effort S, high impact, Measurement) `o-gsc`
  Clicks, impressions, top queries, top pages, indexing errors. Send me anything odd.
- [ ] **Publish 1 to 2 guides or tools a week** (Claude, effort M, high impact, Content) `o-publish`
  Follow the calendar. Every piece goes through the quality gate and carries first-hand facts, a named author and an updated date.
- [ ] **Five outreach messages a week** (You + Claude, effort S, high impact, Authority) `o-links`
  Plus replying to anyone who mentions or links to you.
- [ ] **Two 15-minute community sessions a week** (You, effort S, low impact, Authority) `o-community`
  Helpful answers on Quora, Reddit (r/delhi and fashion subs, follow each sub's rules, disclose who you are) and Facebook groups. Mostly nofollow links, so the value is traffic and brand, not ranking.
- [ ] **Onboard shops continuously** (You + Claude, effort M, high impact, Data) `o-shops`
  Photos, rate cards, hours and visit offers. Each one makes a page more useful and more likely to be linked.
- [ ] **Monthly: refresh, audit, snapshot** (Claude, effort S, med impact, Measurement) `o-monthly`
  Re-run the Places refresh, the crawl audit and Lighthouse, take a ranking snapshot of the tracked queries, and update dates on changed pages.

## Keyword map

One page per keyword. No volume data: check in Search Console and Google Keyword Planner.

| Search | Target page | Intent | Odds | Status |
|---|---|---|---|---|
| best tailors in Delhi, top tailors in Delhi | /delhi/tailors | Compare | Hard now, medium with links and data | Built |
| tailors in {Connaught Place, Lajpat Nagar, Chandni Chowk...} | Locality pages | Local | Medium to good | 7 indexable, growing with listings |
| boutiques in Delhi, boutiques in Shahpur Jat | /delhi/boutiques and locality pages | Compare | Medium | Built |
| fabric shops in Delhi, cloth market Delhi | /delhi/fabric-shops, market guides | Compare | Good | Built |
| lehenga on rent Delhi, sherwani on rent Delhi | /delhi/rental-shops, guides | Compare | Medium | Lehenga built, sherwani new |
| ladies tailor, gents tailor, darzi near me | Category pages plus Hinglish terms | Local | Hard | Partial |
| tailor near me Delhi | /near-me (new) | Local | Hard | New |
| doorstep tailor Delhi, tailor at home | /delhi/tailors/home-visit (new), guide | Compare | Medium | New, needs partners |
| tailoring charges Delhi, stitching price list | /blog/tailoring-charges-in-delhi | Price | Medium | Built, improve with rate cards |
| blouse stitching charges Delhi | New guide | Price | Medium | New |
| suit stitching charges Delhi | New guide | Price | Medium | New |
| sherwani stitching cost Delhi | /blog/sherwani-stitching-cost-in-delhi | Price | Medium | Built |
| alteration charges Delhi | New guide | Price | Good | New |
| saree fall pico charges Delhi | New guide | Price | Medium | New |
| lehenga stitching cost Delhi | New guide | Price | Medium | New |
| how to take body measurements at home | /blog/how-to-take-body-measurements-at-home | How-to | Hard head, medium long-tail | Built |
| blouse measurements at home | /blog/how-to-measure-for-a-blouse-at-home | How-to | Medium | Built |
| how to measure for a kurta, sherwani, salwar | New guides | How-to | Good | New |
| women's size chart India cm, blouse size chart | Size chart tool and page | How-to | Hard, tailor angle helps | New |
| online body measurement, measure body with phone | /measurements, /blog/online-body-measurement-how-accurate | How-to | Medium | Built |
| how much fabric for lehenga, kurta, blouse | Fabric calculator | Tool | Medium | New |
| best fabric market in Delhi, Chandni Chowk fabric | /blog/best-fabric-markets-in-delhi, market guides | Guide | Good | Built, deepen |
| when to order wedding outfits | /blog/when-to-order-wedding-outfits-delhi-timeline | Guide | Good | Built, update for this season |
| custom vs readymade vs semi-stitched lehenga | /blog/readymade-semi-stitched-or-custom-lehenga | Guide | Good | Built |
| wedding shopping in Delhi | New route guide | Guide | Hard | New |
| Diwali stitching Delhi, express tailor Delhi | New seasonal guide | Guide | Good, time-sensitive | New, publish this week |
| groovyn | Home | Brand | Good once indexed | Live |

## Content calendar and rules

| Week | Dates | Publish |
|---|---|---|
| Wk 1 | 6 to 12 Oct | Diwali stitching guide. Wedding timeline update for this season. How we rank (method page). |
| Wk 2 | 13 to 19 Oct | Blouse stitching charges. Fabric calculator. |
| Wk 3 | 20 to 26 Oct | Alteration charges. Saree fall and pico charges. |
| Wk 4 | 27 Oct to 2 Nov | Suit stitching charges. Doorstep tailors guide (if partners agree). |
| Wk 5 | 3 to 9 Nov | Size chart tool and women's size chart. Diwali social posts. |
| Wk 6 | 10 to 16 Nov | Men's size chart. Kurta pyjama and salwar measuring guide. |
| Wk 7 | 17 to 23 Nov | Chandni Chowk lanes guide (first-hand). Wedding season starts 21 Nov. |
| Wk 8 | 24 to 30 Nov | Lajpat Nagar guide. Sherwani on rent. |
| Wk 9 | 1 to 7 Dec | Karol Bagh against Sarojini Nagar. Fabric guide with Delhi prices. |
| Wk 10 | 8 to 14 Dec | Shahpur Jat boutiques guide. Lehenga stitching cost. |
| Wk 11 | 15 to 21 Dec | South Extension wedding shopping guide. Tailor vs boutique vs readymade. |
| Wk 12 | 22 to 28 Dec | Delhi stitching price index 2026 with PR push. Year-end best-of refresh. |

### Wedding-shopper pieces, from the content review

| Date | Piece | Search | Needs |
|---|---|---|---|
| 23 Oct | Indian wedding shopping checklist: bride, groom, family | indian bridal shopping checklist | Nothing extra |
| 2 Nov | Wedding shopping in Delhi: fabric, tailor, rent | wedding shopping delhi | Market walks, tailor calls |
| 5 Nov | How Groovyn reviews work (trust page) | none | Your review decisions |
| 9 Nov | Bridal lehenga price in Delhi: Chandni Chowk, Lajpat Nagar, Shahpur Jat | bridal lehenga price in delhi | 9 dated quotes, photos |
| 9 Nov | Groom wear in Delhi: sherwani, bandhgala, suit or rent | sherwani for groom delhi | Rental and tailor calls |
| 16 Nov | Sherwani on rent in Delhi: prices, deposits, trial | sherwani on rent delhi | Rental calls |
| 16 Nov | Best fabric for a bridal lehenga: silk, velvet, net or brocade | fabric for bridal lehenga | Fabric shop prices |
| 23 Nov | Chandni Chowk for weddings, lane by lane | chandni chowk wedding shopping | Market walk |
| 23 Nov | Bridal blouse stitching in Delhi: cost, lead time, what to ask | bridal blouse stitching delhi | Tailor calls |
| 30 Nov | Lajpat Nagar for weddings: stitch, rent, fabric in one trip | lajpat nagar wedding shopping | Market walk |
| 30 Nov | Lehenga stitching cost in Delhi with your own fabric | lehenga stitching cost in delhi | Tailor calls |
| 7 Dec | Guest and bridesmaid outfits: rent, 7-day stitch or buy | bridesmaid lehenga delhi | Rental and tailor calls |
| 7 Dec | Bandhgala, jodhpuri, achkan or sherwani, and which tailors | sherwani vs bandhgala | Tailor calls |
| 14 Dec | Check silk, georgette and velvet before you buy | how to identify pure silk | Fabric shop visit |
| 14 Dec | Fabric for a sherwani or bandhgala, and how much | best fabric for sherwani | Fabric shop prices |
| 21 Dec | Roka to reception: rent, stitch or buy by function | sangeet outfit | Tailor calls |
| 4 Jan | Reception and cocktail: gown, indo-western or tuxedo | gown on rent delhi | Rental and tailor calls |
| 11 Jan | Mother of the bride and groom: outfits, fabrics, fittings | mother of the bride outfit indian | Tailor calls |
| 18 Jan | Suit and shirt fabric by season in Delhi | suit fabric delhi | Fabric shop prices |
| 25 Jan | Shankar Market, Connaught Place: a tailor lane guide | shankar market tailors | Market walk, tailor calls |
| 1 Feb | Summer wedding fabrics for April and May dates | fabric for summer wedding lehenga | Fabric shop prices |
| Feb | Tailor, boutique, readymade or rent: five questions | none | Nothing extra |
| 8 Feb | Eid outfits in Delhi: order-by dates (only if 3 or more Old Delhi tailors confirm) | none | Tailor calls |
| Mar | What Delhi customers actually paid (first verified-visit survey) | none | 30 or more verified reviews |
| Mar | Shops customers rated best for bridal blouses, sherwanis and rentals | none | 30 or more verified reviews |

### Rules for every piece

- A named author, plus 'checked by' a working tailor or shop owner for guides that give prices or measurements.
- At least one thing only you could know: your photo, a price you were quoted, a lane you walked. Date it.
- Answer first: a two-sentence summary at the top that an AI answer can quote.
- Sources linked for any figure that is not yours. Estimates labelled as estimates.
- A visible 'last updated' date, and a refresh on the calendar.
- The existing quality gate (`npm run verify:blog`) must pass: length, titles, links, no thin or duplicate text.
- Never publish a page whose only content is a template filled with a keyword and a place.

## Links and authority

Links are the main bottleneck for competitive terms, and the main thing on-page work cannot fix. Earn them with things people want to cite. Never buy links, join link exchanges or mass-submit to directories.

| Source | How |
|---|---|
| Shop badge | Shops that send us a rate card can show 'Listed on Groovyn' and link back. Target 10 to 20 links in 60 days. |
| Data you own | The Delhi stitching price index, a fabric market map, the size charts. Pitch them with one concrete number. |
| The measurement tool | A free, private tool is a story for fashion students, bloggers and startup press. Be plain about its accuracy. |
| Creators and planners | Delhi market-tour creators, wedding planners and bloggers. Offer a real asset, not a request for a favour. |
| Fashion colleges | NIFT, Pearl Academy and tailoring institutes often have resource pages for students. |
| Local and startup press | HT City, Times of India Delhi, YourStory and Inc42. The price index is the hook. |
| Communities | Quora, Reddit and Facebook groups. Mostly nofollow, so the gain is brand and referral traffic. |
| Gap analysis | With Ahrefs: sites that link to chotu.com, silailor.in or needlesnthimbles.com but not to you. |

## Measuring it

| What | Track |
|---|---|
| Inputs (weekly) | Guides and tools published, shops that sent a rate list or photos, photos added, rate cards collected, outreach sent, links earned. |
| Visibility | Indexed pages, impressions, clicks, CTR and average position for the tracked queries, split branded and non-branded. |
| Quality | Core Web Vitals pass rate, pages Google calls 'crawled, not indexed', broken links. |
| Outcomes | Bookings, calls, directions taps, scans completed, by landing page. |

### What 'on track' looks like

| When | Markers |
|---|---|
| Day 30 | 90% or more of sitemap pages indexed. Analytics live. 8 new pages published. 10 shops with a rate list or photos. Impressions appearing for long-tail queries. |
| Day 60 | At least 20 queries with impressions in positions 1 to 30. 20 rate cards collected. 25 shops with a rate list or photos. First 3 links earned. |
| Day 90 | At least 10 queries in the top 10. About 150 listings with 40 or more photographed. First price index published. About 10 referring domains. |

These are markers to check yourself against, not forecasts. A new site with no authority can take longer, and I will say so when the data shows it.

Events: `booking_started`, `booking_submitted`, `scan_started`, `scan_completed`, `call_tap`, `directions_tap`, `shop_website_tap`, `whatsapp_tap`

| When | What |
|---|---|
| Weekly (20 min) | Search Console: clicks, queries, pages, indexing. Pick the week's publishing and outreach. |
| Monthly | Rank snapshot of the tracked queries, crawl audit, Lighthouse, link report, AI-visibility prompts, content refresh queue. |
| Quarterly | Re-cut this plan against real data. Retire what did not work. |

### AI search visibility

- Keep AI crawlers allowed (they are) and keep `llms.txt` current.
- Open each page with a short, quotable answer, and keep facts consistent across pages.
- Own data that models like to cite: the price index, the ranking method, the size charts.
- Be present where assistants look: Reddit, Quora, YouTube, press mentions.
- Check monthly with the 20 prompts in Appendix D and record mentions and citations.

## Risks and rules

| Risk | What we do |
|---|---|
| Thin or mass-produced pages | Google's spam policy targets scaled, low-value pages. Keep the 3-shop threshold, never fill pages with template text, and noindex what is not ready. |
| Google Places data rules | Google limits how long Places content may be kept and requires attribution. Refresh monthly, never store review text, and never put Google ratings into structured data. |
| Ratings markup | `aggregateRating` only from first-party reviews we collect and show in full. |
| Privacy | You collect phone numbers and body measurements. Publish a clear notice, collect only what you need, and keep the scan on-device as it is now. Have the policy reviewed against India's data-protection law. |
| Accuracy claims | The scan is untested against a tape on real people. Keep saying 'estimate', and run the 10-person test before making any accuracy promise. |
| 'Best' claims | Publish the method (rating adjusted for review count, no paid placement) and correct errors fast. Add a 'report a problem' link on every listing. |
| Scraping | Do not copy listings or prices from Justdial, IndiaMART or competitors. Collect from the shops themselves. |
| Seasonality | Wedding and festival demand spikes. Publish before the spike, not during it. |

## What I need from you

- Registered business name, address, contact email and phone, a grievance-officer name, and your social profile links (for the trust pages).
- A decision on www against groovyn.com.
- Whether you want GA4 as well as Vercel Analytics, and the GA4 measurement ID if so.
- The new Google API key, added to Vercel and your local .env (never pasted in chat).
- Shop photos and rate cards as you collect them.
- Three to five tailors who really take express orders, with their last-order dates.
- Permission before each push to the live site, as before.

## Appendix

### A. Title templates

| Page | Pattern | Notes |
|---|---|---|
| Home | Best Tailors & Custom Clothing Shops in Delhi NCR | Live |
| Category | Best {Category} in {City} ({Year}): {N} Shops Compared | Live. Count only when 2 or more |
| Locality | {Category} in {Locality}, {City}: {N} Shops | Live |
| Shop | {Name}, {Category}, {Locality} | Live. Keep under 62 characters with the brand |
| Guide | {Topic}: {specific value} | Under 52 characters before the brand |
| Price page | {Service} Price in {City} ({Year}): {low} to {high} | Only with real rate-card data |

Use the year only on lists you will refresh each year. Description under 158 characters, written for the person searching, never promising photos or prices the page lacks. Test one change at a time and wait 4 weeks.

### B. WhatsApp message to shops

> Hi {Name}, this is {You} from Groovyn (groovyn.com), a free directory that helps people in Delhi NCR find good tailors and boutiques. {Shop} is already listed here: {link}. If you send me your rate list and three photos of your work on WhatsApp, I will add them to your page for free. You can also give me the exact words for any small offer you would like to make to people who book a visit through Groovyn. We never charge to be listed or to rank higher. Want to send them?

Keep it plain, never promise leads, and stop if they say no.

### C. Redirects

| From | To | Type |
|---|---|---|
| /hi-in, /de-de, /es-es, /fr-fr, /nl-nl, /zh-cn | / | 301 |
| groovyn-web.vercel.app/* | www.groovyn.com/* | Host redirect |
| groovyn.com/* (if www stays primary) | www.groovyn.com/* | Already in place (308) |

### D. Twenty AI visibility prompts

1. best tailors in Delhi
2. best tailor in Connaught Place for a suit
3. where to get a blouse stitched in Delhi
4. how much does blouse stitching cost in Delhi
5. best fabric market in Delhi for suits
6. where to rent a bridal lehenga in Delhi
7. how to measure for a blouse at home
8. how accurate are body measurement apps
9. Chandni Chowk or Lajpat Nagar for a lehenga
10. doorstep tailor in Delhi NCR
11. custom sherwani in Delhi price
12. how early should I order wedding outfits in Delhi
13. best boutiques in Shahpur Jat
14. tailors in Gurgaon for ladies suits
15. alteration charges in Delhi
16. saree fall and pico charges
17. how to choose a tailor
18. semi-stitched or custom lehenga
19. Delhi stitching price list 2026
20. what is Groovyn

### E. Plain-English glossary

- **Indexed:** Google has read the page and can show it in results.
- **noindex:** A tag that tells Google not to list a page. We use it on pages with too little to say.
- **Canonical:** The one official address of a page, so Google does not treat copies as separate pages.
- **Schema (structured data):** Hidden code that describes a page to Google: a shop's address, hours, a guide's author.
- **LCP:** How long the biggest thing on the screen takes to appear. Under 2.5 seconds is good.
- **CTR:** The share of people who see your result and click it.
- **Impressions:** How many times your page appeared in search results.
- **nofollow:** A link that passes no ranking credit. Useful for traffic, not for ranking.
- **Backlink:** A link to your site from another site. The main way Google judges trust.
- **Rate card:** A shop's own price list for its services.

### Sources

- Search results reviewed on 6 Oct 2026 for tailors, rentals, price lists, doorstep tailoring and markets
- Diwali, Dhanteras and Karwa Chauth 2026 dates: https://samvat.in/festivals/diwali-2026/
- Wedding muhurat dates for Nov and Dec 2026: https://www.theweddingfocus.com/blog/wedding-dates-2026/
- Justdial: tailors in Delhi: https://www.justdial.com/Delhi/Tailor-Shops/nct-10470248
- Previous keyword research in this repo: docs/seo-keyword-plan.md
