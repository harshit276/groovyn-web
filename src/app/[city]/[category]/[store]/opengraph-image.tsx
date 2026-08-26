import { ImageResponse } from "next/og";

import { getStoreDetail } from "@/lib/queries";
import { getCategory } from "@/lib/site";
import { formatPriceRange } from "@/lib/utils";

/**
 * Per-store share image.
 *
 * Store pages previously fell back to the site-wide og:image, so every shop
 * shared identically. In India the share channel is WhatsApp, where the preview
 * card is most of the click decision — a card naming the shop, its locality and
 * its price is the difference between a link that gets tapped and one that
 * doesn't.
 */
export const alt = "Groovyn listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENTS: Record<string, string> = {
  tailors: "#c08a3e",
  boutiques: "#a86b93",
  "fabric-shops": "#4f9b99",
  "rental-shops": "#c87259",
};

export default async function StoreOgImage({
  params,
}: {
  params: Promise<{ city: string; category: string; store: string }>;
}) {
  const { store: storeSlug } = await params;
  const store = await getStoreDetail(storeSlug);

  const name = store?.name ?? "Groovyn";
  const category = store ? getCategory(store.category) : undefined;
  const accent = store ? (ACCENTS[store.category] ?? "#c08a3e") : "#c08a3e";
  const where = store
    ? [store.locality?.name, store.city.name].filter(Boolean).join(", ")
    : "Delhi NCR";
  const price = store ? formatPriceRange(store.priceMin, store.priceMax) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#141b2d",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 4, backgroundColor: accent, display: "flex" }} />
          <div
            style={{
              color: accent,
              fontSize: 21,
              letterSpacing: 5,
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
              display: "flex",
            }}
          >
            {category?.singular ?? "Groovyn"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#faf7f2",
              // Long shop names need to stay on the card.
              fontSize: name.length > 26 ? 62 : 78,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              display: "flex",
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 20,
              color: "#c6ccda",
              fontSize: 30,
              fontFamily: "system-ui, sans-serif",
              display: "flex",
            }}
          >
            {where}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(250,247,242,0.16)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#8b93a7",
                fontSize: 17,
                letterSpacing: 3,
                textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
                display: "flex",
              }}
            >
              Typical range
            </div>
            <div style={{ color: "#dcb878", fontSize: 40, marginTop: 6, display: "flex" }}>
              {price}
            </div>
          </div>
          <div
            style={{
              color: "#faf7f2",
              fontSize: 30,
              letterSpacing: 4,
              display: "flex",
            }}
          >
            groovyn.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
