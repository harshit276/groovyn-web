"use client";

import Image from "next/image";
import * as React from "react";

/**
 * The floating card cluster in the hero: four category tiles suspended at
 * different depths in one perspective stage. The whole stage counter-rotates
 * to the pointer, so the cards separate in Z as the user moves — the parallax
 * is what sells the depth, not the rotation itself.
 */

type Card = {
  slug: string;
  label: string;
  price: string;
  image: string;
  /** left/top placement, depth, and idle rotation for each tile. */
  x: string;
  y: string;
  z: number;
  rot: number;
  w: string;
};

const CARDS: Card[] = [
  {
    slug: "tailors",
    label: "Tailors",
    price: "from ₹450",
    image: "/images/cat-tailors.webp",
    x: "0%",
    y: "8%",
    z: 90,
    rot: -7,
    w: "54%",
  },
  {
    slug: "boutiques",
    label: "Boutiques",
    price: "from ₹3,500",
    image: "/images/cat-boutiques.webp",
    x: "44%",
    y: "0%",
    z: 20,
    rot: 5,
    w: "50%",
  },
  {
    slug: "fabric-shops",
    label: "Fabric",
    price: "per metre",
    image: "/images/cat-fabric-shops.webp",
    x: "8%",
    y: "56%",
    z: 45,
    rot: 6,
    w: "46%",
  },
  {
    slug: "rental-shops",
    label: "Rentals",
    price: "from ₹2,000",
    image: "/images/cat-rental-shops.webp",
    x: "52%",
    y: "50%",
    z: 120,
    rot: -4,
    w: "48%",
  },
];

export function HeroDeck() {
  const ref = React.useRef<HTMLDivElement>(null);
  const frame = React.useRef<number | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onMove(e: PointerEvent) {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        // Track against the viewport, so the deck responds to the cursor
        // anywhere in the hero rather than only directly over the cards.
        const px = e.clientX / window.innerWidth - 0.5;
        const py = e.clientY / window.innerHeight - 0.5;
        node.style.setProperty("--rx", `${(-py * 9).toFixed(2)}deg`);
        node.style.setProperty("--ry", `${(px * 12).toFixed(2)}deg`);
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div className="stage relative aspect-[4/3.4] w-full select-none">
      <div
        ref={ref}
        className="preserve-3d absolute inset-0 transition-transform duration-[400ms] ease-out"
        style={{
          transform:
            "rotateX(var(--rx, 4deg)) rotateY(var(--ry, -6deg))",
        }}
      >
        {CARDS.map((c, i) => (
          <figure
            key={c.slug}
            className="preserve-3d absolute overflow-hidden rounded-2xl border border-white/15 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
            style={{
              left: c.x,
              top: c.y,
              width: c.w,
              transform: `translateZ(${c.z}px) rotate(${c.rot}deg)`,
            }}
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 45vw, 260px"
                priority={i < 2}
                className="object-cover"
              />
              {/* Legibility scrim + a diagonal sheen for the glass read. */}
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-60" />
            </div>

            <figcaption className="absolute inset-x-0 bottom-0 p-3.5">
              <p className="font-display text-sm font-bold text-white drop-shadow-sm">
                {c.label}
              </p>
              <p className="text-[11px] font-medium text-white/70">{c.price}</p>
            </figcaption>
          </figure>
        ))}

        {/* Price chip floating nearest the viewer — the product's whole promise.
            Sits above the cluster's top-left corner so it never lands on a
            card's own caption. */}
        <div
          className="glass-panel preserve-3d absolute left-0 -top-[4%] rounded-xl px-3.5 py-2.5 sm:-left-[5%]"
          style={{ transform: "translateZ(200px) rotate(-4deg)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-300">
            Rate card
          </p>
          <p className="font-display text-lg font-extrabold text-white">
            ₹450<span className="text-xs font-medium text-white/60"> /shirt</span>
          </p>
        </div>
      </div>
    </div>
  );
}
