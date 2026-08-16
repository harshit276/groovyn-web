import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { updateBookingStatus } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/status-select";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { storeHref } from "@/lib/queries";

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "visited", label: "Visited" },
  { value: "no_show", label: "No show" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export default async function LeadsPage({
  searchParams,
}: PageProps<"/admin/leads">) {
  const sp = await searchParams;
  const filter = Array.isArray(sp.status) ? sp.status[0] : sp.status;

  const bookings = await db.visitBooking.findMany({
    where: filter && filter !== "all" ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      store: {
        select: {
          name: true,
          slug: true,
          category: true,
          phone: true,
          city: { select: { slug: true } },
        },
      },
    },
  });

  return (
    <div>
      <nav aria-label="Filter by status" className="mb-5 flex flex-wrap gap-2">
        {[{ value: "all", label: "All" }, ...STATUSES].map((s) => {
          const isActive = (filter ?? "all") === s.value;
          return (
            <Link
              key={s.value}
              href={s.value === "all" ? "/admin/leads" : `/admin/leads?status=${s.value}`}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                isActive
                  ? "border-ink-900 bg-ink-900 text-paper-50"
                  : "border-paper-400 bg-paper-50 text-ink-700 hover:border-ink-400"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      {bookings.length === 0 ? (
        <p className="rounded-card border border-dashed border-paper-400 p-8 text-center text-ink-500">
          No leads{filter && filter !== "all" ? ` with status "${filter}"` : ""} yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-paper-300 bg-paper-50">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-paper-300 text-left text-xs uppercase tracking-wider text-ink-400">
                <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                <th scope="col" className="px-4 py-3 font-medium">Shop</th>
                <th scope="col" className="px-4 py-3 font-medium">Wants</th>
                <th scope="col" className="px-4 py-3 font-medium">When</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-paper-200 align-top last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{b.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={`tel:${b.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-brass-700"
                      >
                        <Phone aria-hidden className="size-3" />
                        {b.phone}
                      </a>
                      <a
                        href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#128C7E] hover:underline"
                      >
                        <MessageCircle aria-hidden className="size-3" />
                        WhatsApp
                      </a>
                    </div>
                    {b.source ? (
                      <p className="mt-1 text-[11px] text-ink-400">via {b.source}</p>
                    ) : null}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={storeHref(b.store.city.slug, b.store.category, b.store.slug)}
                      className="text-ink-900 hover:text-brass-700"
                    >
                      {b.store.name}
                    </Link>
                    {b.store.phone ? (
                      <p className="mt-1 text-xs text-ink-500">{b.store.phone}</p>
                    ) : null}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={b.type === "HOME" ? "verified" : "outline"}>
                      {b.type === "HOME" ? "Home visit" : "Store visit"}
                    </Badge>
                    {b.serviceWanted ? (
                      <p className="mt-1.5 text-ink-700">{b.serviceWanted}</p>
                    ) : null}
                    {b.notes ? (
                      <p className="mt-1 text-xs text-ink-500">{b.notes}</p>
                    ) : null}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-ink-700">
                    {b.preferredDate
                      ? b.preferredDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "Any"}
                    {b.preferredSlot ? (
                      <span className="block text-xs text-ink-400">
                        {b.preferredSlot}
                      </span>
                    ) : null}
                    <span className="mt-1 block text-[11px] text-ink-400">
                      req.{" "}
                      {b.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <StatusSelect
                      id={b.id}
                      value={b.status}
                      options={STATUSES}
                      action={updateBookingStatus}
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
