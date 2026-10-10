import { db } from "@/lib/db";

/**
 * Sends a visitor from a Groovyn page to a shop's own product page, and counts
 * the tap on the way.
 *
 * Why it exists: Groovyn does not sell these pieces, so the only thing a "Buy"
 * button can do is leave for the shop. Counting those leaves is how we learn
 * whether people want this, and what to tell a boutique about the traffic it
 * gets from us. It records a bare number per product and nothing about the
 * visitor.
 *
 * It only redirects to a URL we stored ourselves for an approved shop, looked
 * up by id, so it cannot be turned into an open redirect.
 */
const HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(
  _request: Request,
  { params }: RouteContext<"/go/[id]">
) {
  const { id } = await params;

  const product = await db.shopProduct.findUnique({
    where: { id },
    select: { url: true, store: { select: { productsApproved: true } } },
  });

  if (!product || !product.store.productsApproved) {
    return new Response("Not found", { status: 404, headers: HEADERS });
  }

  // Counting must never stand between the visitor and the shop.
  try {
    await db.shopProduct.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  } catch {
    /* ignore */
  }

  return new Response(null, {
    status: 302,
    headers: { ...HEADERS, Location: product.url },
  });
}
