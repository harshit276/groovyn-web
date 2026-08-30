import "server-only";

import { db } from "@/lib/db";
import type {
  CityDTO,
  LocalityDTO,
  Paginated,
  PriceItemDTO,
  PriceSource,
  ServiceDTO,
  StoreDetailDTO,
  StoreFilters,
  StoreSummaryDTO,
} from "@/lib/types";
import { parseList } from "@/lib/utils";

export const DEFAULT_PER_PAGE = 12;

export function storeHref(
  citySlug: string,
  category: string,
  storeSlug: string
): string {
  return `/${citySlug}/${category}/${storeSlug}`;
}

function parseHours(value: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Prisma row shapes we map from — kept loose so selects can vary. */
type StoreRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  address: string;
  about: string | null;
  coverImage: string | null;
  specialities: string;
  priceMin: number | null;
  priceMax: number | null;
  turnaroundDays: number | null;
  homeVisit: boolean;
  verified: boolean;
  claimed: boolean;
  rateCardVerified: boolean;
  featured: boolean;
  ratingAvg: number | null;
  ratingCount: number;
  googleRating: number | null;
  googleRatingCount: number | null;
  googleMapsUri: string | null;
  city: { slug: string; name: string };
  locality: { slug: string; name: string } | null;
};

function toSummary(row: StoreRow): StoreSummaryDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    city: { slug: row.city.slug, name: row.city.name },
    locality: row.locality
      ? { slug: row.locality.slug, name: row.locality.name }
      : null,
    address: row.address,
    about: row.about,
    coverImage: row.coverImage,
    specialities: parseList(row.specialities),
    priceMin: row.priceMin,
    priceMax: row.priceMax,
    turnaroundDays: row.turnaroundDays,
    homeVisit: row.homeVisit,
    verified: row.verified,
    claimed: row.claimed,
    rateCardVerified: row.rateCardVerified,
    featured: row.featured,
    ratingAvg: row.ratingAvg,
    ratingCount: row.ratingCount,
    googleRating: row.googleRating,
    googleRatingCount: row.googleRatingCount,
    googleMapsUri: row.googleMapsUri,
    href: storeHref(row.city.slug, row.category, row.slug),
  };
}

const summarySelect = {
  id: true,
  slug: true,
  name: true,
  category: true,
  address: true,
  about: true,
  coverImage: true,
  specialities: true,
  priceMin: true,
  priceMax: true,
  turnaroundDays: true,
  homeVisit: true,
  verified: true,
  claimed: true,
  rateCardVerified: true,
  featured: true,
  ratingAvg: true,
  ratingCount: true,
  googleRating: true,
  googleRatingCount: true,
  googleMapsUri: true,
  city: { select: { slug: true, name: true } },
  locality: { select: { slug: true, name: true } },
} as const;

/* ────────────────────────────── Cities ────────────────────────────── */

export async function getCities(): Promise<CityDTO[]> {
  const rows = await db.city.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { stores: true } } },
  });
  return rows.map((c) => ({
    slug: c.slug,
    name: c.name,
    state: c.state,
    blurb: c.blurb,
    storeCount: c._count.stores,
  }));
}

export async function getCity(slug: string) {
  return db.city.findUnique({ where: { slug } });
}

export async function getLocalities(
  citySlug: string,
  category?: string
): Promise<LocalityDTO[]> {
  const rows = await db.locality.findMany({
    where: { city: { slug: citySlug } },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { stores: category ? { where: { category } } : true },
      },
    },
  });
  return rows
    .map((l) => ({
      slug: l.slug,
      name: l.name,
      citySlug,
      storeCount: l._count.stores,
    }))
    .filter((l) => l.storeCount > 0);
}

export async function getLocality(citySlug: string, localitySlug: string) {
  return db.locality.findFirst({
    where: { slug: localitySlug, city: { slug: citySlug } },
    include: { city: true },
  });
}

/* ───────────────────────────── Services ───────────────────────────── */

