"use client";

import { Heart } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const KEY = "groovyn:saved";
const CHANGED = "groovyn:saved-changed";

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    // Private mode, blocked storage, corrupt value — saving is a convenience,
    // never a reason to break the card.
    return [];
  }
}

/** localStorage is an external store, so subscribe to it rather than mirroring
 *  it into React state — that keeps every card for the same shop in sync and
 *  avoids a setState on mount. */
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

/**
 * The heart from the app's cards.
 *
 * The app saves to an account; the web app has no login, so the list lives in
 * the browser. That is a deliberate limit — asking someone to sign up before
 * they can shortlist a tailor would lose more people than the feature is worth.
 */
export function SaveButton({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const saved = React.useSyncExternalStore(
    subscribe,
    () => readSaved().includes(slug),
    // Server render: nothing is saved, so the icon matches the first paint.
    () => false
  );

  function toggle(e: React.MouseEvent) {
    // The whole card is a link; the heart must not follow it.
    e.preventDefault();
    e.stopPropagation();

    const current = readSaved();
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];

    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable — nothing to persist, and nothing to report.
    }
    window.dispatchEvent(new Event(CHANGED));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      className={cn(
        "-m-1 grid size-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-ink-50",
        className
      )}
    >
      <Heart
        aria-hidden
        className={cn(
          "size-5 transition-colors",
          saved ? "fill-accentpink-500 text-accentpink-500" : "text-ink-400"
        )}
      />
    </button>
  );
}
