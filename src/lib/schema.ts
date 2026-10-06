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
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.email,
      areaServed: site.address.countryCode,
    },
    sameAs: [...site.sameAs],
  };
}

/** A plain page that is about the site itself: about, contact, policies. */
export function webPageSchema(input: {
  type: "WebPage" | "AboutPage" | "ContactPage";
  name: string;
  description: string;
  path: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": input.type,
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    dateModified: input.dateModified,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
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

/* ───────────────────────────── editorial ───────────────────────────── */

type ArticleInput = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  words: number;
};

/**
 * BlogPosting for a guide.
 *
 * The author is the organisation, not an invented person: a made-up byline with
 * a made-up bio is the kind of thing quality raters are trained to distrust,
 * and it is not true. `image` points at the per-post share image.
 */
export function articleSchema(post: ArticleInput) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    wordCount: post.words,
    inLanguage: "en-IN",
    image: [`${url}/opengraph-image`],
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo.jpg") },
    },
  };
}

/**
 * FAQPage. Every question and answer here must also be visible on the page,
 * word for word, or the markup misrepresents the content. Callers pass the same
 * array they render.
 */
export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** The measurement scan, described as the free browser tool it is. */
export function measurementToolSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Groovyn body measurement scan",
    url: absoluteUrl("/measurements"),
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any modern browser with a camera",
    description:
      "Estimate your body measurements from two photos on your phone. Runs in the browser and uploads nothing.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    isAccessibleForFree: true,
  };
}

export function blogSchema(posts: { slug: string; title: string; datePublished: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${site.name} guides`,
    url: absoluteUrl("/blog"),
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
      datePublished: p.datePublished,
    })),
  };
}
