"use client";

import { useRef, useTransition } from "react";

import { cn } from "@/lib/utils";

/**
 * Status dropdown that submits on change. Wrapped in a transition so the row
 * doesn't flash while the server action revalidates.
 */
export function StatusSelect({
  id,
  value,
  options,
  action,
}: {
  id: string;
  value: string;
  options: readonly { value: string; label: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(fd) => startTransition(() => action(fd).then(() => undefined))}
    >
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`status-${id}`}>
        Status
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={value}
        disabled={pending}
        onChange={() => formRef.current?.requestSubmit()}
        className={cn(
          "rounded-full border px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500",
          pending && "opacity-50",
          STATUS_STYLES[value] ?? "border-paper-400 bg-paper-50 text-ink-700"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "border-brass-400/50 bg-brass-200/40 text-brass-800",
  confirmed: "border-emerald-700/25 bg-emerald-700/10 text-emerald-900",
  visited: "border-emerald-700/40 bg-emerald-700/20 text-emerald-900",
  approved: "border-emerald-700/40 bg-emerald-700/20 text-emerald-900",
  added: "border-emerald-700/40 bg-emerald-700/20 text-emerald-900",
  contacted: "border-ink-300 bg-paper-200 text-ink-700",
  reviewed: "border-ink-300 bg-paper-200 text-ink-700",
  no_show: "border-terra-400/50 bg-terra-300/25 text-terra-600",
  cancelled: "border-ink-300 bg-paper-200 text-ink-400",
  rejected: "border-ink-300 bg-paper-200 text-ink-400",
};
