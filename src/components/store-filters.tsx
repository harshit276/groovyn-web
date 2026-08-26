"use client";

import { LayoutGrid, List, Rows3, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import type { LocalityDTO, ServiceDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "relevance", label: "Most relevant" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name (A–Z)" },
] as const;

/**
 * Horizontal, sticky filter bar.
 *
 * Deliberately not a left sidebar: a filter rail beside a card grid is the
 * universal directory layout, and it is the main reason this page read as
 * generic. Filters belong in a slim band that gets out of the way of the
 * listings.
 */
export function StoreFilters({
  localities,
  services,
  specialities,
  total,
}: {
  localities: LocalityDTO[];
  services: ServiceDTO[];
  specialities: string[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const setParam = React.useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      // Any filter change resets pagination, otherwise you land on an empty page 3.
      if (key !== "view") params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const active = {
    locality: searchParams.get("locality"),
    service: searchParams.get("service"),
    speciality: searchParams.get("speciality"),
    homeVisit: searchParams.get("homeVisit") === "1",
    rateCard: searchParams.get("rateCard") === "1",
    sort: searchParams.get("sort") ?? "relevance",
    view: (() => {
      const v = searchParams.get("view");
      return v === "index" || v === "gallery" ? v : "list";
    })(),
  };

  const activeCount =
    (active.locality ? 1 : 0) +
    (active.service ? 1 : 0) +
    (active.speciality ? 1 : 0) +
    (active.homeVisit ? 1 : 0) +
    (active.rateCard ? 1 : 0);

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    ["locality", "service", "speciality", "homeVisit", "rateCard", "page"].forEach(
      (k) => params.delete(k)
    );
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const selects = (
    <>
      <Select
        label="Locality"
        value={active.locality ?? ""}
        onChange={(v) => setParam("locality", v || null)}
        options={[
          { value: "", label: "All localities" },
          ...localities.map((l) => ({
            value: l.slug,
            label: `${l.name} (${l.storeCount})`,
          })),
        ]}
      />
      {services.length ? (
        <Select
          label="Service"
          value={active.service ?? ""}
          onChange={(v) => setParam("service", v || null)}
          options={[
            { value: "", label: "Any service" },
            ...services.map((s) => ({ value: s.slug, label: s.name })),
          ]}
        />
      ) : null}
      {specialities.length ? (
        <Select
          label="Speciality"
          value={active.speciality ?? ""}
          onChange={(v) => setParam("speciality", v || null)}
          options={[
            { value: "", label: "Any speciality" },
            ...specialities.map((s) => ({ value: s, label: s })),
          ]}
        />
      ) : null}
    </>
  );

  const toggles = (
    <>
      <Toggle
        active={active.homeVisit}
        onClick={() => setParam("homeVisit", active.homeVisit ? null : "1")}
        label="Home visit"
      />
      <Toggle
        active={active.rateCard}
        onClick={() => setParam("rateCard", active.rateCard ? null : "1")}
        label="Has rate card"
      />
    </>
  );

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 mb-8 border-y border-ink-900/12 bg-white/92 px-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3 py-3">
          <p className="shrink-0 text-sm text-ink-500" aria-live="polite">
            <span className="font-display text-lg text-ink-900">{total}</span>{" "}
            {total === 1 ? "shop" : "shops"}
          </p>

          <div className="hidden flex-1 items-center gap-2 lg:flex">
            {selects}
            {toggles}
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="ml-1 inline-flex items-center gap-1 text-xs text-ink-500 underline underline-offset-2 hover:text-coral-500"
              >
                <X aria-hidden className="size-3" />
                Clear
              </button>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="sr-only" htmlFor="sort">
              Sort by
            </label>
            <select
              id="sort"
              value={active.sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="h-9 rounded-full border border-ink-200 bg-white px-3 text-sm text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Gallery vs index. The index is the view that makes this feel
                like a guide rather than a search results page. */}
            <div
              role="group"
              aria-label="View"
              className="flex overflow-hidden rounded-full border border-ink-200"
            >
              <ViewButton
                active={active.view === "list"}
                onClick={() => setParam("view", null)}
                label="List view"
              >
                <Rows3 aria-hidden className="size-4" />
              </ViewButton>
              <ViewButton
                active={active.view === "gallery"}
                onClick={() => setParam("view", "gallery")}
                label="Gallery view"
              >
                <LayoutGrid aria-hidden className="size-4" />
              </ViewButton>
              <ViewButton
                active={active.view === "index"}
                onClick={() => setParam("view", "index")}
                label="Index view"
              >
                <List aria-hidden className="size-4" />
              </ViewButton>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
            >
              <SlidersHorizontal aria-hidden />
              Filters
              {activeCount ? (
                <span className="ml-1 grid size-5 place-items-center rounded-full bg-ink-900 text-[11px] text-white">
                  {activeCount}
                </span>
              ) : null}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink-950/50"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-ground p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close filters"
                className="grid size-9 place-items-center rounded-full hover:bg-ink-50"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>

            <div className="grid gap-3">{selects}</div>
            <div className="mt-4 flex flex-wrap gap-2">{toggles}</div>

            {activeCount > 0 ? (
              <Button variant="ghost" size="sm" onClick={clearAll} className="mt-4 w-full">
                <X aria-hidden /> Clear filters
              </Button>
            ) : null}

            <Button
              variant="primary"
              className="mt-5 w-full"
              onClick={() => setMobileOpen(false)}
            >
              Show {total} {total === 1 ? "shop" : "shops"}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <>
      <label className="sr-only" htmlFor={`f-${label}`}>
        {label}
      </label>
      <select
        id={`f-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 max-w-[12rem] rounded-full border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          value
            ? "border-ink-900 bg-ink-900 text-white"
            : "border-ink-200 bg-white text-ink-800"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-ink-900">
            {o.label}
          </option>
        ))}
      </select>
    </>
  );
}

function Toggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
        active
          ? "border-ink-900 bg-ink-900 text-white"
          : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
      )}
    >
      {label}
    </button>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-9 place-items-center transition-colors",
        active ? "bg-ink-900 text-white" : "bg-white text-ink-500 hover:text-ink-900"
      )}
    >
      {children}
    </button>
  );
}
