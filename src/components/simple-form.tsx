"use client";

import { Check } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

export type FormField = {
  name: string;
  label: string;
  type?: "text" | "tel" | "email" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  autoComplete?: string;
};

/**
 * Small shared form runner for the claim and suggest flows. Both post plain
 * JSON to /api/v1 and just need a success state — not worth a form library yet.
 */
export function SimpleForm({
  endpoint,
  fields,
  submitLabel,
  successTitle,
  successBody,
  hidden,
}: {
  endpoint: string;
  fields: FormField[];
  submitLabel: string;
  successTitle: string;
  successBody: string;
  hidden?: Record<string, string>;
}) {
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...hidden }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not submit. Please try again.");
      }
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-card border border-emerald-700/25 bg-emerald-700/5 p-8 text-center">
        <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-emerald-700/15">
          <Check aria-hidden className="size-5 text-emerald-800" />
        </div>
        <h2 className="text-xl text-ink-900">{successTitle}</h2>
        <p className="mx-auto mt-2 max-w-sm text-ink-600">{successBody}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-card border border-paper-300 bg-paper-50 p-6"
    >
      {fields.map((f) => (
        <div key={f.name}>
          <label
            htmlFor={f.name}
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            {f.label}
            {f.required ? (
              <span aria-hidden className="ml-0.5 text-terra-500">
                *
              </span>
            ) : null}
          </label>

          {f.type === "textarea" ? (
            <textarea
              id={f.name}
              name={f.name}
              required={f.required}
              rows={4}
              placeholder={f.placeholder}
              defaultValue={f.defaultValue}
              className={inputClass}
            />
          ) : f.type === "select" ? (
            <select
              id={f.name}
              name={f.name}
              required={f.required}
              defaultValue={f.defaultValue ?? ""}
              className={inputClass}
            >
              <option value="">Select…</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={f.name}
              name={f.name}
              type={f.type ?? "text"}
              required={f.required}
              placeholder={f.placeholder}
              defaultValue={f.defaultValue}
              autoComplete={f.autoComplete}
              className={inputClass}
            />
          )}
        </div>
      ))}

      {error ? (
        <p role="alert" className="text-sm text-terra-600">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="brass"
        className="w-full"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-paper-400 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500";
