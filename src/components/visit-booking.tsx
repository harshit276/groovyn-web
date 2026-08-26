"use client";

import { CalendarCheck, Check, Home, Store } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Free, non-transactional visit booking.
 *
 * There is deliberately no payment here. The point of this flow in v1 is to
 * generate a provable footfall record per shop — that dataset is what makes the
 * monetisation conversation possible later. Instrument it, don't charge for it.
 */
export function VisitBooking({
  storeId,
  storeName,
  offersHomeVisit,
  homeVisitFee,
  source,
}: {
  storeId: string;
  storeName: string;
  offersHomeVisit: boolean;
  homeVisitFee: number | null;
  source: string;
}) {
  const [type, setType] = React.useState<"STORE" | "HOME">("STORE");
  const [state, setState] = React.useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          type,
          name: form.get("name"),
          phone: form.get("phone"),
          preferredDate: form.get("preferredDate") || null,
          preferredSlot: form.get("preferredSlot") || null,
          serviceWanted: form.get("serviceWanted") || null,
          notes: form.get("notes") || null,
          source,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not send your request.");
      }
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-card border border-emerald-700/25 bg-emerald-700/5 p-6 text-center">
        <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-emerald-700/15">
          <Check aria-hidden className="size-5 text-emerald-800" />
        </div>
        <h3 className="text-lg text-ink-900">Request sent</h3>
        <p className="mt-1.5 text-sm text-ink-600">
          {storeName} will get in touch to confirm. We&apos;ve not shared your
          number with anyone else.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-card border border-ink-100 bg-white p-5"
    >
      <h3 className="flex items-center gap-2 text-lg text-ink-900">
        <CalendarCheck aria-hidden className="size-4 text-brand-500" />
        Book a visit
      </h3>
      <p className="mt-1 text-sm text-ink-500">
        Free. No payment, no obligation.
      </p>

      {offersHomeVisit ? (
        <div
          role="radiogroup"
          aria-label="Visit type"
          className="mt-4 grid grid-cols-2 gap-2"
        >
          {(
            [
              { value: "STORE", label: "At the store", icon: Store },
              { value: "HOME", label: "At my home", icon: Home },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={type === opt.value}
              onClick={() => setType(opt.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                type === opt.value
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
              )}
            >
              <opt.icon aria-hidden className="size-4" />
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}

      {type === "HOME" && homeVisitFee ? (
        <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
          This shop charges ₹{homeVisitFee.toLocaleString("en-IN")} for a home
          measurement visit, usually adjusted against your final bill.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        <Field label="Your name" htmlFor="name">
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className={inputClass}
          />
        </Field>

        <Field label="Phone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile"
            pattern="[0-9+\s-]{10,15}"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Preferred date" htmlFor="preferredDate">
            <input
              id="preferredDate"
              name="preferredDate"
              type="date"
              className={inputClass}
            />
          </Field>
          <Field label="Time" htmlFor="preferredSlot">
            <select id="preferredSlot" name="preferredSlot" className={inputClass}>
              <option value="">Any time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </Field>
        </div>

        <Field label="What do you need?" htmlFor="serviceWanted">
          <input
            id="serviceWanted"
            name="serviceWanted"
            placeholder="e.g. 3-piece suit for a wedding"
            className={inputClass}
          />
        </Field>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-coral-500">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="brand"
        className="mt-4 w-full"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending…" : "Request a visit"}
      </Button>

      <p className="mt-3 text-center text-xs text-ink-400">
        We pass your details to this shop only. We never sell your number.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium text-ink-600"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
