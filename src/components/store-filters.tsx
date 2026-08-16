"use client";

import { SlidersHorizontal, X } from "lucide-react";
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
      params.delete("page");
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

  const panel = (
    <div className="space-y-5">
      <Field label="Locality">
        <select
          value={active.locality ?? ""}
          onChange={(e) => setParam("locality", e.target.value || null)}
          className={selectClass}
        >
          <option value="">All localities</option>
          {localities.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name} ({l.storeCount})
            </option>
          ))}
        </select>
      </Field>

      {services.length ? (
        <Field label="Service">
          <select
            value={active.service ?? ""}
            onChange={(e) => setParam("service", e.target.value || null)}
            className={selectClass}
          >
            <option value="">Any service</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {specialities.length ? (
        <Field label="Speciality">
          <div className="flex flex-wrap gap-1.5">
            {specialities.slice(0, 12).map((s) => {
              const isActive = active.speciality === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setParam("speciality", isActive ? null : s)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    isActive
                      ? "border-ink-900 bg-ink-900 text-paper-50"
                      : "border-paper-400 bg-paper-50 text-ink-700 hover:border-ink-400"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>
      ) : null}

      <Field label="Options">
        <div className="space-y-2">
          <Toggle
            checked={active.homeVisit}
            onChange={(v) => setParam("homeVisit", v ? "1" : null)}
            label="Offers home visit"
          />
          <Toggle
            checked={active.rateCard}
            onChange={(v) => setParam("rateCard", v ? "1" : null)}
            label="Has a verified rate card"
          />
        </div>
      </Field>

      {activeCount > 0 ? (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          <X aria-hidden /> Clear filters
        </Button>
      ) : null}
    </div>
  );

  return (
    <>
      {/* Sort + mobile trigger bar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500" aria-live="polite">
          <span className="font-medium text-ink-900">{total}</span>{" "}
          {total === 1 ? "store" : "stores"}
        </p>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            value={active.sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="h-9 rounded-full border border-paper-400 bg-paper-50 px-3 text-sm text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

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
              <span className="ml-1 grid size-5 place-items-center rounded-full bg-ink-900 text-[11px] text-paper-50">
                {activeCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">{panel}</div>

      {/* Mobile sheet */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink-950/50"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-paper-100 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close filters"
                className="grid size-9 place-items-center rounded-full hover:bg-paper-200"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
            {panel}
            <Button
              variant="primary"
              className="mt-5 w-full"
              onClick={() => setMobileOpen(false)}
            >
              Show {total} {total === 1 ? "store" : "stores"}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

const selectClass =
  "w-full rounded-lg border border-paper-400 bg-paper-50 px-3 py-2 text-sm text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-paper-400 accent-brass-500"
      />
      {label}
    </label>
  );
}
