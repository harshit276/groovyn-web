"use client";

import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  Info,
  Pencil,
  Ruler,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import * as React from "react";

import { BodyScanner } from "@/components/body-scanner";
import {
  clearProfile,
  useMeasurementProfile,
  writeProfile,
} from "@/lib/measurement-store";
import {
  labelFor,
  measurementsFor,
  seedFromBuild,
  toDisplay,
  fromDisplay,
  validateProfile,
  type MeasurementChart,
  type MeasurementKey,
  type MeasurementProfile,
  type MeasurementValue,
} from "@/lib/measurements";
import { cn } from "@/lib/utils";

type Step = "start" | "height" | "scan" | "review";

const SOURCE_LABEL: Record<string, { text: string; className: string }> = {
  scan: { text: "Scanned", className: "bg-brand-50 text-brand-700" },
  manual: { text: "Estimate", className: "bg-ink-100 text-ink-600" },
  tailor: { text: "Tailor confirmed", className: "bg-emerald-50 text-emerald-700" },
};

export function MeasurementFlow() {
  const saved = useMeasurementProfile();

  const [step, setStep] = React.useState<Step>("start");
  const [unit, setUnit] = React.useState<"cm" | "in">("cm");
  const [heightInput, setHeightInput] = React.useState("");
  const [build, setBuild] = React.useState<"slim" | "regular" | "broad">("regular");
  const [chart, setChart] = React.useState<MeasurementChart>("womens");
  const [draft, setDraft] = React.useState<
    Partial<Record<MeasurementKey, MeasurementValue>>
  >({});
  const [warning, setWarning] = React.useState<string | null>(null);

  const heightCm = Number(heightInput) > 0 ? fromDisplay(Number(heightInput), unit) : 0;
  const heightValid = heightCm >= 120 && heightCm <= 220;

  const issues = React.useMemo(() => validateProfile(draft), [draft]);

  function beginScan() {
    setWarning(null);
    setStep("scan");
  }

  function useEstimates() {
    setDraft(seedFromBuild(heightCm, build, chart));
    setWarning(
      "These are population averages for your height and build, not a measurement of you. Check each one against a tape before ordering."
    );
    setStep("review");
  }

  function onScanned(
    values: Partial<Record<MeasurementKey, MeasurementValue>>,
    scaleAgreementCm: number
  ) {
    setDraft(values);
    // The two captures disagreeing on stature means the person moved between
    // them, which skews every girth. Say so rather than quietly averaging.
    setWarning(
      scaleAgreementCm > 4
        ? "The two captures don't quite agree — you may have moved between them. Check the numbers carefully, or scan again."
        : null
    );
    setStep("review");
  }

  function save() {
    const profile: MeasurementProfile = {
      version: 2,
      updatedAt: new Date().toISOString(),
      unit,
      chart,
      values: draft,
    };
    writeProfile(profile);
    setStep("start");
  }

  function edit(key: MeasurementKey, displayValue: string) {
    const n = Number(displayValue);
    setDraft((prev) => {
      const next = { ...prev };
      if (!displayValue.trim() || !Number.isFinite(n) || n <= 0) {
        delete next[key];
        return next;
      }
      // Editing a number makes it the person's own, not the model's.
      next[key] = { cm: fromDisplay(n, unit), source: "manual" };
      return next;
    });
  }

  /* ── Saved profile ───────────────────────────────────────────── */
  if (step === "start" && saved) {
    const savedIssues = validateProfile(saved.values);
    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-950">
                Your measurement profile
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Saved on this device ·{" "}
                {new Date(saved.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(saved.values);
                  setUnit(saved.unit);
                  setChart(saved.chart);
                  setStep("review");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-950"
              >
                <Pencil aria-hidden className="size-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setHeightInput("");
                  setStep("height");
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink-950 px-4 py-2 text-sm font-bold text-white"
              >
                <Camera aria-hidden className="size-3.5" />
                Re-scan
              </button>
            </div>
          </div>

          {saved.confirmedBy ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <BadgeCheck aria-hidden className="size-3.5" />
              Confirmed by {saved.confirmedBy.storeName}
            </p>
          ) : (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
              <Info aria-hidden className="size-3.5" />
              Not yet confirmed by a tailor
            </p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink-100 pt-5 sm:grid-cols-3">
            {measurementsFor(saved.chart)
              .filter((m) => saved.values[m.key])
              .map((m) => {
              const v = saved.values[m.key]!;
              const tag = SOURCE_LABEL[v.source];
              return (
                <div key={m.key}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                    {labelFor(m, saved.chart)}
                  </dt>
                  <dd className="mt-0.5 flex items-baseline gap-2">
                    <span className="font-display text-lg font-extrabold text-ink-950">
                      {toDisplay(v.cm, saved.unit)}
                      <span className="ml-0.5 text-xs font-semibold text-ink-400">
                        {saved.unit}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        tag.className
                      )}
                    >
                      {tag.text}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>

          {savedIssues.length ? (
            <ul className="mt-5 space-y-1.5 rounded-2xl bg-amber-50 p-4">
              {savedIssues.map((i) => (
                <li
                  key={i.key}
                  className="flex items-start gap-2 text-xs leading-relaxed text-amber-800"
                >
                  <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  {i.message}
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            onClick={clearProfile}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-coral-500"
          >
            <Trash2 aria-hidden className="size-3.5" />
            Delete from this device
          </button>
        </div>
      </div>
    );
  }

  /* ── Intro ───────────────────────────────────────────────────── */
  if (step === "start") {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">
          <Ruler aria-hidden className="size-3.5" />
          Measurement profile
        </span>

        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          Get measured once. Use it at every shop.
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-ink-600">
          Two photos from your phone give a starting set of measurements. Attach
          them when you book a visit, and your tailor confirms them with a tape
          — from then on, every order starts from numbers you both trust.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Nothing is uploaded", d: "Frames are read on your phone and discarded." },
            { icon: Camera, t: "About a minute", d: "One photo facing the camera, one from the side." },
            { icon: BadgeCheck, t: "Confirmed by a tailor", d: "A starting point for the tape, not a replacement." },
          ].map((f) => (
            <li key={f.t} className="rounded-2xl bg-ink-50 p-4">
              <f.icon aria-hidden className="size-4 text-brand-600" />
              <p className="mt-2 font-display text-sm font-bold text-ink-950">{f.t}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{f.d}</p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setStep("height")}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-3d-brand transition-colors hover:bg-brand-600"
        >
          Start
          <ArrowRight aria-hidden className="size-4" />
        </button>
      </div>
    );
  }

  /* ── Height ──────────────────────────────────────────────────── */
  if (step === "height") {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-950">
          How tall are you?
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-600">
          This is the only reference the scan has for turning pixels into
          centimetres, so it matters more than anything else you enter. Measure
          it without shoes if you can — being 2 cm out moves every other number
          by about 1 cm.
        </p>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="height"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink-500"
            >
              Height
            </label>
            <input
              id="height"
              type="number"
              inputMode="decimal"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              placeholder={unit === "cm" ? "170" : "67"}
              className="w-36 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25"
            />
          </div>

          <div className="flex overflow-hidden rounded-xl ring-1 ring-ink-200">
            {(["cm", "in"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={cn(
                  "px-4 py-2.5 text-sm font-semibold transition-colors",
                  unit === u ? "bg-ink-950 text-white" : "bg-white text-ink-600"
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {heightInput && !heightValid ? (
          <p className="mt-2 text-xs text-coral-500">
            Enter a height between 120 and 220 cm.
          </p>
        ) : null}

        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">
            Measurement chart
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "womens", label: "Women's" },
                { value: "mens", label: "Men's" },
              ] as const
            ).map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setChart(c.value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  chart === c.value
                    ? "bg-ink-950 text-white"
                    : "bg-ink-50 text-ink-700 hover:bg-ink-100"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-400">
            Which block your tailor cuts to. The women&apos;s chart adds
            underbust and uses different proportions — pick either, and re-run
            it for the other if you need both.
          </p>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-500">
            Build
          </p>
          <div className="flex flex-wrap gap-2">
            {(["slim", "regular", "broad"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBuild(b)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                  build === b
                    ? "bg-ink-950 text-white"
                    : "bg-ink-50 text-ink-700 hover:bg-ink-100"
                )}
              >
                {b}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            Only used if you skip the scan.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={!heightValid}
            onClick={beginScan}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-3d-brand transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            <Camera aria-hidden className="size-4" />
            Scan with camera
          </button>
          <button
            type="button"
            disabled={!heightValid}
            onClick={useEstimates}
            className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-950 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Enter by hand instead
          </button>
        </div>
      </div>
    );
  }

  /* ── Scan ────────────────────────────────────────────────────── */
  if (step === "scan") {
    return (
      <BodyScanner
        heightCm={heightCm}
        onComplete={onScanned}
        onCancel={() => setStep("height")}
      />
    );
  }

  /* ── Review ──────────────────────────────────────────────────── */
  return (
    <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-950">
            Check every number
          </h2>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink-600">
            Anything you change becomes your own value. Your tailor will confirm
            these with a tape at the first visit.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-xl ring-1 ring-ink-200">
          {(["cm", "in"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                "px-3.5 py-2 text-sm font-semibold transition-colors",
                unit === u ? "bg-ink-950 text-white" : "bg-white text-ink-600"
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {warning ? (
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {warning}
        </p>
      ) : null}

      <div className="mt-6 space-y-5">
        {(["core", "upper", "lower"] as const).map((group) => (
          <div key={group}>
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              {group === "core" ? "Body" : group === "upper" ? "Upper body" : "Lower body"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {measurementsFor(chart)
                .filter((m) => m.group === group)
                .map((m) => {
                const v = draft[m.key];
                const issue = issues.find((i) => i.key === m.key);
                const tag = v ? SOURCE_LABEL[v.source] : null;
                return (
                  <div
                    key={m.key}
                    className={cn(
                      "rounded-2xl border p-3.5 transition-colors",
                      issue ? "border-amber-300 bg-amber-50/50" : "border-ink-100"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`m-${m.key}`}
                        className="text-sm font-semibold text-ink-900"
                      >
                        {labelFor(m, chart)}
                      </label>
                      {tag ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                            tag.className
                          )}
                        >
                          {tag.text}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        id={`m-${m.key}`}
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        value={v ? String(toDisplay(v.cm, unit)) : ""}
                        onChange={(e) => edit(m.key, e.target.value)}
                        placeholder="—"
                        className="w-24 rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm font-semibold text-ink-950 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25"
                      />
                      <span className="text-xs font-semibold text-ink-400">{unit}</span>
                    </div>

                    <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
                      {m.howTo}
                    </p>

                    {issue ? (
                      <p className="mt-1.5 text-[11px] font-medium text-amber-700">
                        {issue.message}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-3d-brand transition-colors hover:bg-brand-600"
        >
          <Check aria-hidden className="size-4" />
          Save to this device
        </button>
        <button
          type="button"
          onClick={() => setStep("height")}
          className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-ink-950"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
