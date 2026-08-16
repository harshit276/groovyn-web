import { absoluteUrl, getCategory, site } from "@/lib/site";
import type { StoreDetailDTO, StoreSummaryDTO } from "@/lib/types";

const DAY_MAP: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/images/logo.jpg"),
    email: site.email,
    sameAs: [...site.sameAs],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(crumbs: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };
}

export function itemListSchema(stores: StoreSummaryDTO[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: stores.length,
    itemListElement: stores.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(s.href),
      name: s.name,
    })),
  };
}

export function storeSchema(store: StoreDetailDTO) {
  const category = getCategory(store.category);

  const openingHoursSpecification = Object.entries(store.openingHours)
    .filter(([, value]) => value && value !== "closed")
    .map(([day, value]) => {
      const [opens, closes] = value.split("-");
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_MAP[day] ?? day,
        opens,
        closes,
      };
    });

  const offers = store.priceItems
    // Only publish prices the shop actually gave us — never our estimates.
    .filter((p) => p.source !== "estimate" && p.priceMin != null)
    .map((p) => ({
      "@type": "Offer",
      name: p.label,
      priceCurrency: "INR",
      ...(p.priceMin === p.priceMax
        ? { price: p.priceMin }
        : {
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: p.priceMin,
              maxPrice: p.priceMax ?? p.priceMin,
              priceCurrency: "INR",
            },
          }),
    }));

  return {
    "@context": "https://schema.org",
    "@type": category?.schemaType ?? "LocalBusiness",
    ...(category?.additionalType
      ? { additionalType: category.additionalType }
      : {}),
    "@id": absoluteUrl(store.href),
    name: store.name,
    url: absoluteUrl(store.href),
    ...(store.about ? { description: store.about } : {}),
    ...(store.coverImage ? { image: absoluteUrl(store.coverImage) } : {}),
    ...(store.phone ? { telephone: store.phone } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.locality?.name ?? store.city.name,
      addressRegion: store.city.name,
      ...(store.pincode ? { postalCode: store.pincode } : {}),
      addressCountry: "IN",
    },
    ...(store.lat != null && store.lng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: store.lat,
            longitude: store.lng,
          },
        }
      : {}),
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
    ...(store.website ? { sameAs: [store.website] } : {}),
    ...(store.establishedYear ? { foundingDate: String(store.establishedYear) } : {}),
    ...(offers.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `${store.name} price list`,
            itemListElement: offers,
          },
        }
      : {}),
    // NOTE: aggregateRating is intentionally omitted. Add it only when
    // store.ratingCount > 0 from genuine published reviews.
  };
}
