import { CalendarCheck, ChevronDown } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ServiceDTO } from "@/lib/types";
import { formatPriceRange } from "@/lib/utils";

/**
 * What shops like this one usually charge, for a shop that has not shared its
 * own prices.
 *
 * It replaces an empty "no price list" box, because a visitor still wants a
 * sense of the money. The numbers are our own city-wide ranges, so the block
 * says so in the first sentence, and never draws a rate card's green badge. A
 * premium or designer shop will sit above these ranges, and the block says
 * that too.
 */

/** The ranges are per piece, except fabric (per metre) and hire (per rental). */
const UNIT: Record<string, string> = {
  tailors: "per piece",
  boutiques: "per piece",
  "fabric-shops": "per metre",
  "rental-shops": "per rental",
};

/** Words in a service name that identify it, e.g. "Blouse Stitching" → "blouse". */
function keywords(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/\b(stitching|on rent|fabric|and|wear|rental)\b/g, " ")
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3);
}

/** Services that match what this shop says it does come first. */
function byRelevance(services: ServiceDTO[], hints: string): ServiceDTO[] {
  const text = hints.toLowerCase();
  const score = (s: ServiceDTO) => (keywords(s.name).some((k) => text.includes(k)) ? 1 : 0);
  return [...services].sort((a, b) => score(b) - score(a));
}

const INITIAL = 6;

export function TypicalPrices({
  services,
  category,
  categoryName,
  storeName,
  cityName,
  citySlug,
  hints,
  hasOwnPrices,
}: {
  services: ServiceDTO[];
  category: string;
  categoryName: string;
  storeName: string;
  cityName: string;
  citySlug: string;
  /** Specialities and description, used to put the most relevant services first. */
  hints: string;
  /** The shop has some prices of its own above this block. */
  hasOwnPrices: boolean;
}) {
  const priced = services.filter((s) => s.benchmarkMin != null && s.benchmarkMax != null);
  if (!priced.length) return null;

  const ordered = byRelevance(priced, hints);
  const first = ordered.slice(0, INITIAL);
  const rest = ordered.slice(INITIAL);
  const unit = UNIT[category] ?? "per piece";

  const row = (s: ServiceDTO) => (
    <li
      key={s.slug}
      className="flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-6"
    >
      <span className="min-w-0 text-ink-800">{s.name}</span>
      <span className="shrink-0 text-right">
        <span className="font-display text-base font-semibold text-ink-900 tabular-nums">
          {formatPriceRange(s.benchmarkMin, s.benchmarkMax)}
        </span>
        <span className="ml-1.5 text-xs text-ink-400">{unit}</span>
      </span>
    </li>
  );

  return (
    <section
      id="typical-prices"
      aria-labelledby="typical-prices-title"
      className="overflow-hidden rounded-card border border-ink-100 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-5 sm:px-6">
        <div>
          <h2 id="typical-prices-title" className="font-display text-2xl text-ink-900">
            Typical prices in {cityName}
          </h2>
          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-400">
            {priced.length} {priced.length === 1 ? "service" : "services"}
          </p>
        </div>
        <Badge variant="estimate">Typical range</Badge>
      </div>

      <p className="border-b border-ink-100 px-5 py-4 text-sm leading-relaxed text-ink-600 sm:px-6">
        {hasOwnPrices
          ? `Beyond the prices above, here is what ${categoryName.toLowerCase()} in ${cityName} usually charge.`
          : `${storeName} has not shared a price list with us yet, so here is what ${categoryName.toLowerCase()} in ${cityName} usually charge.`}{" "}
        These ranges come from our own research and are not {storeName}’s prices,
        which can be higher or lower. Premium and designer shops often charge
        more.
      </p>

      <ul className="divide-y divide-ink-100">{first.map(row)}</ul>

      {rest.length ? (
        <details className="group border-t border-ink-100">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1.5 px-5 py-3 text-sm font-medium text-brand-600 transition-colors hover:bg-ground [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show {rest.length} more</span>
            <span className="hidden group-open:inline">Show fewer</span>
            <ChevronDown
              aria-hidden
              className="size-4 transition-transform group-open:rotate-180"
            />
          </summary>
          <ul className="divide-y divide-ink-100 border-t border-ink-100">
            {rest.map(row)}
          </ul>
        </details>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-ink-100 bg-ground px-5 py-4 sm:px-6">
        <p className="text-sm text-ink-600">
          Want {storeName}’s own price? Ask for a quote on your exact garment.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href="#book"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
          >
            <CalendarCheck aria-hidden className="size-4" />
            Book a free visit
          </a>
          <Link
            href={`/${citySlug}/prices`}
            className="text-sm font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            All {cityName} prices
          </Link>
        </div>
      </div>
    </section>
  );
}
