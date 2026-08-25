# Store research data

Research output lands here as JSON, then `npm run import:stores` loads it.

## The rules this pipeline enforces in code

1. **Every record needs at least one `sources` URL.** The importer rejects
   unsourced records. An LLM researcher will produce plausible-sounding shops
   that do not exist; a source URL is the only cheap defence.
2. **No images are imported.** Photos belong to whoever shot them. Galleries
   must be first-party photography, added separately.
3. **No ratings or review text are imported.** Google licenses review content
   under terms that forbid republishing it, and fabricated `aggregateRating`
   markup is a manual-action risk. `ratingAvg` stays null until real reviews
   exist in our own `Review` table.
4. **Everything imports as `verified: false`.** Verification means a human
   confirmed it — usually a phone call. The badge means nothing otherwise.
5. **Rate cards import as `source: "estimate"`** unless explicitly marked as
   supplied by the shop. Shop-quoted prices and our guesses must never look
   alike to a user.

## Sourcing

Legitimate:
- Google Places API (licensed) for name, address, phone, hours, geo
- The shop's own website or Instagram
- Editorial listicles, press, blogs — cite the URL

Not legitimate:
- Scraping Justdial or Google Maps HTML (breaches their ToS)
- Copying photos from anywhere
- Copying review text

## Record shape

```jsonc
{
  "name": "Example Tailors",
  "category": "tailors",              // tailors | boutiques | fabric-shops | rental-shops
  "city": "delhi",                    // slug; created if missing
  "cityName": "Delhi",                // used only when creating the city
  "state": "Delhi",
  "locality": "lajpat-nagar",         // slug, optional
  "localityName": "Lajpat Nagar",
  "address": "Shop 46, Central Market, Lajpat Nagar II, New Delhi",
  "pincode": "110024",
  "lat": 28.5677,
  "lng": 77.2433,
  "phone": "+91 11 2345 6789",
  "website": "https://example.com",
  "instagram": "https://instagram.com/example",
  "about": "Two sentences in our own words. Never copied from the source.",
  "specialities": ["Bridal", "Blouses"],
  "materials": ["Silk", "Georgette"],
  "openingHours": { "mon": "11:00-20:00", "sun": "closed" },
  "priceMin": 500,
  "priceMax": 4500,
  "turnaroundDays": 7,
  "homeVisit": false,
  "establishedYear": 1996,
  "priceItems": [
    { "label": "Blouse stitching", "priceMin": 550, "priceMax": 800,
      "unit": "per piece", "serviceSlug": "blouse-stitching",
      "source": "estimate" }
  ],
  "sources": ["https://..."],         // REQUIRED, at least one
  "confidence": "medium",             // high | medium | low
  "notes": "Hours unconfirmed; phone not found."
}
```

Top-level file is either an array of these, or `{ "stores": [...] }`.
