/**
 * Public DTOs.
 *
 * These are the contract shared by the server-rendered pages and the /api/v1
 * JSON layer. The future React Native app consumes exactly these shapes, so
 * treat changes here as breaking: add fields, don't repurpose them.
 */

export type PriceSource = "shop" | "menu" | "estimate";

export type PriceItemDTO = {
  id: string;
  label: string;
  serviceSlug: string | null;
  priceMin: number | null;
  priceMax: number | null;
  unit: string;
  note: string | null;
  /** "shop"/"menu" = the shop gave us this. "estimate" = our benchmark, shown as indicative. */
  source: PriceSource;
};

export type StoreImageDTO = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
};

export type StoreSummaryDTO = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: { slug: string; name: string };
  locality: { slug: string; name: string } | null;
  address: string;
  about: string | null;
  coverImage: string | null;
  specialities: string[];
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
  /** Canonical web path for this store. */
  href: string;
};

export type StoreDetailDTO = StoreSummaryDTO & {
  pincode: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  mapUrl: string | null;
  materials: string[];
  openingHours: Record<string, string>;
  establishedYear: number | null;
  homeVisitFee: number | null;
  images: StoreImageDTO[];
  priceItems: PriceItemDTO[];
};

export type CityDTO = {
  slug: string;
  name: string;
  state: string;
  blurb: string | null;
  storeCount: number;
};

export type LocalityDTO = {
  slug: string;
  name: string;
  citySlug: string;
  storeCount: number;
};

export type ServiceDTO = {
  slug: string;
  name: string;
  category: string;
  description: string | null;
  benchmarkMin: number | null;
  benchmarkMax: number | null;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type StoreSort =
  | "relevance"
  | "rating"
  | "price_asc"
  | "price_desc"
  | "name";

export type StoreFilters = {
  city?: string;
  category?: string;
  locality?: string;
  service?: string;
  q?: string;
  speciality?: string;
  homeVisit?: boolean;
  verifiedOnly?: boolean;
  rateCardOnly?: boolean;
  maxPrice?: number;
  maxTurnaround?: number;
  sort?: StoreSort;
  page?: number;
  perPage?: number;
};
