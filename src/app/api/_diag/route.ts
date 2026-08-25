import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  getAllLocalityPaths,
  getCategoryCounts,
  getCities,
  getCity,
  getLocalities,
  getLocality,
  getServices,
  listStores,
} from "@/lib/queries";

// TEMPORARY diagnostic. Runs each query the category/locality pages use and
// reports which one throws. Delete once the 500 is understood.
export const dynamic = "force-dynamic";

async function attempt(name: string, fn: () => Promise<unknown>) {
  try {
    const value = await fn();
    const summary = Array.isArray(value)
      ? `array(${value.length})`
      : value === null
        ? "null"
        : typeof value === "object"
          ? `object(${Object.keys(value as object).slice(0, 6).join(",")})`
          : String(value);
    return { name, ok: true, summary };
  } catch (error) {
    return {
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      stack:
        error instanceof Error
          ? (error.stack ?? "").split("\n").slice(0, 4).join(" | ")
          : undefined,
    };
  }
}

export async function GET() {
  const results = [];
  results.push(await attempt("db.city.count", () => db.city.count()));
  results.push(await attempt("getCities", () => getCities()));
  results.push(await attempt("getCity(delhi)", () => getCity("delhi")));
  results.push(await attempt("getCategoryCounts(delhi)", () => getCategoryCounts("delhi")));
  results.push(await attempt("getLocalities(delhi,tailors)", () => getLocalities("delhi", "tailors")));
  results.push(await attempt("getServices(tailors)", () => getServices("tailors")));
  results.push(await attempt("listStores basic", () => listStores({ city: "delhi", category: "tailors" })));
  results.push(await attempt("listStores facets", () => listStores({ city: "delhi", category: "tailors", perPage: 48 })));
  results.push(await attempt("getLocality", () => getLocality("delhi", "lajpat-nagar")));
  results.push(await attempt("getAllLocalityPaths", () => getAllLocalityPaths()));

  return NextResponse.json(
    { failures: results.filter((r) => !r.ok), all: results },
    { headers: { "Cache-Control": "no-store" } }
  );
}
