import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { POSTS } from "@/content/blog";
import { CATEGORIES, site } from "@/lib/site";
import type { CityDTO } from "@/lib/types";

export function SiteFooter({ cities }: { cities: CityDTO[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-ink-100 bg-ink-900 text-white/85">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2.5">
              {/* The mark is black, so it needs a light chip to read on the
                  dark footer rather than disappearing into it. */}
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white">
                <Image
                  src="/images/logo-mark.png"
                  alt=""
                  width={28}
                  height={28}
                  className="size-7"
                />
              </span>
              <p className="font-display text-2xl font-bold text-white">
                Groovyn
              </p>
            </div>
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
              Guides
            </h2>
            <ul className="space-y-2 text-sm">
              {POSTS.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="text-white/75 hover:text-brand-300"
                  >
                    {p.metaTitle}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className="font-medium text-brand-300 hover:text-white">
                  All guides
                </Link>
              </li>
              <li>
                <Link href="/measurements" className="text-white/75 hover:text-brand-300">
                  Measure yourself, free
                </Link>
              </li>
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
              Company
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-white/75 hover:text-brand-300">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/how-we-rank" className="text-white/75 hover:text-brand-300">
                  How we rank
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/75 hover:text-brand-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/75 hover:text-brand-300">
                  Contact
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

        <div className="mt-12 border-t border-white/15 pt-6 text-xs text-white/55">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Groovyn. All rights reserved.</p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                <li>
                  <Link href="/privacy" className="hover:text-brand-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-brand-300">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="hover:text-brand-300">
                    Cancellations and Refunds
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <p className="mt-3">
            Listings are informational. Always confirm prices with the shop
            before ordering.
          </p>
        </div>
      </Container>
    </footer>
  );
}
