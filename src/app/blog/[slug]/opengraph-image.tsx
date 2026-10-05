import { ImageResponse } from "next/og";

import { getPost } from "@/content/blog";
import { CLUSTER_META } from "@/lib/blog";

/**
 * Per-guide share image.
 *
 * In India the share channel is WhatsApp, and the preview card is most of the
 * decision to tap. A card that carries the guide's actual title beats a generic
 * site image every time.
 */
export const alt = "Groovyn guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PostOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  const title = post?.title ?? "Groovyn guides";
  const label = post ? CLUSTER_META[post.cluster].label : "Guides";

  // Keep long titles inside the card without an overflow the renderer can't
  // clip: step the size down as the title grows.
  const fontSize = title.length > 70 ? 54 : title.length > 50 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(135deg, #06070a 0%, #0f2a4a 55%, #3a1424 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#64a8ee",
            fontWeight: 700,
          }}
        >
          {label}
        </div>

        <div
          style={{
            display: "flex",
            fontSize,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 30,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <div style={{ display: "flex", fontWeight: 800, color: "#ffffff" }}>
            Groovyn
          </div>
          <div style={{ display: "flex" }}>Tailors, fabric and rentals in Delhi NCR</div>
        </div>
      </div>
    ),
    size
  );
}
