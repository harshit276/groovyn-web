import { BadgeCheck, ImagePlus, ReceiptText, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

import { SimpleForm } from "@/components/simple-form";
import { Container } from "@/components/ui/container";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Claim your shop listing — free, forever",
  description:
    "Own a tailoring shop, boutique, fabric store or rental business in Delhi NCR? Claim your free Groovyn listing to manage your photos, price list and timings.",
  alternates: { canonical: "/claim" },
};

const BENEFITS = [
  {
    icon: ReceiptText,
    title: "Publish your rate card",
    body: "Customers arrive knowing your prices, so you stop repeating the same quote twenty times a day.",
  },
  {
    icon: ImagePlus,
    title: "Show your actual work",
    body: "Upload photos of garments you've made — not a shopfront shot. Craft sells itself.",
  },
  {
    icon: TrendingUp,
    title: "Get found for what you do",
    body: "Rank for the specific things you're good at: bridal lehengas, canvassed suits, same-day alterations.",
  },
  {
    icon: BadgeCheck,
    title: "No paid rankings, ever",
    body: "We don't sell placement and we don't sell your customers' phone numbers to your competitors.",
  },
];

export default async function ClaimPage({ searchParams }: PageProps<"/claim">) {
  const sp = await searchParams;
  const storeSlug = Array.isArray(sp.store) ? sp.store[0] : sp.store;

  const store = storeSlug
    ? await db.store.findUnique({
        where: { slug: storeSlug },
        select: { name: true, slug: true },
      })
    : null;

  return (
    <Container className="py-12">
      <div className="grid gap-12 lg:grid-cols-[1fr_28rem]">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            For shop owners
          </p>
          <h1 className="text-3xl text-ink-900 sm:text-5xl">
            {store ? (
              <>
                Claim <span className="italic text-brand-500">{store.name}</span>
              </>
            ) : (
              <>
                Your listing is free.
                <br />
                It always will be.
              </>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
            We list shops whether or not they sign up — because customers need a
            straight answer about who does what and at what price. Claiming just
            means you get to control what we show.
          </p>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li key={b.title}>
                <b.icon aria-hidden className="size-5 text-brand-500" />
                <h2 className="mt-3 text-base text-ink-900">{b.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                  {b.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SimpleForm
            endpoint="/api/v1/claims"
            submitLabel="Claim this listing"
            successTitle="Claim received"
            successBody="We'll call you within two working days to verify you run the shop, then hand over the listing."
            hidden={store ? { storeSlug: store.slug } : undefined}
            fields={[
              ...(store
                ? []
                : ([
                    {
                      name: "storeSlug",
                      label: "Shop name or listing URL",
                      required: true,
                      placeholder: "e.g. Sharma Tailors, Lajpat Nagar",
                    },
                  ] as const)),
              {
                name: "name",
                label: "Your name",
                required: true,
                autoComplete: "name",
              },
              {
                name: "phone",
                label: "Phone",
                type: "tel",
                required: true,
                autoComplete: "tel",
                placeholder: "10-digit mobile",
              },
              {
                name: "email",
                label: "Email",
                type: "email",
                autoComplete: "email",
              },
              {
                name: "role",
                label: "Your role",
                type: "select",
                options: [
                  { value: "owner", label: "Owner" },
                  { value: "manager", label: "Manager" },
                  { value: "staff", label: "Staff" },
                  { value: "other", label: "Other" },
                ],
              },
              {
                name: "message",
                label: "Anything we should fix on your listing?",
                type: "textarea",
                placeholder: "Wrong timings, missing services, old photos…",
              },
            ]}
          />
        </div>
      </div>
    </Container>
  );
}
