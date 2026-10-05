import Link from "next/link";
import * as React from "react";

/**
 * Renders the two inline marks posts may use: `**bold**` and `[label](href)`.
 *
 * Everything is emitted as React nodes, never as HTML, so post text cannot
 * inject markup. Internal links go through next/link; anything else opens in a
 * new tab without passing the referrer along.
 */
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        const bold = /^\*\*([^*]+)\*\*$/.exec(part);
        if (bold) {
          return (
            <strong key={i} className="font-semibold text-ink-950">
              {bold[1]}
            </strong>
          );
        }

        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          const className =
            "font-medium text-brand-600 underline decoration-brand-300 decoration-2 underline-offset-[3px] transition-colors hover:text-brand-700 hover:decoration-brand-500";

          if (href.startsWith("/")) {
            return (
              <Link key={i} href={href} className={className}>
                {label}
              </Link>
            );
          }
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {label}
            </a>
          );
        }

        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
