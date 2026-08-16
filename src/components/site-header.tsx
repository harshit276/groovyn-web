"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CATEGORIES } from "@/lib/site";
import type { CityDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SiteHeader({ cities }: { cities: CityDTO[] }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // The first path segment is the city when it matches a known city slug.
  const citySlug = React.useMemo(() => {
    const first = pathname.split("/")[1];
    return cities.some((c) => c.slug === first) ? first : cities[0]?.slug;
  }, [pathname, cities]);

  // The menu closes from the link handlers below rather than from an effect on
  // pathname — a synchronous setState in an effect causes cascading renders.
  const closeMenu = React.useCallback(() => setOpen(false), []);

  return (
    <header className="sticky top-0 z-40 border-b border-paper-300 bg-paper-100/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
          >
            <span className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Groovyn
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.2em] text-brass-600 sm:inline">
              Atelier Index
            </span>
          </Link>

          <nav aria-label="Categories" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {CATEGORIES.map((c) => {
                const href = `/${citySlug}/${c.slug}`;
                const isActive = pathname.startsWith(href);
                return (
                  <li key={c.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-ink-900 text-paper-50"
                          : "text-ink-700 hover:bg-ink-900/5"
                      )}
                    >
                      {c.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/search">
                <Search aria-hidden />
                Search
              </Link>
            </Button>
            <Button asChild variant="brass" size="sm" className="hidden sm:inline-flex">
              <Link href="/claim">List your shop</Link>
            </Button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-10 place-items-center rounded-full hover:bg-ink-900/5 lg:hidden"
            >
              {open ? (
                <X aria-hidden className="size-5" />
              ) : (
                <Menu aria-hidden className="size-5" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {open ? (
        <div id="mobile-nav" className="border-t border-paper-300 bg-paper-100 lg:hidden">
          <Container className="py-4">
            <ul className="grid gap-1">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${citySlug}/${c.slug}`}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-ink-800 hover:bg-paper-200"
                  >
                    <span>{c.name}</span>
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ backgroundColor: c.accent }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2">
              <Button asChild variant="outline">
                <Link href="/search" onClick={closeMenu}>
                  Search all stores
                </Link>
              </Button>
              <Button asChild variant="brass">
                <Link href="/claim" onClick={closeMenu}>
                  List your shop
                </Link>
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
