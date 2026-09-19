import { ImageResponse } from "next/og";

// Generated at build time so social shares always have a real, absolute image.
// The old site pointed og:image at a relative path, which meant every WhatsApp
// share rendered without a preview — and WhatsApp is the distribution channel.
export const alt = "Groovyn — Find the best tailors and custom clothing shops near you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 4,
              backgroundColor: "#c08a3e",
              display: "flex",
            }}
          />
          <div
            style={{
              color: "#dcb878",
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Groovyn
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#faf7f2",
              fontSize: 82,
              lineHeight: 1.05,
              letterSpacing: -2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Find the best tailors</span>
            <span style={{ color: "#cfa25a", fontStyle: "italic" }}>
              and shops near you.
            </span>
          </div>

          <div
            style={{
              marginTop: 28,
              color: "#c6ccda",
              fontSize: 30,
              fontFamily: "system-ui, sans-serif",
              display: "flex",
            }}
          >
            Tailors · Boutiques · Fabric · Rentals — Delhi NCR
          </div>
        </div>
      </div>
    ),
    size
  );
}
