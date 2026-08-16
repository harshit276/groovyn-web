# Groovyn — custom clothing directory

A discovery platform for custom clothing in Delhi NCR: tailors, boutiques,
fabric shops and rental stores, each with a published rate card and real work
photos.

The wedge is the **rate card**. Nobody in India publishes what a tailor charges,
and price opacity is the biggest source of anxiety in this category. Everything
else in the product exists to support that.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | SSG/ISR — a directory only works if 10k pages are individually indexable |
| Styling | Tailwind v4 + CSS-first tokens | Theme lives in `globals.css` under `@theme` |
| Type | Fraunces (display) + Inter (UI) | The serif carries the brand |
| DB | Prisma 7 + SQLite (dev) | Zero-setup local dev; schema is Postgres-portable |
| Validation | Zod | Shared between API routes and forms |

## Running locally

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Useful scripts:

```bash
npm run db:reset    # wipe + re-seed
npm run db:studio   # browse the data
npm run build       # prisma generate + next build
npm run lint
```

## Admin panel & lead notifications

Leads are worthless if nobody sees them. Two things cover that:

**Telegram** — every booking, claim and suggestion fires a message the moment it
lands. Sent via `after()` so the customer's request never waits on Telegram, and
a failed send can never fail a saved lead.

```bash
# 1. Message @BotFather → /newbot → copy the token
# 2. Send your new bot any message, then open:
#    https://api.telegram.org/bot<TOKEN>/getUpdates
#    copy result[0].message.chat.id
TELEGRAM_BOT_TOKEN="123456:ABC..."
TELEGRAM_CHAT_ID="987654321"
```

Leave them blank and notifications no-op silently (dev logs the message it would
have sent). The admin panel shows a warning banner while they're unset.

**Admin panel** at `/admin` — overview, leads, claims, suggestions. Each row has
click-to-call and click-to-WhatsApp, plus a status dropdown
(pending → confirmed → visited / no-show). Approving a claim flips the listing to
owner-managed.

```bash
ADMIN_PASSWORD="something-long"
ADMIN_SESSION_SECRET="$(openssl rand -hex 32)"
```

Auth is one password + an HMAC-signed httpOnly cookie, 12-hour expiry, constant-
time comparison. That's right-sized for one operator. **The moment a second
person needs their own login — or shop owners get dashboards — replace it with
real auth (Clerk/Auth.js) rather than extending it.** `/admin` is `noindex` and
disallowed in robots.txt.

## Architecture

```
src/
  app/
    [city]/                          /delhi
      [category]/                    /delhi/tailors            ← money page
        [store]/                     /delhi/tailors/sharma-…   ← "virtual store"
        in/[locality]/               /delhi/tailors/in/lajpat-nagar  ← long tail
      prices/[service]/              /delhi/prices/suit-stitching    ← price index
    services/[service]/              national service hub
    search/                          noindex by design
    claim/  suggest/                 owner + crowdsource intake
    api/v1/                          JSON contract for the future mobile app
    sitemap.ts  robots.ts  opengraph-image.tsx
  lib/
    queries.ts    every listing surface goes through listStores()
    types.ts      public DTOs — the mobile app's contract
    schema.ts     JSON-LD builders
    site.ts       categories, brand constants
```

### Why `/api/v1` exists

The web pages could call `lib/queries` directly (and do). The API layer is there
so a React Native app can consume exactly the same DTOs without depending on how
the web pages happen to render. Treat `lib/types.ts` as a published contract:
add fields, never repurpose them. Version the path when something breaks.

## Rules that are load-bearing

These aren't style preferences — breaking them damages the product.

1. **Never fabricate `aggregateRating`.** No review schema until real reviews
   exist. Fake review markup is the fastest way for a directory to earn a
   Google manual action. `storeSchema()` omits it deliberately.
2. **Shop-supplied prices and our estimates must never look alike.** `PriceItem.source`
   is `shop` / `menu` / `estimate`; the UI labels estimates explicitly and
   `storeSchema()` excludes them from structured data. Trust is the product.
3. **`/search` stays `noindex`.** Filter permutations are near-infinite and will
   eat the crawl budget.
4. **Unknown URLs must 404.** The old SPA returned HTTP 200 with the homepage
   for every bad URL — a soft 404 that Google holds against the whole site. The
   store route also 404s if a listing is reached under the wrong city/category,
   so one shop can't have duplicate URLs.
5. **Visit bookings are free and non-transactional.** Their purpose in v1 is a
   provable footfall record per shop. That dataset is what makes a monetisation
   conversation possible later; charging before it exists is the old failure
   pattern in new clothes.

## Deploying to Vercel

The existing Pro plan covers this — Pro is billed per seat with unlimited
projects. Add Groovyn as its own project, not a subpath of the existing site.

**Before the first deploy, move off SQLite.** Vercel's filesystem is ephemeral.

1. Provision Neon Postgres via the Vercel Marketplace.
2. `prisma/schema.prisma` → `provider = "postgresql"`.
3. Swap the adapter in `src/lib/db.ts` and `prisma/seed.ts`:
   `@prisma/adapter-better-sqlite3` → `@prisma/adapter-neon`.
4. In `src/lib/queries.ts`, add `mode: "insensitive"` to the `contains` filters
   in `listStores` — SQLite's LIKE is case-insensitive for ASCII, Postgres's
   is not.
5. Set `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` in project env vars.

Two things to watch:

- **Usage allowances pool across the team**, not per project. Image optimization
  is the line item a photo-heavy directory actually grows into — consider
  Cloudinary for galleries past a few hundred stores.
- **Cloudflare currently fronts groovyn.com** and serves its own managed
  `robots.txt` that blocks GPTBot, ClaudeBot, Google-Extended and others. That
  will override `app/robots.ts`. Turn the managed rule off or point DNS at
  Vercel, otherwise the AI-visibility work is silently undone.

## Data status

⚠️ **Every store in `prisma/seed.ts` is synthetic.** Names, phone numbers and
addresses are invented placeholders so the UI has something realistic to render.
They are not real businesses and must never be published.

The **prices** are researched Delhi NCR market benchmarks and are broadly
accurate — worth keeping as the `Service.benchmark*` fallbacks.

Replacing them:

- **Facts** (name, address, phone, hours, geo) — Google Places API. Licensed and
  ToS-clean. Facts aren't copyrightable; scraped listings and photos are a
  different matter.
- **Photos** — first-party only. Shoot them. A weekend across 100 shops beats
  any scrape and doubles as the vendor pitch: *"we already made you a page."*
- **Rate cards** — ask. A WhatsApp message takes four minutes and most shops
  already have a rate-card photo they'll forward. That request is also the
  lowest-friction vendor onboarding conversation available.

## Known gaps

- `/[city]/[category]` and the locality pages render on demand rather than
  statically, because reading `searchParams` for filters opts into dynamic
  rendering. SEO is unaffected (Google gets complete server-rendered HTML), but
  enabling Cache Components would give these a static shell with the filters
  streamed in.
- Gallery images reuse the four category photos as placeholders.
- Notifications reach **you**, not the shop. Forwarding the lead to the shop
  over WhatsApp is still manual — worth automating once volume justifies it.
- Rate limiting is per-instance and in-memory. Move it to Upstash/Vercel KV
  before opening the API to a mobile client.
- The admin panel still renders the public site header and footer, because the
  root layout wraps every route. Fix by moving public pages into a `(site)`
  route group with its own layout.
- No store editing in admin yet — use `npm run db:studio` to add or edit
  listings.
