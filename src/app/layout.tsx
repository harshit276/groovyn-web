import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCities } from "@/lib/queries";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { site } from "@/lib/site";

import "./globals.css";

// Fraunces carries the whole brand — it's the one thing that stops this
// reading like every other directory.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Tailors, Boutiques, Fabric & Rentals in Delhi NCR`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  // og:image comes from app/opengraph-image.tsx — Next resolves it to an
  // absolute URL against metadataBase, which is what WhatsApp previews need.
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — Custom clothing, decoded`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Custom clothing, decoded`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cities = await getCities();

  return (
    <html
      lang="en-IN"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper-100">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-paper-50"
        >
          Skip to content
        </a>
        <SiteHeader cities={cities} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter cities={cities} />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </body>
    </html>
  );
}
