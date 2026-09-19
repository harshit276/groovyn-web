"use client";

import * as React from "react";

import { getOpenState, type OpenState } from "@/lib/hours";
import { cn } from "@/lib/utils";

/**
 * Live "open now" pill.
 *
 * Deliberately absent from the server render: these pages are ISR'd with a
 * one-hour revalidate, so anything computed on the server would be a stale
 * claim about whether a shop is trading right now. Nothing here is worse than
 * confidently saying "Open" about a closed shutter.
 *
 * The wall clock is an external store, so it is subscribed to rather than
 * mirrored into state — the pill re-evaluates on the minute and an open shop
 * flips to closed in a tab left sitting.
 */

const listeners = new Set<() => void>();
let ticker: number | null = null;
/** Bumped each minute; used as the snapshot identity so React re-reads. */
let tick = 0;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (ticker === null) {
    ticker = window.setInterval(() => {
      tick += 1;
      listeners.forEach((l) => l());
    }, 60_000);
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && ticker !== null) {
      window.clearInterval(ticker);
      ticker = null;
    }
  };
}

export function ShopStatus({
  hours,
  className,
}: {
  hours: Record<string, string>;
  className?: string;
}) {
  // getSnapshot must be cheap and referentially stable between ticks, so it
  // returns the counter and the state is derived from it.
  const currentTick = React.useSyncExternalStore(
    subscribe,
    () => tick,
    () => -1
  );

  const state: OpenState | null = React.useMemo(
    () => (currentTick < 0 ? null : getOpenState(hours)),
    [hours, currentTick]
  );

  // Nothing until we know — an empty slot beats a wrong badge.
  if (!state || state.status === "unknown") return null;

  const tone =
    state.status === "open"
      ? {
          dot: "text-emerald-400",
          text: "text-emerald-300",
          ring: "border-emerald-400/30 bg-emerald-400/10",
        }
      : state.status === "closing-soon"
        ? {
            dot: "text-amber-400",
            text: "text-amber-300",
            ring: "border-amber-400/30 bg-amber-400/10",
          }
        : {
            dot: "text-ink-400",
            text: "text-white/55",
            ring: "border-white/15 bg-white/5",
          };

  const label =
    state.status === "open"
      ? `Open now · till ${state.until}`
      : state.status === "closing-soon"
        ? `Closing soon · ${state.until}`
        : state.opensAt
          ? `Closed · opens ${state.opensDay ? `${state.opensDay} ` : ""}${state.opensAt}`
          : "Closed";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm",
        tone.ring,
        tone.text,
        className
      )}
    >
      <span
        className={cn(
          "relative flex size-1.5 rounded-full bg-current",
          tone.dot,
          state.status !== "closed" && "live-dot"
        )}
      />
      {label}
    </span>
  );
}
