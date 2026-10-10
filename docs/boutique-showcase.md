# Boutique showcase: "Pieces from this shop"

A boutique's page can show a few pieces from its own online shop: photo, name, price, and a **Buy on their website** button. Groovyn does not sell them and takes no payment. The button leaves for the boutique's site.

**Nothing is shown until the boutique says yes.** The photos are the boutique's, so the code will not read or show a shop's pieces until its permission is recorded.

## How a shop gets switched on

1. **Ask.** Send the message below on WhatsApp (or Instagram if there is no number). A "yes, go ahead" reply in writing is enough. Keep the chat.
2. **Record the feed** (the shop's own Shopify site):
   ```bash
   npm run products -- feed bhaavya-bhatnagar-shahpur-jat https://www.bhaavya.com
   ```
3. **Record the yes**, with who, how and when:
   ```bash
   npm run products -- approve bhaavya-bhatnagar-shahpur-jat "Owner, WhatsApp, 12 Oct 2026"
   ```
4. **Load the pieces** (8 at most, a mix of kinds, newest first). Check the list, then run it for real:
   ```bash
   npm run products -- refresh bhaavya-bhatnagar-shahpur-jat --dry
   npm run products -- refresh bhaavya-bhatnagar-shahpur-jat
   ```
5. The page updates within the hour. A boutique with pieces opens on its **Collection** tab.

Other commands: `npm run products -- status` lists every shop, whether it is shown, and how many people tapped Buy. `npm run products -- revoke <slug>` hides a shop at once and deletes what we hold. Run `refresh` now and then so prices stay current. The page always shows the date they were read.

## What the code does and does not do

- It reads only the shop's public product list (`/products.json`, which every Shopify store has). No login, no scraping of pages.
- It keeps a title, a price, the photo's address on the shop's own server, and a link. It does not copy the photo; the visitor's browser loads it from the shop.
- Each Buy button goes to `/go/<id>`, which adds one to a count and sends the visitor on. The count holds nothing about the visitor. Use it to tell a boutique how many people we sent.
- Prices are the lowest price on the shop's listing, in stock only. Out-of-stock pieces are skipped.
- Pieces never appear in structured data, and `/go/` is disallowed in robots.txt.

## Message to send

The full message, which also asks for a price list and an optional offer and explains what the shop gets, is in `docs/shop-outreach.md`, and the spreadsheet `data/shop-outreach.xlsx` has it ready for each shop. If you want to ask about the showcase on its own, this is the wording:

> Hi {Name}, this is a message from Groovyn (groovyn.com), a free directory of tailors, boutiques and fabric shops in Delhi NCR. {Shop} is already listed: {link}.
>
> We would like to show 6 to 8 pieces from your online shop on that page, with the photo, name and price, and a button that takes people to your website to buy. We take no commission and no payment goes through us. We read the pieces from your public product list, and you can ask us to remove them at any time.
>
> Is that OK with you? A "yes" here is all I need.

Keep it plain, never promise sales, and stop if they say no.

## Who to ask first

These shops already run a Shopify store with public prices (checked 9 Oct 2026):

| Shop | Phone | Site |
|---|---|---|
| Asiana Couture (boutique) | +919899407147 | asianacouture.com |
| Bhaavya Bhatnagar (boutique) | none listed; Instagram @bhaavya.bhatnagar | bhaavya.com |
| Chetna Bagga (boutique) | +918368924225 | chetnabagga.com |
| Kapaas by Nikita (boutique) | +919953660002 | kapaasbynikita.com |
| Mr. Fox (tailor) | +919355833409 | mrfox.in |
| KC Creations (fabric) | +919811926117 | kccreations.com |
| Ramji Sons (fabric) | +919958884713 | ramjisons.com |

Kardo and House of Roshans sell online too, but not on Shopify, so they need a small addition to the reader. Boutiques that sell only through Instagram need a different route (they send photos and prices, and the page offers "Ask on WhatsApp"); that is not built yet.

## Selling on Groovyn itself

Not part of this. Taking payment on Groovyn means a registered business, GST, payment-gateway KYC for Groovyn and for each seller, a returns and refund policy, shipping, and changes to the Terms and FAQ, which today say Groovyn does not sell. Revisit it only if the Buy taps show people want it.
