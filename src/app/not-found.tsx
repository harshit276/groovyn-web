import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * A real 404. The old SPA returned HTTP 200 with the homepage for every unknown
 * URL, which Google treats as a soft 404 and holds against the whole site.
 * This page is served with a genuine 404 status.
 */
export default function NotFound() {
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-6xl text-brass-500">404</p>
        <h1 className="mt-4 text-3xl text-ink-900">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-ink-600">
          The shop may have been removed, or the link might be wrong. Try
          searching instead.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="primary">
            <Link href="/search">Search shops</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
