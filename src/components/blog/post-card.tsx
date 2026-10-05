import { ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";

import {
  CLUSTER_META,
  formatPostDate,
  postHref,
  readingMinutes,
  type Post,
} from "@/lib/blog";
import { cn } from "@/lib/utils";

const CLUSTER_ACCENT: Record<Post["cluster"], string> = {
  measurements: "var(--color-cat-tailor)",
  prices: "var(--color-cat-fabric)",
  choosing: "var(--color-cat-boutique)",
};

/** A guide in a list. The whole card is one link, so it is one tab stop. */
export function PostCard({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  const accent = CLUSTER_ACCENT[post.cluster];

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition-all duration-500 hover:-translate-y-1 hover:shadow-3d-lg hover:ring-transparent",
        className
      )}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        {CLUSTER_META[post.cluster].label}
      </p>

      <h3 className="mt-3 font-display text-xl font-extrabold leading-snug tracking-tight text-ink-950">
        <Link
          href={postHref(post.slug)}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {post.title}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
        {post.excerpt}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <Clock aria-hidden className="size-3.5" />
          {readingMinutes(post)} min read
          <span aria-hidden>·</span>
          <time dateTime={post.datePublished}>
            {formatPostDate(post.datePublished)}
          </time>
        </span>
        <span className="grid size-8 place-items-center rounded-full border border-ink-200 text-ink-400 transition-all duration-500 group-hover:border-ink-950 group-hover:bg-ink-950 group-hover:text-white">
          <ArrowUpRight aria-hidden className="size-4" />
        </span>
      </div>
    </article>
  );
}
