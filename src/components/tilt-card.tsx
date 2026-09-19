"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A card that tilts toward the cursor and carries a specular highlight that
 * tracks with it, so the surface reads as a physical panel catching light
 * rather than a rectangle that happens to rotate.
 *
 * Everything is written straight to style properties inside rAF — routing this
 * through React state would re-render the subtree on every mousemove.
 */
export function TiltCard({
  children,
  className,
  intensity = 9,
  lift = 1.03,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  lift?: number;
  glare?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const frame = React.useRef<number | null>(null);

  const apply = React.useCallback(
    (rx: number, ry: number, gx: number, gy: number, on: boolean) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = on
        ? `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${lift}, ${lift}, 1)`
        : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      el.style.setProperty("--gx", `${gx}%`);
      el.style.setProperty("--gy", `${gy}%`);
      el.style.setProperty("--glare", on ? "1" : "0");
    },
    [lift]
  );

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() =>
      apply(
        -(py - 0.5) * intensity,
        (px - 0.5) * intensity,
        px * 100,
        py * 100,
        true
      )
    );
  }

  function handleLeave() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => apply(0, 0, 50, 50, false));
  }

  React.useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    []
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "relative transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:!transform-none",
        className
      )}
    >
      {children}
      {glare ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--glare,0)] transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.28), transparent 45%)",
          }}
        />
      ) : null}
    </div>
  );
}
