import { cn } from "@/lib/utils";

/**
 * Edge-to-edge scrolling ticker. The item list is rendered twice so the
 * -50% keyframe lands exactly on a seam, giving a continuous loop.
 */
export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex overflow-hidden", className)}
      aria-hidden
    >
      {/* Fades hide the hard cut at both ends. */}
      <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent" />

      <div className="marquee-track flex shrink-0 items-center gap-10 pr-10">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            <span className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
              {item}
            </span>
            <span className="size-1 shrink-0 rounded-full bg-brand-300/50" />
          </span>
        ))}
      </div>
    </div>
  );
}
