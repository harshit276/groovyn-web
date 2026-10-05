import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { Container } from "@/components/ui/container";
import { POSTS } from "@/content/blog";
import { CLUSTER_META, type PostCluster } from "@/lib/blog";
import { blogSchema, breadcrumbSchema } from "@/lib/schema";
import { openGraphFor } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tailoring, Fabric & Custom Clothing Guides for Delhi",
  description:
    "Plain-English guides to getting clothes made in Delhi: measuring yourself, what stitching costs, choosing a tailor, fabric markets, and wedding outfit planning.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
  openGraph: openGraphFor({
    title: "Tailoring, Fabric & Custom Clothing Guides for Delhi | Groovyn",
    description:
      "Plain-English guides to getting clothes made in Delhi: measuring, costs, choosing a tailor, fabric markets and wedding timelines.",
    url: "/blog",
  }),
};

const ORDER: PostCluster[] = ["measurements", "prices", "choosing"];

export default function BlogIndexPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/blog" },
  ];

  return (
    <>
      <section
        data-dark-hero
        className="mesh-dark grain relative isolate -mt-20 overflow-hidden pt-20"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 80% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="[&_a:hover]:text-brand-300 [&_a]:text-white/55 [&_li]:text-white/50 [&_span]:text-white/75">
            <Breadcrumbs crumbs={crumbs} />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-300">
            Guides
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl">
            Getting clothes made in Delhi
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
            How to measure yourself, what stitching really costs, how to choose
            a tailor and a fabric market, and how to plan a wedding outfit
            without a last-week panic.
          </p>
        </div>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="space-y-16">
          {ORDER.map((cluster) => {
            const posts = POSTS.filter((p) => p.cluster === cluster);
            if (!posts.length) return null;
            return (
              <section key={cluster} aria-labelledby={`cluster-${cluster}`}>
                <h2
                  id={`cluster-${cluster}`}
                  className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl"
                >
                  {CLUSTER_META[cluster].label}
                </h2>
                <p className="mt-1.5 text-ink-500">{CLUSTER_META[cluster].blurb}</p>
                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <JsonLd
          data={[
            blogSchema(POSTS),
            breadcrumbSchema(crumbs),
          ]}
        />
      </Container>
    </>
  );
}
