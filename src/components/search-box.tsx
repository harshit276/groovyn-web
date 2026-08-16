"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import type { CityDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type Suggestion = { label: string; href: string; sublabel: string };

export function SearchBox({
  cities,
  defaultCity,
  defaultQuery = "",
  size = "lg",
  className,
}: {
  cities: CityDTO[];
  defaultCity?: string;
  defaultQuery?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState(defaultQuery);
  const [city, setCity] = React.useState(defaultCity ?? cities[0]?.slug ?? "");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  // Debounced type-ahead. Aborts in-flight requests so results can't land out
  // of order. All state updates happen inside the timer callback rather than
  // synchronously in the effect body, which would cause cascading renders.
  React.useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (q.trim().length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/v1/search/suggest?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(
          [...data.stores, ...data.services, ...data.localities].slice(0, 8)
        );
        setOpen(true);
      } catch {
        // Aborted or offline — leave the previous suggestions in place.
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  React.useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form
        onSubmit={submit}
        role="search"
        className={cn(
          "flex flex-col gap-2 rounded-card border border-paper-300 bg-paper-50 p-2 shadow-[0_8px_30px_-18px_rgb(20_27_45_/_0.4)] sm:flex-row sm:items-center sm:rounded-full",
          size === "lg" ? "sm:p-2" : "sm:p-1.5"
        )}
      >
        <label className="sr-only" htmlFor="search-q">
          What do you need stitched?
        </label>
        <div className="flex flex-1 items-center gap-2 px-3">
          <Search aria-hidden className="size-4 shrink-0 text-ink-400" />
          <input
            id="search-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => suggestions.length && setOpen(true)}
            placeholder="Suit stitching, blouse, lehenga rental…"
            autoComplete="off"
            className={cn(
              "w-full bg-transparent text-ink-900 placeholder:text-ink-400 focus:outline-none",
              size === "lg" ? "h-11" : "h-9 text-sm"
            )}
          />
        </div>

        <div className="flex items-center gap-2 sm:border-l sm:border-paper-300 sm:pl-3">
          <label className="sr-only" htmlFor="search-city">
            City
          </label>
          <select
            id="search-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={cn(
              "w-full cursor-pointer rounded-full bg-transparent px-2 text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 sm:w-auto",
              size === "lg" ? "h-11" : "h-9 text-sm"
            )}
          >
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            type="submit"
            variant="brass"
            size={size === "lg" ? "md" : "sm"}
            className="shrink-0"
          >
            Search
          </Button>
        </div>
      </form>

      {open && suggestions.length ? (
        <ul className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-card border border-paper-300 bg-paper-50 shadow-lg">
          {suggestions.map((s) => (
            <li key={`${s.href}-${s.label}`}>
              <a
                href={s.href}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-paper-200"
              >
                <span className="text-ink-900">{s.label}</span>
                <span className="text-xs text-ink-400">{s.sublabel}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
