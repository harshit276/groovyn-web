import { ArrowRight, Clock, Ruler } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqList } from "@/components/blog/faq-list";
import { PostBody } from "@/components/blog/post-body";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { Container } from "@/components/ui/container";
import { getPost, getRelated, POSTS } from "@/content/blog";
import {
  CLUSTER_META,
  formatPostDate,
  headings,
  postHref,
  readingMinutes,
  wordCount,
} from "@/lib/blog";
import { getCities } from "@/lib/queries";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = postHref(post.slug);
  return {
    title: post.metaTitle,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.metaTitle,
      description: post.description,
      url,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [site.name],
      // og:image comes from opengraph-image.tsx in this folder.
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.description,
    },
  };
}

const SIDE_CTA = {
  measurements: {
    icon: Ruler,
    title: "Measure yourself, free",
    body: "Two photos, spoken instructions, nothing uploaded.",
    label: "Start the scan",
    href: "/measurements",
  },
  prices: {
    icon: ArrowRight,
    title: "Compare tailors",
    body: "Ratings, areas and starting prices in one place.",
    label: "Browse tailors",
    href: "/delhi/tailors",
  },
  choosing: {
    icon: ArrowRight,
    title: "Find a shop near you",
    body: "Tailors, boutiques, fabric and rentals across Delhi NCR.",
    label: "Browse shops",
    href: "/delhi",
  },
} as const;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const cities = await getCities();
  const citySlug = cities[0]?.slug ?? "delhi";

  const toc = headings(post);
  const related = getRelated(post).slice(0, 3);
  const side = SIDE_CTA[post.cluster];
  const SideIcon = side.icon;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/blog" },
    { name: post.metaTitle, href: postHref(post.slug) },
  ];

  const updated = post.dateModified !== post.datePublished;

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

          <Link
            href="/blog"
            className="mt-6 inline-block text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-300 hover:text-white"
          >
            {CLUSTER_META[post.cluster].label}
          </Link>

          <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            {post.excerpt}
          </p>

          <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/50">
            <span>By the {site.name} team</span>
            <span aria-hidden>·</span>
            <span>
              {updated ? "Updated " : "Published "}
              <time dateTime={updated ? post.dateModified : post.datePublished}>
                {formatPostDate(updated ? post.dateModified : post.datePublished)}
              </time>
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="size-3.5" />
              {readingMinutes(post)} min read
            </span>
          </p>
        </div>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
          <article className="min-w-0 max-w-3xl">
            {/* Mobile table of contents. On desktop it lives in the sidebar. */}
            <details className="mb-10 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-100 lg:hidden">
              <summary className="cursor-pointer font-display text-sm font-extrabold text-ink-950">
                On this page
              </summary>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-ink-600 hover:text-brand-600">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            <PostBody blocks={post.blocks} citySlug={citySlug} />

            <h2
              id="faq"
              className="mt-16 scroll-mt-28 font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl"
            >
              Frequently asked questions
            </h2>
            <FaqList faq={post.faq} />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <nav aria-label="On this page" className="rounded-3xl bg-white p-5 ring-1 ring-ink-100">
                <p className="font-display text-xs font-extrabold uppercase tracking-[0.14em] text-ink-400">
                  On this page
                </p>
                <ol className="mt-3 space-y-2.5 text-sm leading-snug">
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="text-ink-600 transition-colors hover:text-brand-600"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="#faq"
                      className="text-ink-600 transition-colors hover:text-brand-600"
                    >
                      Frequently asked questions
                    </a>
                  </li>
                </ol>
              </nav>

              <div className="mesh-dark grain relative isolate overflow-hidden rounded-3xl p-5">
                <div className="relative">
                  <p className="font-display text-lg font-extrabold leading-tight text-white">
                    {side.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                    {side.body}
                  </p>
                  <Link
                    href={side.href}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-950"
                  >
                    {post.cluster === "measurements" ? (
                      <SideIcon aria-hidden className="size-4" />
                    ) : null}
                    {side.label}
                    {post.cluster !== "measurements" ? (
                      <SideIcon aria-hidden className="size-4" />
                    ) : null}
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="mt-20 border-t border-ink-100 pt-12">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        ) : null}

        <JsonLd
          data={[
            articleSchema({
              slug: post.slug,
              title: post.title,
              description: post.description,
              datePublished: post.datePublished,
              dateModified: post.dateModified,
              words: wordCount(post),
            }),
            faqSchema(post.faq),
            breadcrumbSchema(crumbs),
          ]}
        />
      </Container>
    </>
  );
}
