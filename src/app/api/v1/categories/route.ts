import { okCached } from "@/lib/api";
import { CATEGORIES } from "@/lib/site";

export async function GET() {
  return okCached(
    {
      items: CATEGORIES.map((c) => ({
        slug: c.slug,
        name: c.name,
        singular: c.singular,
        blurb: c.blurb,
        accent: c.accent,
      })),
    },
    3600
  );
}
