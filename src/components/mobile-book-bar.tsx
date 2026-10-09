"use client";

import { CalendarCheck, Phone } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The booking button that stays in reach on a phone.
 *
 * The visit form is the thing this page is for, and on a long page it used to
 * be the last block. This bar keeps "Book a free visit" and "Call" at the
 * bottom of the screen, and gets out of the way when the form itself, or the
 * site footer, is on screen, so it never covers what it points at.
 */
export function MobileBookBar({
  phone,
  storeName,
}: {
  phone: string | null;
  storeName: string;
}) {
  // Starts hidden so it never flashes on screen while the form, which is right
  // under the shop header on a phone, is still in view. It slides in once the
  // observer below confirms neither the form nor the footer is on screen.
  const [hidden, setHidden] = React.useState(true);

  React.useEffect(() => {
    const targets: Element[] = [];
    const form = document.getElementById("book");
    const footer = document.querySelector("footer");
    if (form) targets.push(form);
    if (footer) targets.push(footer);
    if (!targets.length || typeof IntersectionObserver === "undefined") return;

    const inView = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        setHidden(inView.size > 0);
      },
      { threshold: 0.1 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={hidden}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 px-4 pt-3 shadow-[0_-10px_30px_-14px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-300 lg:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div className="mx-auto flex max-w-md gap-2">
        <a
          href="#book"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-3d-brand transition-colors hover:bg-brand-600"
        >
          <CalendarCheck aria-hidden className="size-4" />
          Book a free visit
        </a>
        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            aria-label={`Call ${storeName}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-400"
          >
            <Phone aria-hidden className="size-4" />
            Call
          </a>
        ) : null}
      </div>
    </div>
  );
}
