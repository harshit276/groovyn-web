"use client";

import * as React from "react";

import type { MeasurementProfile } from "./measurements";

/**
 * The measurement profile lives in the browser.
 *
 * There is no login on this site, and body measurements are about as personal
 * as data gets — so the canonical copy stays on the person's own device. A
 * snapshot only ever leaves it when they attach it to a booking, and then it
 * goes to that one shop.
 *
 * Same pattern as save-button: localStorage is an external store, so it is
 * subscribed to rather than mirrored into React state.
 */

const KEY = "groovyn:measurements";
const CHANGED = "groovyn:measurements-changed";

export function readProfile(): MeasurementProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MeasurementProfile;
    // A profile written by an older shape is discarded rather than migrated —
    // stale measurements are worse than none.
    if (parsed?.version !== 2 || typeof parsed.values !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeProfile(profile: MeasurementProfile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Private mode or a full quota — the session still works, it just will not
    // be remembered. Never break the flow over it.
  }
  window.dispatchEvent(new Event(CHANGED));
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  window.dispatchEvent(new Event(CHANGED));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

/** Cached so getSnapshot stays referentially stable between real changes. */
let cachedRaw: string | null = null;
let cachedValue: MeasurementProfile | null = null;

function getSnapshot(): MeasurementProfile | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = readProfile();
  }
  return cachedValue;
}

export function useMeasurementProfile(): MeasurementProfile | null {
  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    // Server render: nobody has a profile, so the first paint matches.
    () => null
  );
}
