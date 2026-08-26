import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-ink-100 bg-ink-50 text-ink-700",
        outline: "border-ink-200 bg-white text-ink-600",
        verified: "border-brand-100 bg-brand-50 text-brand-700",
        rateCard: "border-emerald-200 bg-emerald-50 text-emerald-800",
        estimate: "border-ink-200 bg-ink-50 text-ink-500",
        dark: "border-transparent bg-ink-900 text-white",
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
