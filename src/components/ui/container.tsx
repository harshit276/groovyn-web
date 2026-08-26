import * as React from "react";

import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

/** Section heading with the brass hairline that runs through the whole site. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-2xl sm:text-3xl text-ink-900">{title}</h2>
          {description ? (
            <p className="mt-2 text-ink-600">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5 h-px w-full bg-ink-100" />
    </div>
  );
}
