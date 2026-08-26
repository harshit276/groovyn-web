"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/suggestions", label: "Suggestions" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections">
      <ul className="flex flex-wrap gap-1 border-b border-ink-100">
        {LINKS.map((l) => {
          const isActive =
            l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "border-brand-500 text-ink-900"
                    : "border-transparent text-ink-500 hover:text-ink-800"
                )}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
