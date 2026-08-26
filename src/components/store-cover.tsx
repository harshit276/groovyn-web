import { getCategory } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Generated cover art for a listing that has no first-party photography.
 *
 * The alternative — repeating four stock photos across seventy-five shops —
 * looks like a cheap catalogue and quietly tells the user the listings are
 * filler. A woven swatch is honest about being a graphic, is unique per shop,
 * and is the right motif for a clothing directory.
 *
 * Everything is derived from the slug, so a shop's swatch never changes between
 * renders or deploys.
 */

const WEAVES = [
  "herringbone",
  "pinstripe",
  "twill",
  "windowpane",
  "basketweave",
  "dobby",
  "chevron",
  "houndstooth",
] as const;

type Weave = (typeof WEAVES)[number];

/** FNV-1a. Small, stable, and good enough to scatter slugs across variants. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function monogram(name: string): string {
  const words = name
    .replace(/[^A-Za-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !["the", "by", "and", "at", "of"].includes(w.toLowerCase()));
  if (!words.length) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function WeaveDef({ weave, id, color }: { weave: Weave; id: string; color: string }) {
  const stroke = { stroke: color, fill: "none", strokeWidth: 1.15 };

  switch (weave) {
    case "herringbone":
      return (
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 8 L4 4 L8 8 L12 4 L16 8" {...stroke} />
          <path d="M0 16 L4 12 L8 16 L12 12 L16 16" {...stroke} />
        </pattern>
      );
    case "pinstripe":
      return (
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M2 0 V10" {...stroke} />
        </pattern>
      );
    case "twill":
      return (
        <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 9 L9 0" {...stroke} />
          <path d="M-2 2 L2 -2" {...stroke} />
          <path d="M7 11 L11 7" {...stroke} />
        </pattern>
      );
    case "windowpane":
      return (
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 0 H26 M0 0 V26" {...stroke} />
        </pattern>
      );
    case "basketweave":
      return (
        <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
          <rect x="1" y="1" width="7" height="7" {...stroke} />
          <rect x="10" y="10" width="7" height="7" {...stroke} />
        </pattern>
      );
    case "dobby":
      return (
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.5" fill={color} stroke="none" />
          <circle cx="10" cy="10" r="1.5" fill={color} stroke="none" />
        </pattern>
      );
    case "chevron":
      return (
        <pattern id={id} width="20" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 12 L10 2 L20 12" {...stroke} />
        </pattern>
      );
    case "houndstooth":
      return (
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 L10 10 L10 0" {...stroke} />
          <path d="M10 20 L10 10 L20 10" {...stroke} />
          <path d="M0 0 L5 5 M15 15 L20 20" {...stroke} />
        </pattern>
      );
  }
}

export function StoreCover({
  name,
  slug,
  category,
  className,
  showMonogram = true,
}: {
  name: string;
  slug: string;
  category: string;
  className?: string;
  showMonogram?: boolean;
}) {
  const h = hash(slug);
  const weave = WEAVES[h % WEAVES.length];
  const accent = getCategory(category)?.accent ?? "var(--color-brand-500)";
  const patternId = `weave-${slug.replace(/[^a-z0-9]/gi, "")}`;
  // Small rotation so neighbouring tiles in a grid never look aligned.
  const rotation = ((h >> 8) % 4) * 15 - 22;
  // Every shop in a category shares one accent, so pattern alone leaves a grid
  // looking monotone. A small hue and saturation shift per shop gives each tile
  // its own tone while staying recognisably within the category's colour.
  const hueShift = (((h >> 16) % 29) - 14).toFixed(0);
  const saturation = (0.85 + ((h >> 20) % 40) / 100).toFixed(2);

  return (
    <div
      className={cn("relative overflow-hidden bg-ink-50", className)}
      aria-hidden
    >
      <svg
        className="absolute inset-0 size-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 400 300"
        style={{ filter: `hue-rotate(${hueShift}deg) saturate(${saturation})` }}
      >
        <defs>
          <WeaveDef weave={weave} id={patternId} color={accent} />
          <linearGradient id={`${patternId}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.17" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <rect width="400" height="300" fill={`url(#${patternId}-fade)`} />
        <g
          opacity="0.52"
          transform={`rotate(${rotation} 200 150) scale(1.6)`}
          style={{ transformOrigin: "center" }}
        >
          <rect x="-200" y="-150" width="800" height="600" fill={`url(#${patternId})`} />
        </g>
      </svg>

      {showMonogram ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-6xl font-semibold tracking-tight opacity-25 select-none"
            style={{ color: accent }}
          >
            {monogram(name)}
          </span>
        </div>
      ) : null}

      {/* A woven edge, so the tile reads as cloth rather than an empty box. */}
      <span
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ backgroundColor: accent, opacity: 0.35 }}
      />
    </div>
  );
}
