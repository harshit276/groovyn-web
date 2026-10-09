import { ArrowRight, Info, Lightbulb, Ruler, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Inline } from "@/components/blog/inline";
import { StoreCard } from "@/components/store-card";
import { headingId, type Block, type CalloutTone } from "@/lib/blog";
import { getLocalities, getServices, listStores } from "@/lib/queries";
import { cn, formatINR } from "@/lib/utils";

const CALLOUT: Record<
  CalloutTone,
  { wrap: string; title: string; icon: typeof Info }
> = {
  tip: {
    wrap: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-800",
    icon: Lightbulb,
  },
  warning: {
    wrap: "border-amber-300 bg-amber-50",
    title: "text-amber-900",
    icon: TriangleAlert,
  },
  note: {
    wrap: "border-brand-100 bg-brand-50",
    title: "text-brand-700",
    icon: Info,
  },
};

const CTA_COPY: Record<
  Extract<Block, { type: "cta" }>["kind"],
  { title: string; body: string; label: string; href: (city: string) => string }
> = {
  measure: {
    title: "Get measured in about a minute",
    body: "Two photos from your phone, spoken instructions, nothing uploaded. Your tailor confirms the numbers with a tape.",
    label: "Measure me, free",
    href: () => "/measurements",
  },
  tailors: {
    title: "Find a tailor near you",
    body: "Compare tailors by area, Google rating and starting price, then book a visit. Free, and no paid rankings.",
    label: "Browse tailors",
    href: (city) => `/${city}/tailors`,
  },
  rentals: {
    title: "See rental shops in Delhi",
    body: "Lehengas, sherwanis, gowns and suits on rent, with the shop's area, hours and contact details.",
    label: "Browse rental shops",
    href: (city) => `/${city}/rental-shops`,
  },
  fabric: {
    title: "Find fabric shops in Delhi",
    body: "Suiting, silks, shirting and lehenga fabric, listed by market so you can plan one trip.",
    label: "Browse fabric shops",
    href: (city) => `/${city}/fabric-shops`,
  },
};

/**
 * Renders a post's blocks.
 *
 * Async because the dynamic blocks query the directory. Each query is small and
 * the page is ISR'd, so this costs nothing per request.
 */
