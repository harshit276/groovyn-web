import Link from "next/link";

import { Container } from "@/components/ui/container";
import { CATEGORIES, site } from "@/lib/site";
import type { CityDTO } from "@/lib/types";

export function SiteFooter({ cities }: { cities: CityDTO[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-ink-100 bg-ink-900 text-white/85">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl font-semibold text-white">
              Groovyn
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
              {site.description}
            </p>
            <p className="mt-4 text-sm font-medium text-brand-300">
              We never sell your number.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/55">
              Browse
            </h2>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${cities[0]?.slug ?? "delhi"}/${c.slug}`}
                    className="text-white/75 hover:text-brand-300"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/55">
              Cities
            </h2>
            <ul className="space-y-2 text-sm">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    className="text-white/75 hover:text-brand-300"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/55">
              For shop owners
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/claim" className="text-white/75 hover:text-brand-300">
                  Claim your listing
                </Link>
              </li>
              <li>
                <Link href="/suggest" className="text-white/75 hover:text-brand-300">
                  Suggest a shop
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-white/75 hover:text-brand-300"
                >
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Groovyn. All rights reserved.</p>
          <p>
            Listings are informational. Always confirm prices with the shop
            before ordering.
          </p>
        </div>
      </Container>
    </footer>
  );
}
