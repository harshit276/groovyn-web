"use client";

import {
  ArrowUpRight,
  Check,
  ChevronDown,
  MapPin,
  Menu,
  Ruler,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { CATEGORIES } from "@/lib/site";
import type { CityDTO, ServiceDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

/** useLayoutEffect on the client, useEffect on the server — avoids the SSR warning. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const CATEGORY_IMAGES: Record<string, string> = {
  tailors: "/images/cat-tailors.webp",
  boutiques: "/images/cat-boutiques.webp",
  "fabric-shops": "/images/cat-fabric-shops.webp",
  "rental-shops": "/images/cat-rental-shops.webp",
};

/**
 * Floating navigation with a mega-menu.
 *
 * Over a full-bleed dark hero it starts transparent — a mesh the nav should
 * sit *in*, not on — and condenses into an opaque glass pill once scrolled.
 * Everywhere else it is opaque from the first frame, because white-on-white
 * would erase the wordmark and every link on a light page.
 *
 * Each vertical opens a panel of that vertical's real services, so the nav is
 * a way into the long tail rather than four links to four list pages.
 */
export function SiteHeader({
  cities,
  services = [],
}: {
  cities: CityDTO[];
  services?: ServiceDTO[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [overDark, setOverDark] = React.useState(false);
  const [menu, setMenu] = React.useState<string | null>(null);
  const [cityOpen, setCityOpen] = React.useState(false);

  const navRef = React.useRef<HTMLDivElement>(null);
  const closeTimer = React.useRef<number | null>(null);

  const citySlug = React.useMemo(() => {
    const first = pathname.split("/")[1];
    return cities.some((c) => c.slug === first) ? first : cities[0]?.slug;
  }, [pathname, cities]);

  const activeCity = cities.find((c) => c.slug === citySlug) ?? cities[0];

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useIsomorphicLayoutEffect(() => {
    setOverDark(!!document.querySelector("[data-dark-hero]"));
  }, [pathname]);

  // Any outside click or Escape closes both overlays.
  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) {
        setMenu(null);
        setCityOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(null);
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  React.useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    []
  );

  /** A small grace period, so crossing the gap to the panel doesn't close it. */
  function scheduleClose() {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), 180);
  }
  function cancelClose() {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    setMenu(null);
    setCityOpen(false);
  }, []);

  const solid = scrolled || !overDark || menu !== null;
  const openCategory = CATEGORIES.find((c) => c.slug === menu);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div ref={navRef} className="pointer-events-auto mx-auto max-w-7xl">
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-all duration-500 sm:px-4",
            solid
              ? "border border-ink-100 bg-white/90 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl"
              : "border border-white/12 bg-white/5 backdrop-blur-md"
          )}
        >
          <Link
            href="/"
            aria-label="Groovyn — home"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Image
              src="/images/logo-mark.png"
              alt=""
              width={32}
              height={32}
              priority
              className="size-8 shrink-0"
            />
            <span
              className={cn(
                "font-display text-xl font-extrabold tracking-tight transition-colors",
                solid ? "text-ink-900" : "text-white"
              )}
            >
              Groovyn
            </span>
          </Link>

          {/* ── Verticals ── */}
          <nav aria-label="Categories" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {CATEGORIES.map((c) => {
                const href = `/${citySlug}/${c.slug}`;
                const isActive = pathname.startsWith(href);
                const isOpen = menu === c.slug;
                return (
                  <li
                    key={c.slug}
                    onMouseEnter={() => {
                      cancelClose();
                      setMenu(c.slug);
                    }}
                    onMouseLeave={scheduleClose}
                  >
                    <Link
                      href={href}
                      onFocus={() => setMenu(c.slug)}
                      aria-expanded={isOpen}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                        isActive || isOpen
                          ? solid
                            ? "bg-ink-900 text-white"
                            : "bg-white text-ink-950"
                          : solid
                            ? "text-ink-600 hover:bg-ink-900/5 hover:text-ink-900"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {c.name}
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "size-3 transition-transform duration-300",
                          isOpen && "rotate-180"
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            {/* ── City switcher ── */}
            {cities.length > 1 ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setCityOpen((v) => !v)}
                  aria-expanded={cityOpen}
                  aria-label={`Change city, currently ${activeCity?.name}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    solid
                      ? "text-ink-700 hover:bg-ink-900/5"
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  <MapPin aria-hidden className="size-3.5" />
                  {activeCity?.name}
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-3 transition-transform duration-300",
                      cityOpen && "rotate-180"
                    )}
                  />
                </button>

                {cityOpen ? (
                  <ul className="absolute right-0 top-full z-10 mt-2 w-52 overflow-hidden rounded-2xl border border-ink-100 bg-white p-1.5 shadow-xl">
                    {cities.map((c) => {
                      const selected = c.slug === citySlug;
                      return (
                        <li key={c.slug}>
                          <Link
                            href={`/${c.slug}`}
                            onClick={closeMenu}
                            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-800 transition-colors hover:bg-ink-50"
                          >
                            <span>
                              {c.name}
                              <span className="ml-1.5 text-xs text-ink-400">
                                {c.storeCount}
                              </span>
                            </span>
                            {selected ? (
                              <Check aria-hidden className="size-4 text-brand-600" />
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <Link
              href="/measurements"
              className={cn(
                "hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors lg:inline-flex",
                solid
                  ? "text-ink-700 hover:bg-ink-900/5"
                  : "text-white/80 hover:bg-white/10"
              )}
            >
              <Ruler aria-hidden className="size-3.5" />
              Measure me
            </Link>

            <Link
              href="/search"
              aria-label="Search"
              className={cn(
                "grid size-9 place-items-center rounded-full transition-colors sm:size-10",
                solid
                  ? "text-ink-600 hover:bg-ink-900/5"
                  : "text-white/80 hover:bg-white/10"
              )}
            >
              <Search aria-hidden className="size-4" />
            </Link>

            <Link
              href="/claim"
              className={cn(
                "hidden rounded-full px-4 py-2 text-sm font-semibold transition-all sm:inline-flex",
                solid
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "bg-white text-ink-950 hover:bg-white/90"
              )}
            >
              List your shop
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "grid size-9 place-items-center rounded-full transition-colors sm:size-10 lg:hidden",
                solid
                  ? "text-ink-800 hover:bg-ink-900/5"
                  : "text-white hover:bg-white/10"
              )}
            >
              {open ? (
                <X aria-hidden className="size-5" />
              ) : (
                <Menu aria-hidden className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Mega panel ── */}
        {openCategory ? (
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="mt-2 hidden overflow-hidden rounded-2xl border border-ink-100 bg-white/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:block"
          >
            <div className="grid grid-cols-[1.6fr_1fr]">
              <div className="p-6">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: openCategory.accent }}
                >
                  {openCategory.name}
                </p>
                <p className="mt-1.5 text-sm text-ink-500">
                  {openCategory.blurb}
                </p>

                <ul className="mt-5 grid grid-cols-3 gap-x-4 gap-y-0.5">
                  {services
                    .filter((s) => s.category === openCategory.slug)
                    .slice(0, 9)
                    .map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/${citySlug}/prices/${s.slug}`}
                          onClick={closeMenu}
                          className="group flex items-baseline justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-950"
                        >
                          <span className="truncate">{s.name}</span>
                          {s.benchmarkMin != null ? (
                            <span className="shrink-0 text-xs font-semibold text-ink-400 transition-colors group-hover:text-brand-600">
                              ₹{s.benchmarkMin.toLocaleString("en-IN")}+
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                </ul>

                <Link
                  href={`/${citySlug}/${openCategory.slug}`}
                  onClick={closeMenu}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink-950 px-4 py-2 text-xs font-bold text-white transition-all hover:gap-2.5"
                >
                  Browse all {openCategory.name.toLowerCase()} in{" "}
                  {activeCity?.name}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </Link>
              </div>

              {/* Visual anchor, so the panel is not four columns of grey text. */}
              <Link
                href={`/${citySlug}/${openCategory.slug}`}
                onClick={closeMenu}
                className="group relative overflow-hidden"
              >
                <Image
                  src={CATEGORY_IMAGES[openCategory.slug]}
                  alt=""
                  fill
                  sizes="360px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute inset-x-4 bottom-4">
                  <span className="block font-display text-lg font-extrabold text-white">
                    {openCategory.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/60">
                    See every shop near you
                  </span>
                </span>
              </Link>
            </div>
          </div>
        ) : null}

        {/* ── Mobile drawer ── */}
        {open ? (
          <div
            id="mobile-nav"
            className="mt-2 max-h-[75vh] overflow-y-auto rounded-2xl border border-ink-100 bg-white/95 p-3 shadow-xl backdrop-blur-xl lg:hidden"
          >
            <ul className="grid gap-1">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${citySlug}/${c.slug}`}
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-ink-50"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={CATEGORY_IMAGES[c.slug]}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold text-ink-950">
                        {c.name}
                      </span>
                      <span className="block truncate text-xs text-ink-500">
                        {c.blurb}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: c.accent }}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            {cities.length > 1 ? (
              <div className="mt-3 border-t border-ink-100 pt-3">
                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
                  City
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${c.slug}`}
                      onClick={closeMenu}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                        c.slug === citySlug
                          ? "bg-ink-950 text-white"
                          : "bg-ink-50 text-ink-700"
                      )}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-3 grid gap-2 border-t border-ink-100 pt-3">
              <Link
                href="/measurements"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-full bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Ruler aria-hidden className="size-4" />
                Measure me — free
              </Link>
              <Link
                href="/search"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-full border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-800"
              >
                <Search aria-hidden className="size-4" />
                Search all shops
              </Link>
              <Link
                href="/claim"
                onClick={closeMenu}
                className="rounded-full bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                List your shop
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
