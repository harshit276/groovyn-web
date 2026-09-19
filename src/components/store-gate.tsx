"use client";

import * as React from "react";

/**
 * The arrival at a shopfront.
 *
 * Every shop in these markets is a roller shutter you stand in front of. So
 * that is the arrival: corrugated steel across the viewport, a brass lock that
 * springs, and the shutter rolling up to reveal the shop — with warm light
 * spilling from underneath as it lifts.
 *
 * Rules this obeys, because a full-screen animation is otherwise a bounce
 * machine rather than a delight:
 *
 *  - The page content is ALWAYS in the DOM underneath. The gate is a fixed
 *    overlay, so crawlers, screen readers and no-JS visitors never see it.
 *  - The server renders nothing, so the HTML is the shop itself.
 *  - Once per shop per tab session. A shutter you have already walked under
 *    is an obstacle, not an experience.
 *  - Any key, click, scroll or touch skips it — but only after a short grace
 *    period, since the tap that navigated here can still be in flight and
 *    would otherwise dismiss the gate before anyone saw it.
 *  - prefers-reduced-motion skips it entirely.
 *  - It self-dismisses on a timer even if an animation event never fires, so
 *    a stalled animation can never trap the page behind a steel sheet.
 *
 * The gate lives in a module store rather than component state. It is an
 * external, time-driven thing with a body-scroll lock attached: keeping it
 * outside React means a remount (React StrictMode double-invokes effects in
 * development) resumes the same gate instead of reading back the
 * sessionStorage flag it just wrote and concluding it was already seen.
 */

const TOTAL_MS = 780;
const ARM_SKIP_MS = 200;

type Phase = "none" | "playing";

type Gate = {
  phase: Phase;
  /** Guards against re-deciding on a remount. */
  decided: boolean;
  listeners: Set<() => void>;
  teardown: (() => void) | null;
};

const gates = new Map<string, Gate>();

function getGate(key: string): Gate {
  let gate = gates.get(key);
  if (!gate) {
    gate = { phase: "none", decided: false, listeners: new Set(), teardown: null };
    gates.set(key, gate);
  }
  return gate;
}

function finish(key: string) {
  const gate = getGate(key);
  if (gate.phase === "none") return;
  gate.phase = "none";
  gate.teardown?.();
  gate.teardown = null;
  gate.listeners.forEach((l) => l());
}

/** Decides once per tab session whether this shop's shutter should play. */
function begin(key: string) {
  const gate = getGate(key);
  if (gate.decided) return;
  gate.decided = true;

  let seen = false;
  try {
    seen = sessionStorage.getItem(key) === "1";
  } catch {
    // Private mode or blocked storage — treat as unseen; it plays once.
  }

  if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* non-fatal */
  }

  gate.phase = "playing";

  // Lock scrolling while the shutter is down, so a scroll behind it cannot
  // strand the reader mid-page when it lifts.
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const skip = () => finish(key);

  // Failsafe first: whatever happens to the animation, the gate lifts.
  const timer = window.setTimeout(skip, TOTAL_MS);

  const arm = window.setTimeout(() => {
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("wheel", skip, { once: true, passive: true });
    window.addEventListener("touchstart", skip, { once: true, passive: true });
  }, ARM_SKIP_MS);

  gate.teardown = () => {
    window.clearTimeout(timer);
    window.clearTimeout(arm);
    window.removeEventListener("keydown", skip);
    window.removeEventListener("pointerdown", skip);
    window.removeEventListener("wheel", skip);
    window.removeEventListener("touchstart", skip);
    document.body.style.overflow = prevOverflow;
  };
}

export function StoreGate({
  storeName,
  category,
  accent,
}: {
  storeName: string;
  category: string;
  accent: string;
}) {
  const key = `groovyn:gate:${storeName}`;

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const gate = getGate(key);
      gate.listeners.add(onChange);
      begin(key);

      return () => {
        gate.listeners.delete(onChange);
        // A genuine unmount mid-play must release the scroll lock. Deferred by
        // a tick so StrictMode's unsubscribe/resubscribe does not kill it.
        window.setTimeout(() => {
          if (gate.listeners.size === 0) finish(key);
        }, 0);
      };
    },
    [key]
  );

  const phase = React.useSyncExternalStore(
    subscribe,
    () => getGate(key).phase,
    // Server render: no gate in the HTML at all.
    () => "none" as Phase
  );

  if (phase !== "playing") return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[70] overflow-hidden"
      style={{ animation: `gate-fade 150ms ease-out ${TOTAL_MS - 140}ms both` }}
    >
      {/* Warm interior light spilling out from under the rising shutter. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 105%, rgba(255,196,120,0.55), transparent 62%)",
          animation: "gate-glow 620ms ease-out 90ms both",
        }}
      />

      {/* The shutter itself. */}
      <div
        className="shutter-steel absolute inset-0 flex flex-col items-center justify-center"
        style={{
          animation:
            "shutter-up 560ms cubic-bezier(0.6, 0, 0.3, 1) 160ms both",
          boxShadow: "inset 0 -30px 60px -20px rgba(0,0,0,0.9)",
        }}
      >
        {/* Shop plate riveted to the steel. */}
        <div className="px-8 text-center">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.34em]"
            style={{ color: accent }}
          >
            {category}
          </p>
          <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white/90 sm:text-4xl">
            {storeName}
          </p>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.24em] text-white/35">
            Opening
          </p>
        </div>

        {/* Brass lock, springing off before the shutter moves. */}
        <div
          className="absolute bottom-[16%] left-1/2 -translate-x-1/2"
          style={{ animation: "lock-pop 240ms cubic-bezier(0.4, 0, 0.6, 1) both" }}
        >
          <span className="brass block size-9 rounded-md shadow-lg" />
          <span className="mx-auto -mt-[26px] block size-5 rounded-t-full border-[3px] border-b-0 border-[#c99a45]" />
        </div>

        {/* Pull-handle rail along the bottom edge of the shutter. */}
        <span className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-b from-[#4a4f58] to-[#15181c]" />
      </div>
    </div>
  );
}
