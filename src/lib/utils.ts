import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ₹1,200 — Indian digit grouping, no decimals (nobody quotes paise for stitching). */
export function formatINR(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise);
}

/** "₹800 – ₹1,200", or "₹800" when both ends match, or "from ₹800". */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined
): string {
  if (min == null && max == null) return "On request";
  if (min != null && max == null) return `from ${formatINR(min)}`;
  if (min == null && max != null) return `up to ${formatINR(max)}`;
  if (min === max) return formatINR(min);
  return `${formatINR(min)} – ${formatINR(max)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Parse the JSON-encoded string[] columns we use for SQLite/Postgres portability. */
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