export async function getServices(category?: string): Promise<ServiceDTO[]> {
  const rows = await db.service.findMany({
    where: category ? { category } : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((s) => ({
    slug: s.slug,
    name: s.name,
    category: s.category,
    description: s.description,
    benchmarkMin: s.benchmarkMin,
    benchmarkMax: s.benchmarkMax,
  }));
}

export async function getService(slug: string) {
  return db.service.findUnique({ where: { slug } });
}

/* ────────────────────────────── Stores ────────────────────────────── */

/**
 * The one query every listing surface goes through — category pages, locality
 * pages, service pages, search, and /api/v1/stores.
 */
export async function listStores(
  filters: StoreFilters
): Promise<Paginated<StoreSummaryDTO>> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(48, Math.max(1, filters.perPage ?? DEFAULT_PER_PAGE));

  const and: Record<string, unknown>[] = [];

  if (filters.city) and.push({ city: { slug: filters.city } });
  if (filters.category) and.push({ category: filters.category });
  if (filters.locality) and.push({ locality: { slug: filters.locality } });
  if (filters.homeVisit) and.push({ homeVisit: true });
  if (filters.verifiedOnly) and.push({ verified: true });
  if (filters.rateCardOnly) and.push({ rateCardVerified: true });
  if (filters.maxPrice != null)
    and.push({ priceMin: { lte: filters.maxPrice } });
  if (filters.maxTurnaround != null)
    and.push({ turnaroundDays: { lte: filters.maxTurnaround } });

  // Specialities are a JSON string column, so match the quoted value to avoid
  // "Bridal" also hitting "Bridalwear Extra".
  if (filters.speciality)
    and.push({ specialities: { contains: `"${filters.speciality}"` } });

  if (filters.service)
    and.push({ priceItems: { some: { service: { slug: filters.service } } } });

  // Postgres LIKE is case-sensitive, so every free-text match needs
  // mode: "insensitive" — without it "Suit" and "suit" return different results.
  if (filters.q) {
    const q = filters.q.trim();
    if (q) {
      const ci = { contains: q, mode: "insensitive" as const };
      and.push({
        OR: [
          { name: ci },
          { about: ci },
          { address: ci },
          { specialities: ci },
          { materials: ci },
          { locality: { name: ci } },
          { priceItems: { some: { label: ci } } },
          { priceItems: { some: { service: { name: ci } } } },
          { priceItems: { some: { service: { aliases: ci } } } },
        ],
      });
    }
  }

  const where = and.length ? { AND: and } : {};

  const orderBy = (() => {
    switch (filters.sort) {
      case "rating":
        // Nulls last so unrated shops don't outrank rated ones.
        return [{ ratingAvg: "desc" as const }, { verified: "desc" as const }];
      case "price_asc":
        return [{ priceMin: "asc" as const }];
      case "price_desc":
        return [{ priceMin: "desc" as const }];
      case "name":
        return [{ name: "asc" as const }];
      default:
        // Relevance: our own quality signals, since we have no engagement data yet.
        return [
          { featured: "desc" as const },
          { rateCardVerified: "desc" as const },
          { verified: "desc" as const },
          { name: "asc" as const },
        ];
    }
  })();

  const [rows, total] = await Promise.all([
    db.store.findMany({
      where,
      select: summarySelect,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.store.count({ where }),
  ]);

  return {
    items: rows.map(toSummary),
    page,
    perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getStoreDetail(
  slug: string
): Promise<StoreDetailDTO | null> {
  const row = await db.store.findUnique({
    where: { slug },
    include: {
      city: { select: { slug: true, name: true } },
      locality: { select: { slug: true, name: true } },
      images: { orderBy: { sortOrder: "asc" } },
      priceItems: {
        orderBy: { sortOrder: "asc" },
        include: { service: { select: { slug: true } } },
      },
    },
  });
  if (!row) return null;

  return {
    ...toSummary(row),
    pincode: row.pincode,
    lat: row.lat,
    lng: row.lng,
    phone: row.phone,
    whatsapp: row.whatsapp,
    website: row.website,
    instagram: row.instagram,
    mapUrl: row.mapUrl,
    materials: parseList(row.materials),
    openingHours: parseHours(row.openingHours),
    establishedYear: row.establishedYear,
    homeVisitFee: row.homeVisitFee,
    images: row.images.map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      caption: i.caption,
    })),
    priceItems: row.priceItems.map(
      (p): PriceItemDTO => ({
        id: p.id,
        label: p.label,
        serviceSlug: p.service?.slug ?? null,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        unit: p.unit,
        note: p.note,
        source: p.source as PriceSource,
      })
    ),
  };
}

/** Nearby = same category, same city, preferring the same locality. */
export async function getSimilarStores(
  store: StoreSummaryDTO,
  limit = 4
): Promise<StoreSummaryDTO[]> {
  const rows = await db.store.findMany({
    where: {
      category: store.category,
      city: { slug: store.city.slug },
      NOT: { id: store.id },
    },
    select: summarySelect,
    orderBy: [{ featured: "desc" }, { verified: "desc" }],
    take: limit * 2,
  });

  const mapped = rows.map(toSummary);
  const sameLocality = mapped.filter(
    (s) => s.locality?.slug && s.locality.slug === store.locality?.slug
  );
  const rest = mapped.filter((s) => !sameLocality.includes(s));
  return [...sameLocality, ...rest].slice(0, limit);
}

/* ─────────────────── Aggregates used by SEO surfaces ─────────────────── */

export async function getCategoryCounts(citySlug: string) {
  const rows = await db.store.groupBy({
    by: ["category"],
    where: { city: { slug: citySlug } },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.category, r._count._all]));
}

/**
 * Real observed price range for a service in a city, built from shop-supplied
 * rate cards only. This is what powers the /[city]/prices/[service] pages —
 * estimates are excluded so the published number means something.
 */
export async function getServicePriceIndex(
  citySlug: string,
  serviceSlug: string
) {
  const items = await db.priceItem.findMany({
    where: {
      service: { slug: serviceSlug },
      source: { in: ["shop", "menu"] },
      store: { city: { slug: citySlug } },
    },
    select: {
      priceMin: true,
      priceMax: true,
      unit: true,
      store: { select: { name: true, slug: true, category: true } },
    },
  });

  const mins = items.map((i) => i.priceMin).filter((n): n is number => n != null);
  const maxes = items.map((i) => i.priceMax).filter((n): n is number => n != null);

  if (!mins.length && !maxes.length) {
    return { sampleSize: 0, low: null, high: null, median: null, unit: null };
  }

  const all = [...mins, ...maxes].sort((a, b) => a - b);
  const median = all[Math.floor(all.length / 2)] ?? null;

  return {
    sampleSize: items.length,
    low: mins.length ? Math.min(...mins) : null,
    high: maxes.length ? Math.max(...maxes) : null,
    median,
    unit: items[0]?.unit ?? null,
  };
}

/** Type-ahead across stores, localities and services. */
export async function searchSuggest(q: string, limit = 8) {
  const term = q.trim();
  if (term.length < 2) return { stores: [], localities: [], services: [] };

  const ci = { contains: term, mode: "insensitive" as const };

  const [stores, localities, services] = await Promise.all([
    db.store.findMany({
      where: { name: ci },
      select: {
        name: true,
        slug: true,
        category: true,
        city: { select: { slug: true, name: true } },
      },
      take: limit,
    }),
    db.locality.findMany({
      where: { name: ci },
      select: { name: true, slug: true, city: { select: { slug: true } } },
      take: limit,
    }),
    db.service.findMany({
      where: { OR: [{ name: ci }, { aliases: ci }] },
      select: { name: true, slug: true, category: true },
      take: limit,
    }),
  ]);

  return {
    stores: stores.map((s) => ({
      label: s.name,
      href: storeHref(s.city.slug, s.category, s.slug),
      sublabel: s.city.name,
    })),
    localities: localities.map((l) => ({
      label: l.name,
      href: `/${l.city.slug}/tailors/in/${l.slug}`,
      sublabel: "Locality",
    })),
    services: services.map((s) => ({
      label: s.name,
      href: `/services/${s.slug}`,
      sublabel: "Service",
    })),
  };
}

/** Every store slug — used by sitemap and generateStaticParams. */
export async function getAllStorePaths() {
  const rows = await db.store.findMany({
    select: {
      slug: true,
      category: true,
      updatedAt: true,
      city: { select: { slug: true } },
    },
  });
  return rows.map((r) => ({
    city: r.city.slug,
    category: r.category,
    store: r.slug,
    updatedAt: r.updatedAt,
  }));
}

export async function getAllLocalityPaths() {
  const rows = await db.store.findMany({
    where: { localityId: { not: null } },
    select: {
      category: true,
      city: { select: { slug: true } },
      locality: { select: { slug: true } },
    },
    distinct: ["category", "cityId", "localityId"],
  });
  return rows
    .filter((r) => r.locality)
    .map((r) => ({
      city: r.city.slug,
      category: r.category,
      locality: r.locality!.slug,
    }));
}
