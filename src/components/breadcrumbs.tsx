import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type Crumb = { name: string; href: string };

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-500">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 ? (
                <ChevronRight aria-hidden className="size-3.5 text-ink-300" />
              ) : null}
              {isLast ? (
                <span aria-current="page" className="text-ink-800">
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-brand-600">
                  {c.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
