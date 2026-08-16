import { after } from "next/server";

import { clientKey, fail, ok, parseBody, rateLimit } from "@/lib/api";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { sendTelegram, suggestionMessage } from "@/lib/telegram";
import { suggestionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "suggestion"), 5)) {
    return fail("Too many requests. Please try again in a minute.", 429);
  }

  const { data, error } = await parseBody(request, suggestionSchema);
  if (error) return error;

  const suggestion = await db.storeSuggestion.create({
    data: {
      name: data.name,
      category: data.category,
      city: data.city,
      locality: data.locality ?? null,
      phone: data.phone || null,
      address: data.address ?? null,
      notes: data.notes ?? null,
    },
    select: { id: true, status: true },
  });

  after(async () => {
    await sendTelegram(
      suggestionMessage(
        {
          name: data.name,
          category: data.category,
          city: data.city,
          locality: data.locality ?? null,
          phone: data.phone || null,
          notes: data.notes ?? null,
        },
        site.url
      )
    );
  });

  return ok({ suggestion }, { status: 201 });
}
