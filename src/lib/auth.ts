import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single-owner admin auth.
 *
 * Deliberately minimal: one password from the environment, an HMAC-signed
 * cookie, no user table. This is right-sized for one operator working leads.
 * The moment a second person needs their own login — or shop owners get
 * dashboards — replace this with real auth (Clerk/Auth.js), don't extend it.
 *
 * Required env:
 *   ADMIN_PASSWORD        the login password
 *   ADMIN_SESSION_SECRET  long random string for signing (openssl rand -hex 32)
 */

const COOKIE = "groovyn_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h — short enough that a stolen cookie ages out

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short. Set a random 32+ char value."
    );
  }
  return value;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Constant-time compare so an attacker can't time their way to a valid token. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Hash both sides first so the compare is length-independent.
  const a = crypto.createHash("sha256").update(input).digest("hex");
  const b = crypto.createHash("sha256").update(expected).digest("hex");
  return safeEqual(a, b);
}

export async function createSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  const token = `${payload}.${sign(payload)}`;

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  try {
    if (!safeEqual(signature, sign(payload))) return false;
  } catch {
    return false;
  }

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

/** True when the admin can actually be used — surfaced on the login screen. */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 16
  );
}
