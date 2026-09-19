"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Services / Gallery / Reviews, as pills on a rail.
 *
 * Every panel stays in the DOM and is hidden with `hidden` rather than being
 * unmounted, so the price list and gallery are still in the server-rendered
 * HTML that crawlers read — a tabbed layout should not cost us the content.
 */
export function StoreTabs({
  tabs,
}: {
  tabs: { id: string; label: string; count?: number; panel: React.ReactNode }[];
}) {
  const available = tabs.filter((t) => t.panel);
  const [active, setActive] = React.useState(available[0]?.id ?? "");

  if (!available.length) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Store sections"
        className="inline-flex gap-1 rounded-full bg-ink-50 p-1.5 ring-1 ring-ink-100"
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
                "rounded-full px-4 py-2 font-display text-sm font-bold transition-all duration-300",
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
