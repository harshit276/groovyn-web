# Asking shops to join in: what to offer, what to ask, what to say

The working copy is a spreadsheet, `data/shop-outreach.xlsx`. It is not in git because it holds phone numbers and who said yes. This page is the reasoning and the wording behind it.

## Who can be reached

75 listings. Every saved phone number is the shop's phone, and the site used to treat all of them as WhatsApp. They are not:

| | Shops |
|---|---|
| Mobile number, can be on WhatsApp | 35 |
| Landline only: call, ask for a WhatsApp number | 31 |
| No number: find one on Google Maps or Instagram | 9 |

The store page now shows the WhatsApp button only for a mobile number. `npm run import:stores` no longer copies a landline into the WhatsApp field.

## What the shop gets (all true today)

- **A free listing that is already live,** built from public Google details. They can ask to be removed.
- **Booking requests sent straight to them.** A visitor books a visit on the shop's page, and the request goes to the shop as a lead. No commission, no fee, and we never sell the number.
- **A "Prices listed" badge and a higher place** in Groovyn's default order for a shop that shares its own price list (see How we rank).
- **A "Visit offer" badge** if they want to give people who book through Groovyn something small.
- **Boutiques and online shops: their pieces on their page,** with a button that takes people to their own site to buy. Taps are counted, so we can tell them how many people we sent.

We do not promise a number of customers. There have been no bookings yet. The message says each request comes to the shop as a lead, which is true, and stops there.

## What we ask

1. **A price list, from every shop.** A photo or a message is fine. We add it and update it when they send changes. Tailors: stitching and alteration rates. Fabric: per metre by type. Rentals: rent, deposit and rental days for each outfit type. Boutiques: a price list or a range.
2. **Boutiques, and shops with an online shop: their products.** A website link, or photos and prices of 6 to 8 pieces. A website link is switched on with `npm run products` (see docs/boutique-showcase.md). Photos sent on WhatsApp need the "ask on WhatsApp" route, which is not built yet.
3. **Optional: a small offer** for people who book through Groovyn, in the shop's own words. It is published with `npm run offer`.

## The message

The spreadsheet has this ready for each shop, in English and in Hinglish, with a link that opens WhatsApp with the text already typed. This is the English wording for a boutique (tailors, fabric and rental shops get the same without line 2 of the asks, and with their own price-list wording):

> Hello, this is a message from Groovyn (groovyn.com), a free directory that helps people in Delhi NCR find good tailors, boutiques and fabric shops.
>
> *{Shop}* is already listed on Groovyn from public Google details: {page link}
>
> What you get, free:
> • People looking for a boutique in {area} can book a visit on your page. Each request comes straight to you as a lead. No commission, and we never sell your number.
> • Shops that share a price list get a "Prices listed" badge and are shown higher on Groovyn.
>
> Could you please send:
> 1. Your price list, or the price range of your outfits. I'll add it to your page and update it whenever you send changes.
> 2. Your products: your website link, or photos and prices of 6 to 8 pieces. I'll show them on your page, with a button for customers to buy from your website or message you on WhatsApp.
> 3. Optional: a small offer for people who book through Groovyn.
>
> If you'd rather not be listed, tell me and I'll remove it. Thank you!

## Sending

- About 10 a day, in the order of the Day column. Sending many at once from one number can get it blocked.
- Never send the same shop twice. If someone says no, stop, and take the listing down if they ask.
- The seven shops with a Shopify store (Asiana, Chetna Bagga, Kapaas, Mr. Fox, KC Creations, Ramji Sons, and Bhaavya by Instagram) are on day 1, because their yes unlocks the showcase.

## When a reply comes

- **A price list:** save the photo or text, tell Claude the shop's name, and it is added to the page as the shop's own, with the date. The shop then gets the "Prices listed" badge and ranks higher.
- **A yes to showing products:** keep the message. Record it with `npm run products -- approve <slug> "Owner, WhatsApp, <date>"`, then `refresh`. Nothing shows without it.
- **An offer:** `npm run offer -- <slug> "<their words>" "<their conditions>"`.
- **A no, or a request to be removed:** remove the listing the same day.
