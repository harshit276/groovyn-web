import { Lock } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { MeasurementFlow } from "@/components/measurement-flow";
import { PostCard } from "@/components/blog/post-card";
import { Container } from "@/components/ui/container";
import { getPost } from "@/content/blog";
import { breadcrumbSchema, measurementToolSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Free Online Body Measurement: Scan With Your Phone",
  description:
    "Get your body measurements online from two photos on your phone camera. Free, for men and women, and nothing is uploaded. Share them with any tailor on Groovyn.",
  alternates: { canonical: "/measurements" },
};

// Guides for people who would rather use a tape, or want to know how far to
// trust a phone. They are the same cluster the tool belongs to, so they link back.
const GUIDE_SLUGS = [
  "how-to-take-body-measurements-at-home",
  "online-body-measurement-how-accurate",
  "how-to-measure-for-a-blouse-at-home",
  "how-to-measure-for-a-suit-and-shirt",
];

export default function MeasurementsPage() {
  const guides = GUIDE_SLUGS.map((s) => getPost(s)).filter(
    (p): p is NonNullable<typeof p> => !!p
  );
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Measurements", href: "/measurements" },
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
            Free · No sign-up
          </p>

          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl">
            Know your measurements
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
            Two photos from your phone, and you never guess a size again. Share
            them with any tailor on Groovyn when you book a visit.
          </p>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/70 backdrop-blur-sm">
            <Lock aria-hidden className="size-3.5 text-emerald-400" />
            Photos never leave your phone
          </p>
        </div>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <MeasurementFlow />

          <div className="mt-10 rounded-3xl border border-ink-100 bg-ink-50 p-6">
            <h2 className="font-display text-base font-bold text-ink-950">
              How accurate is it, honestly?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              We haven&rsquo;t measured it yet. Published work on similar
              two-photo methods reports roughly 2&ndash;3 cm on girths like
              chest and waist, but that is other people&rsquo;s systems, not a
              test of this one &mdash; so treat every number here as a starting
              point and nothing more.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              A tailor cutting a suit works to about half a centimetre. Three
              things move ours: how loose your clothes are, how accurate your
              stated height is (2 cm out shifts your chest by about 1 cm), and
              how still you stand. Bust is the least reliable of them, because
              that cross-section is furthest from the ellipse the maths assumes.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              That is why every value is labelled by where it came from, and why
              the profile only reads &ldquo;confirmed&rdquo; once a shop has
              checked it with a tape.
            </p>
          </div>

          <section className="mt-14">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink-950">
              Prefer a tape? Start here
            </h2>
            <p className="mt-1.5 text-ink-500">
              Step-by-step guides, in centimetres and inches.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {guides.map((g) => (
                <PostCard key={g.slug} post={g} />
              ))}
            </div>
          </section>
        </div>

        <JsonLd data={[measurementToolSchema(), breadcrumbSchema(crumbs)]} />
      </Container>
    </>
  );
}
