"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Reveals content as it scrolls into view.
 *
 * Deliberately holds no React state: this is a purely visual effect, so it
 * toggles a data attribute and lets CSS do the work. Driving it from state
 * would re-render the subtree on every reveal for no benefit.
 *
 * Renders visible in the server HTML and only hides itself once the observer is
 * attached, so nothing disappears if JavaScript never runs. Skipped entirely
 * under prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", className)}
    >
      {children}
    </div>
  );
}
