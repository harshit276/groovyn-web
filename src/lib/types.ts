/**
 * Public DTOs.
 *
 * These are the contract shared by the server-rendered pages and the /api/v1
 * JSON layer. The future React Native app consumes exactly these shapes, so
 * treat changes here as breaking: add fields, don't repurpose them.
 */

export type PriceSource = "shop" | "menu" | "website" | "estimate";

export type PriceItemDTO = {
  id: string;
  label: string;
  serviceSlug: string | null;
  priceMin: number | null;
  priceMax: number | null;
  unit: string;
  note: string | null;
  /**
   * "shop"/"menu" = the shop gave us this. "website" = the shop publishes it on
   * its own website, with the date we checked in `note`. "estimate" = our
   * benchmark, shown as indicative.
   */
  source: PriceSource;
};

export type StoreImageDTO = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  /**
   * Who shot it. Not decoration: a Google-sourced photo may only be shown with
   * the photographer's attribution, so the UI must always have this to hand.
   */
  credit: string | null;
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
  /**
   * What this shop gives someone who books a visit through us, in the shop's
   * own words. Owner-supplied only — never generated, because the visitor
   * quotes it at the counter and the shop has to honour it.
   */
  visitOffer: string | null;
  verified: boolean;
  claimed: boolean;
  rateCardVerified: boolean;
  featured: boolean;
  /** Our own reviews. Safe for structured data. */
  ratingAvg: number | null;
  ratingCount: number;
  /** Google's. Display-only, always attributed, never in structured data. */
  googleRating: number | null;
  googleRatingCount: number | null;
  googleMapsUri: string | null;
  /** Canonical web path for this store. */
  href: string;
};

/**
 * A piece a shop sells on its own website, shown on its page with its
 * permission. There is no product URL here on purpose: the page links to
 * /go/<id>, which counts the tap and sends the visitor to the shop.
 */
export type ShopProductDTO = {
  id: string;
  title: string;
  /** Rupees, as the shop lists it. */
  price: number;
  imageUrl: string;
  /** When we last read this price from the shop's website (ISO date). */
  checkedAt: string;
};

export type StoreDetailDTO = StoreSummaryDTO & {
  /**
   * Pieces from the shop's own website. Empty unless the shop has said yes to
   * being shown (Store.productsApproved), so this is safe to render as is.
   */
  products: ShopProductDTO[];
  /** The shop's own site, as a bare host such as "bhaavya.com", when it has products here. */
  productSite: string | null;
  /** Conditions the shop attached to its visit offer. */
  visitOfferTerms: string | null;
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
  /** Set when a search had to be loosened, so the page can say so. */
  note?: string;
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
