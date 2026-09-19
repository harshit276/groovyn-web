"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * One-shot scroll reveal. Renders visible-by-default markup and only hides it
 * once the observer is actually wired, so content is never trapped invisible
 * for crawlers or when JavaScript fails.
 */
export function Rise({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    el.classList.add("rise");

    function show() {
      el!.dataset.shown = "true";
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        show();
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    io.observe(el);

    // Safety net: an element the observer never reports (a resize race, a
    // container that clips it, a browser quirk) must not stay invisible
    // forever. Content beats choreography.
    const failsafe = window.setTimeout(() => {
      show();
      io.disconnect();
    }, 4000);

    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
    };
  }, []);

  return (
    <Tag
      // @ts-expect-error — one ref type across the small union of tags.
      ref={ref}
      className={cn(className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
