"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The app's store page splits into Services / Gallery / Reviews with a black
 * underline on the active tab. Same structure here.
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
        className="flex gap-7 border-b border-ink-100"
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
                "relative -mb-px pb-3 pt-1 font-display text-base font-semibold transition-colors",
                isActive ? "text-ink-900" : "text-ink-400 hover:text-ink-700"
              )}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span className="ml-1.5 text-sm font-normal text-ink-400">
                  {tab.count}
                </span>
              ) : null}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-colors",
                  isActive ? "bg-ink-900" : "bg-transparent"
                )}
              />
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
          className="pt-6"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
