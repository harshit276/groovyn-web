import { Phone } from "lucide-react";

import { updateSuggestionStatus } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/status-select";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { getCategory } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "added", label: "Added" },
  { value: "rejected", label: "Rejected" },
] as const;

export default async function SuggestionsPage() {
  const suggestions = await db.storeSuggestion.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <p className="mb-5 text-sm text-ink-500">
        Crowdsourced shops, plus any claim we couldn&apos;t match to an existing
        listing. Verify before adding — one wrong listing costs more trust than
        ten right ones earn.
      </p>

      {suggestions.length === 0 ? (
        <p className="rounded-card border border-dashed border-paper-400 p-8 text-center text-ink-500">
          No suggestions yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-paper-300 bg-paper-50">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-paper-300 text-left text-xs uppercase tracking-wider text-ink-400">
                <th scope="col" className="px-4 py-3 font-medium">Shop</th>
                <th scope="col" className="px-4 py-3 font-medium">Where</th>
                <th scope="col" className="px-4 py-3 font-medium">Notes</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.id} className="border-b border-paper-200 align-top last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{s.name}</p>
                    <Badge variant="outline" className="mt-1">
                      {getCategory(s.category)?.name ?? s.category}
                    </Badge>
                    {s.phone ? (
                      <a
                        href={`tel:${s.phone.replace(/\s/g, "")}`}
                        className="mt-1.5 flex items-center gap-1 text-xs text-ink-600 hover:text-brass-700"
                      >
                        <Phone aria-hidden className="size-3" />
                        {s.phone}
                      </a>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-ink-700">
                    {[s.locality, s.city].filter(Boolean).join(", ")}
                    {s.address ? (
                      <p className="mt-1 text-xs text-ink-500">{s.address}</p>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-ink-700">
                    {s.notes || <span className="text-ink-400">—</span>}
                    <span className="mt-1 block text-[11px] text-ink-400">
                      {s.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <StatusSelect
                      id={s.id}
                      value={s.status}
                      options={STATUSES}
                      action={updateSuggestionStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
