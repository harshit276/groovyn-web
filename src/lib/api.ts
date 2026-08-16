import { NextResponse } from "next/server";
import type { ZodType } from "zod";

/**
 * Helpers for the /api/v1 surface.
 *
 * This layer exists so the future React Native app has a stable contract that
 * doesn't depend on how the web pages happen to render. Version the path, not
 * the payload — /api/v2 when something breaks.
 */

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { "Cache-Control": "no-store", ...init?.headers },
  });
}

/** Read-only responses that are safe to cache at the edge for a short while. */
export function okCached<T>(data: T, seconds = 300) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${
        seconds * 2
      }`,
    },
  });
}

export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json({ error: message, details: extra }, { status });
}

/** Parse a JSON body against a schema, returning a typed result or a 400. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { data: null, error: fail("Expected a JSON body.") };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      data: null,
      error: fail("Some details are missing or invalid.", 422, {
        issues: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      }),
    };
  }

  return { data: result.data, error: null };
}

/**
 * Very small in-memory rate limit for the write endpoints.
 *
 * This is per-instance and resets on deploy, so it only stops casual abuse and
 * accidental double-submits. Before opening the API to the mobile app, move
 * this to a shared store (Upstash Redis / Vercel KV).
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return `${scope}:${ip}`;
}
