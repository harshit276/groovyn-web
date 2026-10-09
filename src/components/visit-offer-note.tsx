import { Gift } from "lucide-react";

import type { StoreSummaryDTO } from "@/lib/types";

/**
 * Explains the gold "Visit offer" badge, and only when a shop on the page has
 * one. A visit offer is the shop's own deal for people who book through
 * Groovyn. We never write one ourselves, so while no shop in a list has given
 * us one this renders nothing rather than promise a discount nobody honours.
 */
export function VisitOfferNote({ stores }: { stores: StoreSummaryDTO[] }) {
  const count = stores.filter((s) => s.visitOffer).length;
  if (!count) return null;

  return (
    <p className="mb-6 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-200">
      <Gift aria-hidden className="mt-0.5 size-4 shrink-0 text-amber-700" />
      <span>
        {count === 1 ? "One shop here gives" : `${count} shops here give`} a deal to
        people who book a visit through Groovyn. Look for the gold{" "}
        <strong>Visit offer</strong> badge, and show your visit token at the
        counter.
      </span>
    </p>
  );
}
