"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  CalendarCheck,
  Check,
  Gift,
  Home,
  Ruler,
  PhoneOff,
  ShieldCheck,
  Store,
  Sunrise,
  Sun,
  Sunset,
  Ticket,
} from "lucide-react";
import * as React from "react";

import { useMeasurementProfile } from "@/lib/measurement-store";
import { toDisplay } from "@/lib/measurements";
import { cn } from "@/lib/utils";

/**
 * The counter inside the shop.
 *
 * Free and non-transactional by design. The point of this flow in v1 is to
 * generate a provable footfall record per shop — that dataset is what makes
 * the monetisation conversation possible later. Instrument it, don't charge.
 *
 * Shaped as three short steps rather than one long form: a fourteen-field
 * wall is where a phone visitor quits. Each step asks one thing, and the last
 * one — the only step wanting personal details — is reached by people who
 * have already invested two taps.
 *
 * On success it issues a visit token, because that is what a real counter
 * hands you, and it gives the visitor something concrete to screenshot and
 * show at the shop.
 */

type Slot = "morning" | "afternoon" | "evening";

const SLOTS: { value: Slot; label: string; hint: string; icon: typeof Sun }[] = [
  { value: "morning", label: "Morning", hint: "10am – 1pm", icon: Sunrise },
  { value: "afternoon", label: "Afternoon", hint: "1pm – 5pm", icon: Sun },
  { value: "evening", label: "Evening", hint: "5pm – 9pm", icon: Sunset },
];

