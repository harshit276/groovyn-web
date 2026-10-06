import Link from "next/link";
import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { Container } from "@/components/ui/container";
import { POLICIES_UPDATED, site } from "@/lib/site";

/**
 * Shared pieces for the pages about Groovyn itself: about, contact, the policies,
 * how we rank and the FAQ. They are all plain reading pages, so they share one
 * dark hero (the same one the guides use) and one set of prose styles.
 */

export const linkClass =
  "font-medium text-brand-600 underline decoration-brand-300 underline-offset-[3px] hover:text-brand-700";

export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  showUpdated,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  showUpdated?: boolean;
}) {
  return (
    <section
      data-dark-hero
      className="mesh-dark grain relative isolate -mt-20 overflow-hidden pt-20"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="[&_a:hover]:text-brand-300 [&_a]:text-white/55 [&_li]:text-white/50 [&_span]:text-white/75">
          <Breadcrumbs crumbs={crumbs} />
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-300">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl">
          {title}
        </h1>
        {lead ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
            {lead}
          </p>
        ) : null}
        {showUpdated ? (
          <p className="mt-4 text-sm text-white/45">
            Last updated {POLICIES_UPDATED.label}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function PageBody({
  children,
  toc,
}: {
  children: ReactNode;
  toc?: { id: string; label: string }[];
}) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        {toc?.length ? (
          <nav
            aria-label="On this page"
            className="mb-10 rounded-card border border-ink-100 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
              On this page
            </p>
            <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="text-brand-600 hover:text-brand-700"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="space-y-5 text-[17px] leading-relaxed text-ink-700">
          {children}
        </div>
      </div>
    </Container>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 pt-6">
      <h2
        id={`${id}-heading`}
        className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export function Bullets({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-brand-300">{children}</ul>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border-l-4 border-brand-500 bg-brand-50 px-5 py-4 text-ink-800">
      {children}
    </div>
  );
}

/** An internal link. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

export function Email({ children }: { children?: ReactNode }) {
  return (
    <a href={`mailto:${site.email}`} className={linkClass}>
      {children ?? site.email}
    </a>
  );
}
