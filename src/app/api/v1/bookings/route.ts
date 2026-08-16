import { after } from "next/server";

import { clientKey, fail, ok, parseBody, rateLimit } from "@/lib/api";
import { db } from "@/lib/db";
import { storeHref } from "@/lib/queries";
import { site } from "@/lib/site";
import { bookingMessage, sendTelegram } from "@/lib/telegram";
import { bookingSchema } from "@/lib/validation";

/**
 * Visit bookings — deliberately free and non-transactional.
 *
 * Every row here is evidence of footfall driven to a specific shop, which is
 * the asset that makes a monetisation conversation possible later. Keep `source`
 * populated so we can tell which surfaces actually convert.
 */
export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "booking"))) {
    return fail("Too many requests. Please try again in a minute.", 429);
  }

  const { data, error } = await parseBody(request, bookingSchema);
  if (error) return error;

  const store = await db.store.findUnique({
    where: { id: data.storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      city: { select: { slug: true } },
    },
  });
  if (!store) return fail("That shop no longer exists.", 404);

  let preferredDate: Date | null = null;
  if (data.preferredDate) {
    const parsed = new Date(data.preferredDate);
    if (!Number.isNaN(parsed.getTime())) preferredDate = parsed;
  }

  const booking = await db.visitBooking.create({
    data: {
      storeId: store.id,
      type: data.type,
      name: data.name,
      phone: data.phone,
      preferredDate,
      preferredSlot: data.preferredSlot ?? null,
      serviceWanted: data.serviceWanted ?? null,
      notes: data.notes ?? null,
      source: data.source ?? null,
    },
    select: { id: true, status: true, type: true },
  });

  // Notify after the response is sent — the customer shouldn't wait on
  // Telegram, and a failed notification must not fail a saved booking.
  after(async () => {
    await sendTelegram(
      bookingMessage(
        {
          type: data.type,
          name: data.name,
          phone: data.phone,
          storeName: store.name,
          storeHref: storeHref(store.city.slug, store.category, store.slug),
          preferredDate,
          preferredSlot: data.preferredSlot ?? null,
          serviceWanted: data.serviceWanted ?? null,
          notes: data.notes ?? null,
          source: data.source ?? null,
        },
        site.url
      )
    );
  });

  return ok({ booking, storeName: store.name }, { status: 201 });
}
