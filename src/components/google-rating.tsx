import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Google's rating, always labelled as Google's.
 *
 * Two rules this component exists to enforce:
 *  - It must never read as a Groovyn rating. Google requires attribution, and
 *    borrowing someone else's score without saying so is misleading anyway.
 *  - It must never reach our structured data. `aggregateRating` markup is meant
 *    to be ratings the site itself collected; putting a third party's number
 *    there is a manual-action risk. That's why this lives in `googleRating`
 *    rather than `ratingAvg`, and why lib/schema.ts never touches it.
 */
export function GoogleRating({
  rating,
  count,
  mapsUri,
  variant = "inline",
  className,
}: {
  rating: number | null;
  count: number | null;
  mapsUri?: string | null;
  /** "pill" sits over a photo; "inline" sits in a row of text. */
  variant?: "pill" | "inline";
  className?: string;
}) {
  if (rating == null) return null;

  const label = `${rating.toFixed(1)} on Google${
    count ? ` from ${count.toLocaleString("en-IN")} reviews` : ""
  }`;

  const body = (
    <>
      <Star
        aria-hidden
        className={cn(
          "size-3.5 shrink-0",
          variant === "pill"
            ? "fill-amber-400 text-amber-400"
            : "fill-amber-500 text-amber-500"
        )}
      />
      <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
      {count ? (
        <span
          className={cn(
            "tabular-nums",
            variant === "pill" ? "text-white/70" : "text-ink-400"
          )}
        >
          ({count.toLocaleString("en-IN")})
        </span>
      ) : null}
      <span
        className={cn(
          "text-[10px] uppercase tracking-wide",
          variant === "pill" ? "text-white/70" : "text-ink-400"
        )}
      >
        Google
      </span>
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-1 text-xs",
    variant === "pill"
      ? "rounded-full bg-black/70 px-2.5 py-1 text-white backdrop-blur-sm"
      : "text-ink-600",
    className
  );

  // Link to the Google listing where we have it — that is the attribution.
  if (mapsUri) {
    return (
      <a
        href={mapsUri}
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label={label}
        className={cn(classes, "relative z-10 hover:underline")}
      >
        {body}
      </a>
    );
  }

  return (
    <span aria-label={label} className={classes}>
      {body}
    </span>
  );
}
