# Store photos from Google Places

Off by default. Turn on with:

```bash
npm run enrich -- --photos
```

## Why it is a flag and not the default

**Billing.** Adding `places.photos` to the field mask moves every Text Search
request into a costlier SKU, and each photo *view* is a separate billable
request to the media endpoint. A listing page showing 24 shops is 24 photo
fetches, every time it is rendered uncached.

**Licensing.** Google Maps Platform terms do not permit downloading a Places
photo and re-hosting it. The image must be fetched from Google's media endpoint
and displayed with the photographer's attribution. So:

- the database stores a **reference** (`gplaces:places/<id>/photos/<id>`) in
  `StoreImage.url`, never the bytes;
- `StoreImage.credit` holds the attribution and the UI always renders it;
- `/api/places/photo` resolves the reference at view time, keeping the API key
  server-side;
- Next's image optimiser is bypassed (`unoptimized`) for these so no optimised
  copy is written to our disk;
- the proxy sets a short shared cache only (`s-maxage=3600`).

**References expire.** A 404 from the proxy means that shop needs re-enriching.
Re-running is idempotent: it deletes only rows whose url starts with
`gplaces:` and leaves first-party photography alone.

## What it will not do

It never overwrites a cover we own. `syncPhotos` only sets `Store.coverImage`
when the existing value is empty or is itself a Google reference — a photo the
shop gave us always wins.

## The better path

Owner-uploaded photos beat this on every axis: no per-view cost, no attribution
constraint, no expiry, and they show the actual current shopfront. The claim
flow is the place to ask for them. Treat Places photos as scaffolding that
makes empty listings presentable until owners claim.
