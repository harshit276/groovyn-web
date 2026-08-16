import Link from "next/link";

import { db } from "@/lib/db";
import { storeHref } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Kept out of the component body — reading the clock during render isn't pure. */
async function countBookingsThisWeek() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return db.visitBooking.count({ where: { createdAt: { gte: since } } });
}

export default async function AdminOverviewPage() {
  const [
    pendingBookings,
    weekBookings,
    pendingClaims,
    pendingSuggestions,
    totalStores,
    withRateCard,
    recent,
  ] = await Promise.all([
    db.visitBooking.count({ where: { status: "pending" } }),
    countBookingsThisWeek(),
    db.claim.count({ where: { status: "pending" } }),
    db.storeSuggestion.count({ where: { status: "pending" } }),
    db.store.count(),
    db.store.count({ where: { rateCardVerified: true } }),
    db.visitBooking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        store: {
          select: {
            name: true,
            slug: true,
            category: true,
            city: { select: { slug: true } },
          },
        },
      },
    }),
  ]);

  const rateCardPct = totalStores
    ? Math.round((withRateCard / totalStores) * 100)
    : 0;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
          Needs action
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Unworked leads"
            value={pendingBookings}
            href="/admin/leads"
            urgent={pendingBookings > 0}
          />
          <Stat
            label="Pending claims"
            value={pendingClaims}
            href="/admin/claims"
            urgent={pendingClaims > 0}
          />
          <Stat
            label="New suggestions"
            value={pendingSuggestions}
            href="/admin/suggestions"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
          Health
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Bookings this week" value={weekBookings} />
          <Stat label="Listed shops" value={totalStores} />
          <Stat
            label="With a rate card"
            value={`${rateCardPct}%`}
            hint={`${withRateCard} of ${totalStores}`}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          Rate-card coverage is the number that matters most — it&apos;s the one
          thing no competitor publishes, and it&apos;s what the price-index
          pages are built from.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
          Latest bookings
        </h2>
        {recent.length ? (
          <ul className="divide-y divide-paper-300 overflow-hidden rounded-card border border-paper-300 bg-paper-50">
            {recent.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-ink-900">
                    {b.name}{" "}
                    <span className="text-ink-400">
                      · {b.type === "HOME" ? "home visit" : "store visit"}
                    </span>
                  </p>
                  <p className="text-sm text-ink-500">
                    <a href={`tel:${b.phone}`} className="hover:text-brass-700">
                      {b.phone}
                    </a>{" "}
                    ·{" "}
                    <Link
                      href={storeHref(b.store.city.slug, b.store.category, b.store.slug)}
                      className="hover:text-brass-700"
                    >
                      {b.store.name}
                    </Link>
                  </p>
                </div>
                <span className="text-xs text-ink-400">
                  {b.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-dashed border-paper-400 p-6 text-center text-ink-500">
            No bookings yet.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  hint,
  urgent,
}: {
  label: string;
  value: number | string;
  href?: string;
  hint?: string;
  urgent?: boolean;
}) {
  const body = (
    <div
      className={cn(
        "rounded-card border bg-paper-50 p-5 transition-colors",
        urgent
          ? "border-brass-400 bg-brass-200/25"
          : "border-paper-300",
        href && "hover:border-brass-400"
      )}
    >
      <p className="text-xs uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 font-display text-3xl text-ink-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
