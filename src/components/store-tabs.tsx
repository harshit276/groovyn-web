"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Prices / Collection / Gallery / Reviews, as pills on a rail.
 *
 * Every panel stays in the DOM and is hidden with `hidden` rather than being
 * unmounted, so the price list and gallery are still in the server-rendered
 * HTML that crawlers read — a tabbed layout should not cost us the content.
 */
export function StoreTabs({
  tabs,
  defaultTab,
}: {
  tabs: { id: string; label: string; count?: number; panel: React.ReactNode }[];
  /** The tab open on arrival, when it is not the first one. */
  defaultTab?: string;
}) {
  const available = tabs.filter((t) => t.panel);
  const [active, setActive] = React.useState(
    available.find((t) => t.id === defaultTab)?.id ?? available[0]?.id ?? ""
  );

  // A link to something inside a tab that is not open (the hero's "See typical
  // prices", say) opens that tab and scrolls to it. A hidden element cannot be
  // scrolled to, so without this the link would do nothing.
  const ids = available.map((t) => t.id).join("|");
  React.useEffect(() => {
    function openForHash() {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash) return;
      const target = document.getElementById(hash);
      const tabId = target?.closest('[role="tabpanel"]')?.id.replace(/^panel-/, "");
      if (!target || !tabId || !ids.split("|").includes(tabId)) return;
      setActive(tabId);
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
    window.addEventListener("hashchange", openForHash);
    return () => window.removeEventListener("hashchange", openForHash);
  }, [ids]);

  if (!available.length) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Store sections"
        // max-w-full + overflow: four tabs (Prices, Collection, Gallery,
        // Reviews) are wider than a phone, so the rail scrolls rather than
        // pushing the whole page sideways.
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-ink-50 p-1.5 ring-1 ring-ink-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {available.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-display text-sm font-bold transition-all duration-300",
                isActive
                  ? "bg-ink-950 text-white shadow-md"
                  : "text-ink-500 hover:bg-white hover:text-ink-900"
              )}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span
                  className={cn(
                    "ml-1.5 text-xs font-semibold",
                    isActive ? "text-white/50" : "text-ink-400"
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {available.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="pt-7"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
