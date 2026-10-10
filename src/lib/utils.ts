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

/**
 * The digits to put after wa.me/ for a number that can be on WhatsApp, or null.
 *
 * Only an Indian mobile qualifies (ten digits starting 6 to 9, with or without
 * +91 or a leading 0). The listings kept a shop's landline in the WhatsApp
 * field, and a WhatsApp button that opens "this number is not on WhatsApp" is
 * worse than no button.
 */
export function whatsappDigits(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/[^0-9]/g, "");
  const national =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  return /^[6-9]\d{9}$/.test(national) ? `91${national}` : null;
}

/** Whether there is any figure to show, so a card can skip "On request". */
export function hasPrice(
  min: number | null | undefined,
  max: number | null | undefined
): boolean {
  return min != null || max != null;
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
