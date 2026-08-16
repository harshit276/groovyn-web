import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-paper-400 bg-paper-200 text-ink-700",
        outline: "border-ink-900/15 bg-transparent text-ink-600",
        verified: "border-brass-400/40 bg-brass-200/50 text-brass-800",
        rateCard: "border-emerald-700/25 bg-emerald-700/10 text-emerald-900",
        estimate: "border-ink-300 bg-paper-200 text-ink-500",
        dark: "border-transparent bg-ink-900 text-paper-100",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
