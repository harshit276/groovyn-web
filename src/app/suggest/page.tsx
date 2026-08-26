import type { Metadata } from "next";

import { SimpleForm } from "@/components/simple-form";
import { Container } from "@/components/ui/container";
import { CATEGORIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Suggest a shop",
  description:
    "Know a great tailor, boutique, fabric shop or rental store we're missing? Tell us and we'll add them to Groovyn.",
  alternates: { canonical: "/suggest" },
};

export default function SuggestPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
          Help us build this
        </p>
        <h1 className="text-3xl text-ink-900 sm:text-4xl">
          Know a shop we&apos;re missing?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          The best tailors in Delhi have no website and no marketing. Word of
          mouth is how anyone finds them — so tell us who you&apos;d recommend
          and we&apos;ll go verify them.
        </p>

        <div className="mt-8">
          <SimpleForm
            endpoint="/api/v1/suggestions"
            submitLabel="Send suggestion"
            successTitle="Thank you"
            successBody="We'll verify the details and add them. Good listings usually go live within a week."
            fields={[
              { name: "name", label: "Shop name", required: true },
              {
                name: "category",
                label: "What kind of shop?",
                type: "select",
                required: true,
                options: CATEGORIES.map((c) => ({
                  value: c.slug,
                  label: c.name,
                })),
              },
              {
                name: "city",
                label: "City",
                required: true,
                placeholder: "Delhi, Gurugram, Noida…",
              },
              {
                name: "locality",
                label: "Locality or market",
                placeholder: "e.g. Lajpat Nagar Central Market",
              },
              { name: "address", label: "Address", type: "textarea" },
              { name: "phone", label: "Their phone number", type: "tel" },
              {
                name: "notes",
                label: "What are they good at?",
                type: "textarea",
                placeholder:
                  "e.g. best blouse fitting in the market, does same-day alterations",
              },
            ]}
          />
        </div>
      </div>
    </Container>
  );
}