export async function PostBody({
  blocks,
  citySlug,
}: {
  blocks: Block[];
  citySlug: string;
}) {
  const out: ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const key = `${block.type}-${i}`;

    switch (block.type) {
      case "h2":
        out.push(
          <h2
            key={key}
            id={headingId(block.text)}
            className="mt-14 scroll-mt-28 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-950 first:mt-0 sm:text-3xl"
          >
            {block.text}
          </h2>
        );
        break;

      case "h3":
        out.push(
          <h3
            key={key}
            className="mt-9 font-display text-xl font-bold tracking-tight text-ink-950"
          >
            {block.text}
          </h3>
        );
        break;

      case "p":
        out.push(
          <p key={key} className="mt-4 text-base leading-8 text-ink-700 sm:text-[17px]">
            <Inline text={block.text} />
          </p>
        );
        break;

      case "ul":
        out.push(
          <ul
            key={key}
            className="mt-4 list-disc space-y-2.5 pl-6 text-base leading-8 text-ink-700 marker:text-brand-500 sm:text-[17px]"
          >
            {block.items.map((item, n) => (
              <li key={n} className="pl-1">
                <Inline text={item} />
              </li>
            ))}
          </ul>
        );
        break;

      case "ol":
        out.push(
          <ol
            key={key}
            className="mt-4 list-decimal space-y-2.5 pl-6 text-base leading-8 text-ink-700 marker:font-bold marker:text-brand-600 sm:text-[17px]"
          >
            {block.items.map((item, n) => (
              <li key={n} className="pl-1">
                <Inline text={item} />
              </li>
            ))}
          </ol>
        );
        break;

      case "callout": {
        const tone = CALLOUT[block.tone];
        const Icon = tone.icon;
        out.push(
          <aside
            key={key}
            className={cn("mt-7 rounded-2xl border p-5 sm:p-6", tone.wrap)}
          >
            <p
              className={cn(
                "flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-[0.1em]",
                tone.title
              )}
            >
              <Icon aria-hidden className="size-4" />
              {block.title}
            </p>
            <p className="mt-2 text-[15px] leading-7 text-ink-700">
              <Inline text={block.text} />
            </p>
          </aside>
        );
        break;
      }

      case "table":
        out.push(
          <figure key={key} className="mt-7">
            <div className="overflow-x-auto rounded-2xl ring-1 ring-ink-100">
              <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                {block.caption ? (
                  <caption className="sr-only">{block.caption}</caption>
                ) : null}
                <thead>
                  <tr className="bg-ink-50">
                    {block.head.map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 font-display text-xs font-extrabold uppercase tracking-[0.08em] text-ink-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 bg-white">
                  {block.rows.map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => (
                        <td
                          key={c}
                          className={cn(
                            "px-4 py-3 align-top leading-6 text-ink-700",
                            c === 0 && "font-semibold text-ink-950"
                          )}
                        >
                          <Inline text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {block.note ? (
              <figcaption className="mt-2 text-xs leading-relaxed text-ink-400">
                {block.note}
              </figcaption>
            ) : null}
          </figure>
        );
        break;

      case "services": {
        const all = await getServices(block.category);
        const rows = block.only
          ? block.only
              .map((slug) => all.find((s) => s.slug === slug))
              .filter((s): s is NonNullable<typeof s> => !!s)
          : all;
        if (!rows.length) break;

        out.push(
          <figure key={key} className="mt-7">
            <div className="overflow-x-auto rounded-2xl ring-1 ring-ink-100">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Indicative {block.category.replace("-", " ")} price ranges in
                  Delhi
                </caption>
                <thead>
                  <tr className="bg-ink-50">
                    <th scope="col" className="px-4 py-3 font-display text-xs font-extrabold uppercase tracking-[0.08em] text-ink-500">
                      Service
                    </th>
                    <th scope="col" className="px-4 py-3 font-display text-xs font-extrabold uppercase tracking-[0.08em] text-ink-500">
                      Indicative range
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-display text-xs font-extrabold uppercase tracking-[0.08em] text-ink-500">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 bg-white">
                  {rows.map((s) => (
                    <tr key={s.slug}>
                      <td className="px-4 py-3 font-semibold text-ink-950">{s.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-display font-bold text-ink-950">
                        {s.benchmarkMin != null && s.benchmarkMax != null
                          ? `${formatINR(s.benchmarkMin)} – ${formatINR(s.benchmarkMax)}`
                          : "Being collected"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/${citySlug}/prices/${s.slug}`}
                          className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
                        >
                          See shops
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <figcaption className="mt-2 text-xs leading-relaxed text-ink-400">
              {block.note ??
                "Indicative ranges from Groovyn's own market research, not a quote. Fabric, detailing and the shop all move the final price, and these update as shops publish their rate cards."}
            </figcaption>
          </figure>
        );
        break;
      }

      case "shops": {
        const result = await listStores({
          city: citySlug,
          category: block.category,
          locality: block.locality,
          sort: "rating",
          perPage: block.limit ?? 4,
        });
        if (!result.items.length) break;

        out.push(
          <div key={key} className="mt-8">
            {block.title ? (
              <p className="mb-4 font-display text-base font-extrabold text-ink-950">
                {block.title}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {result.items.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        );
        break;
      }

      case "localities": {
        const all = await getLocalities(citySlug, block.category);
        const top = [...all]
          .sort((a, b) => b.storeCount - a.storeCount || a.name.localeCompare(b.name))
          .slice(0, block.limit ?? 8);
        if (!top.length) break;

        out.push(
          <div key={key} className="mt-7">
            {block.title ? (
              <p className="mb-3 font-display text-base font-extrabold text-ink-950">
                {block.title}
              </p>
            ) : null}
            <ul className="flex flex-wrap gap-2">
              {top.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/${citySlug}/${block.category}/in/${l.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900 ring-1 ring-ink-200 transition-colors hover:bg-ink-950 hover:text-white hover:ring-ink-950"
                  >
                    {l.name}
                    <span className="rounded-full bg-ink-100 px-1.5 text-xs font-bold text-ink-500">
                      {l.storeCount}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
        break;
      }

      case "cta": {
        const copy = CTA_COPY[block.kind];
        const Icon = block.kind === "measure" ? Ruler : ArrowRight;
        out.push(
          <div
            key={key}
            className="mesh-dark grain relative isolate mt-10 overflow-hidden rounded-3xl p-6 sm:p-8"
          >
            <div className="relative">
              <p className="font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                {copy.title}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                {copy.body}
              </p>
              <Link
                href={copy.href(citySlug)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink-950 transition-all hover:gap-3"
              >
                {block.kind === "measure" ? <Icon aria-hidden className="size-4" /> : null}
                {copy.label}
                {block.kind !== "measure" ? <Icon aria-hidden className="size-4" /> : null}
              </Link>
            </div>
          </div>
        );
        break;
      }
    }
  }

  return <div>{out}</div>;
}
