import { after } from "next/server";

import { clientKey, fail, ok, parseBody, rateLimit } from "@/lib/api";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { claimMessage, sendTelegram } from "@/lib/telegram";
import { claimSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "claim"), 5)) {
    return fail("Too many requests. Please try again in a minute.", 429);
  }

  const { data, error } = await parseBody(request, claimSchema);
  if (error) return error;

  // The form accepts either a real listing slug (from the "Claim this listing"
  // button) or free text typed by an owner who found us some other way.
  const store = await db.store.findUnique({
    where: { slug: data.storeSlug },
    select: { id: true, name: true },
  });

  if (!store) {
    // Don't lose the lead just because we can't match the shop — capture it as
    // a suggestion so the team can find or create the listing manually.
    const suggestion = await db.storeSuggestion.create({
      data: {
        name: data.storeSlug,
        category: "tailors",
        city: "Unknown",
        phone: data.phone,
        notes: `Unmatched claim from ${data.name}${
          data.email ? ` (${data.email})` : ""
        }. ${data.message ?? ""}`.trim(),
      },
      select: { id: true },
    });

    after(async () => {
      await sendTelegram(
        claimMessage(
          {
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            role: data.role ?? null,
            message: data.message ?? null,
            storeName: data.storeSlug,
            matched: false,
          },
          site.url
        )
      );
    });

    return ok(
      {
        matched: false,
        suggestionId: suggestion.id,
        message:
          "We couldn't find that listing automatically, so we've logged your details and will get in touch.",
      },
      { status: 202 }
    );
  }

  const claim = await db.claim.create({
    data: {
      storeId: store.id,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      role: data.role ?? null,
      message: data.message ?? null,
    },
    select: { id: true, status: true },
  });

  after(async () => {
    await sendTelegram(
      claimMessage(
        {
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          role: data.role ?? null,
          message: data.message ?? null,
          storeName: store.name,
          matched: true,
        },
        site.url
      )
    );
  });

  return ok({ matched: true, claim, storeName: store.name }, { status: 201 });
}
