import { Plus } from "lucide-react";

import { Inline } from "@/components/blog/inline";
import type { Faq } from "@/lib/blog";

/**
 * Visible FAQ, built on <details> so it works without JavaScript and every
 * answer is in the server-rendered HTML whether or not it is expanded. The
 * FAQPage markup is generated from the same array, so what a crawler is told
 * and what a reader sees cannot drift apart.
 */
export function FaqList({ faq }: { faq: Faq[] }) {
  return (
    <div className="mt-6 divide-y divide-ink-100 overflow-hidden rounded-3xl bg-white ring-1 ring-ink-100">
      {faq.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-base font-bold leading-snug text-ink-950 transition-colors hover:bg-ink-50 sm:px-6 [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus
              aria-hidden
              className="size-5 shrink-0 text-ink-400 transition-transform duration-300 group-open:rotate-45"
            />
          </summary>
          <p className="px-5 pb-5 text-[15px] leading-7 text-ink-600 sm:px-6">
            <Inline text={item.a} />
          </p>
        </details>
      ))}
    </div>
  );
}