/** Local YYYY-MM-DD — toISOString() would shift the date across the IST offset. */
function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function VisitBooking({
  storeId,
  storeName,
  offersHomeVisit,
  homeVisitFee,
  source,
  suggestions = [],
  visitOffer = null,
  visitOfferTerms = null,
}: {
  storeId: string;
  storeName: string;
  offersHomeVisit: boolean;
  homeVisitFee: number | null;
  source: string;
  /** Service labels from the shop's own rate card, used as one-tap chips. */
  suggestions?: string[];
  /** The shop's own offer for booked visits. Never generated. */
  visitOffer?: string | null;
  visitOfferTerms?: string | null;
}) {
  const [step, setStep] = React.useState(0);
  const [type, setType] = React.useState<"STORE" | "HOME">("STORE");
  const [service, setService] = React.useState("");
  const [date, setDate] = React.useState("");
  const [slot, setSlot] = React.useState<Slot | "">("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Opt-in, and only offered when there is something to attach.
  const profile = useMeasurementProfile();
  const [attachMeasurements, setAttachMeasurements] = React.useState(true);
  const canAttach = !!profile && Object.keys(profile.values).length > 0;

  const [state, setState] = React.useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [error, setError] = React.useState<string | null>(null);
  const [token, setToken] = React.useState("");

  const phoneOk = /^[0-9+\s-]{10,15}$/.test(phone.trim());
  const canSubmit = name.trim().length > 1 && phoneOk;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || state === "sending") return;

    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          type,
          name: name.trim(),
          phone: phone.trim(),
          preferredDate: date || null,
          preferredSlot: slot || null,
          serviceWanted: service.trim() || null,
          notes: notes.trim() || null,
          source,
          measurements:
            canAttach && attachMeasurements && profile
              ? { unit: profile.unit, values: profile.values }
              : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not send your request.");
      }

      // Display-only reference so the visitor has something to quote at the
      // counter. The booking's real identity is the server's own record.
      setToken(
        `GV-${String(Date.now()).slice(-5)}${String(
          Math.floor(Math.random() * 9)
        )}`
      );
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  /* ── Issued token ─────────────────────────────────────────── */
  if (state === "done") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950 p-6 text-center">
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(25,118,210,0.55), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-emerald-500/15">
            <Check aria-hidden className="size-6 text-emerald-400" />
          </div>

          <h3 className="font-display text-lg font-bold text-white">
            Visit requested
          </h3>
          <p className="mt-1.5 text-sm text-white/50">
            {storeName} will call to confirm.
          </p>

          {/* Perforated token stub. */}
          <div className="relative mt-5 rounded-xl border border-dashed border-white/20 bg-white/5 px-5 py-4">
            <span className="absolute -left-[7px] top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-ink-950" />
            <span className="absolute -right-[7px] top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-ink-950" />

            <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-300">
              <Ticket aria-hidden className="size-3" />
              Visit token
            </p>
            <p className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-white">
              {token}
            </p>
            {date || slot ? (
              <p className="mt-1 text-xs text-white/45">
                {date ? new Date(date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                }) : "Any day"}
                {slot ? ` · ${slot}` : ""}
              </p>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-white/35">
            We&apos;ve passed your number to this shop only. We never sell it.
          </p>
        </div>
      </div>
    );
  }

  const steps = ["What", "When", "You"];

  return (
    <form
      onSubmit={submit}
      className="relative overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-3d"
    >
      {/* Header reads as a counter sign. */}
      <div className="relative bg-ink-950 px-5 py-4">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 0%, rgba(25,118,210,0.6), transparent 55%)",
          }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-white">
              <CalendarCheck aria-hidden className="size-4 text-brand-300" />
              Book a visit
            </h3>
            <p className="mt-0.5 text-xs text-white/45">
              Free. No payment, no obligation.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
            {step + 1}/3
          </span>
        </div>

        {/* Progress rail */}
        <ol className="relative mt-4 flex gap-1.5">
          {steps.map((label, i) => (
            <li key={label} className="flex-1">
              <span
                className={cn(
                  "block h-1 rounded-full transition-colors duration-300",
                  i <= step ? "bg-brand-500" : "bg-white/12"
                )}
              />
              <span
                className={cn(
                  "mt-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] transition-colors",
                  i <= step ? "text-white/70" : "text-white/25"
                )}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* The reason to book, before any field is asked for.
          When a shop has given us an offer we lead with it; otherwise we lead
          with what is true for every shop — booking here costs nothing. We do
          not invent a discount, because the visitor quotes it at the counter
          and the shop has to honour it. */}
      {visitOffer ? (
        <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/60 px-5 py-3.5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
            <Gift aria-hidden className="size-3.5" />
            Offer on booked visits
          </p>
          <p className="mt-1 font-display text-sm font-bold leading-snug text-amber-950">
            {visitOffer}
          </p>
          {visitOfferTerms ? (
            <p className="mt-1 text-[11px] leading-relaxed text-amber-700/80">
              {visitOfferTerms}
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="grid grid-cols-3 divide-x divide-ink-100 border-b border-ink-100 bg-ink-50/60">
          {[
            { icon: BadgeIndianRupee, label: "Free to book" },
            { icon: ShieldCheck, label: "No obligation" },
            { icon: PhoneOff, label: "No spam calls" },
          ].map((v) => (
            <li
              key={v.label}
              className="flex flex-col items-center gap-1 px-2 py-3 text-center"
            >
              <v.icon aria-hidden className="size-4 text-brand-600" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-600">
                {v.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="p-5">
        {/* ── Step 1 — what ─────────────────────────────────── */}
        {step === 0 ? (
          <div className="space-y-4">
            {offersHomeVisit ? (
              <div>
                <Label>Where</Label>
                <div role="radiogroup" aria-label="Visit type" className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "STORE", label: "At the shop", icon: Store },
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
                        "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                        type === opt.value
                          ? "border-ink-900 bg-ink-900 text-white shadow-md"
                          : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
                      )}
                    >
                      <opt.icon aria-hidden className="size-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {type === "HOME" && homeVisitFee ? (
              <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-700">
                This shop charges ₹{homeVisitFee.toLocaleString("en-IN")} for a
                home measurement visit, usually adjusted against your final bill.
              </p>
            ) : null}

            <div>
              <Label htmlFor="serviceWanted">What do you need?</Label>
              {suggestions.length ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {suggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setService(s)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        service === s
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-ink-200 text-ink-600 hover:border-ink-400"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                id="serviceWanted"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g. 3-piece suit for a wedding"
                className={inputClass}
              />
            </div>
          </div>
        ) : null}

        {/* ── Step 2 — when ─────────────────────────────────── */}
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <Label>Which day?</Label>
              <div className="mb-2 flex gap-2">
                {[
                  { label: "Today", value: isoDate(0) },
                  { label: "Tomorrow", value: isoDate(1) },
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => setDate(date === d.value ? "" : d.value)}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      date === d.value
                        ? "border-ink-900 bg-ink-900 text-white"
                        : "border-ink-200 text-ink-700 hover:border-ink-400"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                aria-label="Preferred date"
                value={date}
                min={isoDate(0)}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <Label>What time?</Label>
              <div role="radiogroup" aria-label="Preferred time" className="grid gap-2">
                {SLOTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={slot === s.value}
                    onClick={() => setSlot(slot === s.value ? "" : s.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
                      slot === s.value
                        ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                        : "border-ink-200 hover:border-ink-400"
                    )}
                  >
                    <s.icon
                      aria-hidden
                      className={cn(
                        "size-4 shrink-0",
                        slot === s.value ? "text-brand-600" : "text-ink-400"
                      )}
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-ink-900">
                        {s.label}
                      </span>
                      <span className="block text-xs text-ink-400">{s.hint}</span>
                    </span>
                    {slot === s.value ? (
                      <Check aria-hidden className="size-4 text-brand-600" />
                    ) : null}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-400">
                Optional — leave blank and the shop will suggest a time.
              </p>
            </div>
          </div>
        ) : null}

        {/* ── Step 3 — who ──────────────────────────────────── */}
        {step === 2 ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Your name</Label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit mobile"
                aria-invalid={phone.length > 0 && !phoneOk}
                className={cn(
                  inputClass,
                  phone.length > 0 && !phoneOk && "border-coral-500"
                )}
              />
              {phone.length > 0 && !phoneOk ? (
                <p className="mt-1 text-xs text-coral-500">
                  Enter a valid 10-digit mobile number.
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="notes">Anything else? (optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={cn(inputClass, "resize-none")}
              />
            </div>

            {canAttach && profile ? (
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
                  attachMeasurements
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-200"
                )}
              >
                <input
                  type="checkbox"
                  checked={attachMeasurements}
                  onChange={(e) => setAttachMeasurements(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-brand-500"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                    <Ruler aria-hidden className="size-3.5 text-brand-600" />
                    Send my measurements
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                    {[
                      profile.values.chest
                        ? `Chest ${toDisplay(profile.values.chest.cm, profile.unit)}`
                        : null,
                      profile.values.waist
                        ? `waist ${toDisplay(profile.values.waist.cm, profile.unit)}`
                        : null,
                      profile.values.hip
                        ? `hip ${toDisplay(profile.values.hip.cm, profile.unit)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    {profile.values.chest ? ` ${profile.unit}` : "Your saved profile"}
                    {" — "}
                    {profile.confirmedBy
                      ? `confirmed by ${profile.confirmedBy.storeName}.`
                      : "estimates, for the shop to confirm."}
                  </span>
                </span>
              </label>
            ) : null}

            {/* What they are about to send, in one line. */}
            <dl className="rounded-xl bg-ink-50 px-3.5 py-3 text-xs">
              <div className="flex justify-between gap-3 py-0.5">
                <dt className="text-ink-500">Visit</dt>
                <dd className="font-medium text-ink-900">
                  {type === "HOME" ? "At your home" : "At the shop"}
                </dd>
              </div>
              {service ? (
                <div className="flex justify-between gap-3 py-0.5">
                  <dt className="text-ink-500">For</dt>
                  <dd className="truncate pl-4 font-medium text-ink-900">{service}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 py-0.5">
                <dt className="text-ink-500">When</dt>
                <dd className="font-medium text-ink-900">
                  {date
                    ? new Date(date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Any day"}
                  {slot ? ` · ${slot}` : ""}
                </dd>
              </div>
            </dl>

            {error ? (
              <p role="alert" className="text-sm text-coral-500">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* ── Controls ──────────────────────────────────────── */}
        <div className="mt-5 flex gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-ink-400"
            >
              <ArrowLeft aria-hidden className="size-4" />
              Back
            </button>
          ) : null}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
            >
              Continue
              <ArrowRight aria-hidden className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit || state === "sending"}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-3d-brand transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            >
              {state === "sending" ? "Sending…" : "Request visit"}
            </button>
          )}
        </div>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-400">
          We pass your details to this shop only. We never sell your number.
        </p>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25";

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink-500"
    >
      {children}
    </label>
  );
}
