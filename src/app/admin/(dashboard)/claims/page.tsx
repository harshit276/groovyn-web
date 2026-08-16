import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { updateClaimStatus } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/status-select";
import { db } from "@/lib/db";
import { storeHref } from "@/lib/queries";

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export default async function ClaimsPage() {
  const claims = await db.claim.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      store: {
        select: {
          name: true,
          slug: true,
          category: true,
          claimed: true,
          city: { select: { slug: true } },
        },
      },
    },
  });

  return (
    <div>
      <p className="mb-5 text-sm text-ink-500">
        Approving a claim marks the listing as owner-managed. Verify they
        actually run the shop first — a phone call to the number on the listing
        is usually enough.
      </p>

      {claims.length === 0 ? (
        <p className="rounded-card border border-dashed border-paper-400 p-8 text-center text-ink-500">
          No claims yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-paper-300 bg-paper-50">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-paper-300 text-left text-xs uppercase tracking-wider text-ink-400">
                <th scope="col" className="px-4 py-3 font-medium">Claimant</th>
                <th scope="col" className="px-4 py-3 font-medium">Shop</th>
                <th scope="col" className="px-4 py-3 font-medium">Message</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id} className="border-b border-paper-200 align-top last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{c.name}</p>
                    {c.role ? (
                      <p className="text-xs text-ink-400">{c.role}</p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${c.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-brass-700"
                      >
                        <Phone aria-hidden className="size-3" />
                        {c.phone}
                      </a>
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#128C7E] hover:underline"
                      >
                        <MessageCircle aria-hidden className="size-3" />
                        WhatsApp
                      </a>
                    </div>
                    {c.email ? (
                      <a
                        href={`mailto:${c.email}`}
                        className="mt-1 block text-xs text-ink-500 hover:text-brass-700"
                      >
                        {c.email}
                      </a>
                    ) : null}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={storeHref(c.store.city.slug, c.store.category, c.store.slug)}
                      className="text-ink-900 hover:text-brass-700"
                    >
                      {c.store.name}
                    </Link>
                    {c.store.claimed ? (
                      <p className="mt-1 text-xs text-emerald-800">
                        Already owner-managed
                      </p>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-ink-700">
                    {c.message || <span className="text-ink-400">—</span>}
                    <span className="mt-1 block text-[11px] text-ink-400">
                      {c.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <StatusSelect
                      id={c.id}
                      value={c.status}
                      options={STATUSES}
                      action={updateClaimStatus}
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
