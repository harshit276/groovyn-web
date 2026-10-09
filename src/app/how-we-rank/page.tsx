import type { Metadata } from "next";

import {
  A,
  Bullets,
  Callout,
  Email,
  PageBody,
  PageHero,
  Section,
} from "@/components/content-page";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { openGraphFor } from "@/lib/seo";
import { POLICIES_UPDATED, site } from "@/lib/site";

// This page describes src/lib/ranking.ts. If the ranking changes, change this
// page in the same commit, and bump POLICIES_UPDATED in lib/site.ts.

const TITLE = "How We Rank Shops and Check Facts";
const DESCRIPTION =
  "How Groovyn orders tailors, boutiques and fabric shops: Google ratings adjusted for review count, no paid placement, and where our prices and facts come from.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/how-we-rank" },
  openGraph: openGraphFor({
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/how-we-rank",
  }),
};

const TOC = [
  { id: "short", label: "The short answer" },
  { id: "order", label: "The default order" },
  { id: "adjusted", label: "Why we adjust for review count" },
  { id: "sorts", label: "The other sort options" },
  { id: "sources", label: "Where our information comes from" },
  { id: "prices", label: "How prices are labelled" },
  { id: "verified", label: "What Verified means" },
  { id: "independence", label: "Independence" },
  { id: "limits", label: "What a ranking cannot tell you" },
  { id: "guides", label: "How we write the guides" },
];

export default function HowWeRankPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "How we rank", href: "/how-we-rank" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Method"
        title="How Groovyn ranks shops and checks facts"
        lead="No shop can pay to rank higher. Here is exactly how the order is decided, and where the information comes from."
        crumbs={crumbs}
        showUpdated
      />

      <PageBody toc={TOC}>
        <Section id="short" title="The short answer">
          <p>
            By default we show shops we have confirmed first. After that, shops
            are ordered by their Google rating, adjusted for how many reviews the
            rating rests on, so a handful of reviews cannot beat hundreds.
            Placement is not for sale.
          </p>
        </Section>

        <Section id="order" title="The default order">
          <p>
            On a listing page, and in “Shops worth knowing” on the home page, shops
            are sorted by these rules, in this order. A shop is placed by the first
            rule that separates it from the next.
          </p>
          <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-brand-600">
            <li>
              Shops our editors have chosen to feature. This is an editorial
              choice and is never sold.
            </li>
            <li>Shops that gave us their own rate card.</li>
            <li>Shops whose listing facts we have verified.</li>
            <li>
              Everyone else, by the adjusted Google score below. A shop with no
              Google rating comes after rated shops, and ties go in alphabetical
              order.
            </li>
          </ol>
        </Section>

        <Section id="adjusted" title="Why we adjust for review count">
          <p>
            Sorting by stars alone is misleading. A shop with a single five-star
            review would beat one with 653 reviews at 4.8. So each shop’s rating is
            pulled towards the average of the shops it is compared with, and the
            fewer reviews it has, the harder it is pulled.
          </p>
          <p>
            <code className="rounded bg-ink-100 px-2 py-1 text-[15px] text-ink-900">
              score = (v ÷ (v + 50)) × R + (50 ÷ (v + 50)) × C
            </code>
          </p>
          <Bullets>
            <li>R is the shop’s Google rating and v is its number of Google reviews.</li>
            <li>C is the average rating of the shops being compared.</li>
            <li>50 is how many reviews it takes for a shop’s own rating to outweigh that average.</li>
          </Bullets>
          <Callout>
            <p className="font-semibold">An example</p>
            <p className="mt-1">
              If the average shop is rated 4.4, a shop with 4.8 from 653 reviews
              scores 4.77. A shop with 5.0 from 2 reviews scores 4.42. The first
              ranks higher, because its rating rests on far more evidence.
            </p>
          </Callout>
        </Section>

        <Section id="sorts" title="The other sort options">
          <p>
            “Top rated on Google” uses only the adjusted score above, with none
            of the confirmation rules. Price and name sorts do what they say.
          </p>
        </Section>

        <Section id="sources" title="Where our information comes from">
          <Bullets>
            <li>
              <strong>The shops themselves,</strong> through the rate cards and
              offers they give us.
            </li>
            <li>
              <strong>Google,</strong> for ratings, review counts and some
              details. These are shown as Google’s and refreshed from time to
              time.
            </li>
            <li>
              <strong>Our own checks,</strong> by phone and in person.
            </li>
            <li>
              <strong>Suggestions from the public,</strong> which we check before a
              shop is listed.
            </li>
          </Bullets>
        </Section>

        <Section id="prices" title="How prices are labelled">
          <Bullets>
            <li>
              <strong>A shop’s own rate card,</strong> with the date it was given.
            </li>
            <li>
              <strong>Prices on the shop’s own website,</strong> marked as such
              and with the date we checked them.
            </li>
            <li>
              <strong>An indicative range,</strong> which is our own research. It is
              not a quote.
            </li>
            <li>
              <strong>Typical prices in the city,</strong> shown for a shop that
              has given us no prices, as ranges for shops of its kind. They are
              not that shop’s prices, and premium or designer shops often charge
              more.
            </li>
          </Bullets>
          <p>
            We never show an estimate as if the shop had said it. Always confirm a
            price with the shop.
          </p>
        </Section>

        <Section id="verified" title="What Verified means">
          <p>
            A Verified listing is one whose facts, such as the address and phone
            number, the Groovyn team has checked. It is not a guarantee of the
            quality of a shop’s work.
          </p>
        </Section>

        <Section id="independence" title="Independence">
          <Bullets>
            <li>We do not take money for placement, ratings or guides.</li>
            <li>We do not earn commission on what you buy from a shop.</li>
            <li>Shops cannot change their Google rating, and we do not change it either.</li>
          </Bullets>
          <p>
            If we ever offer paid placement, it will be labelled “Sponsored” and
            kept out of these rankings.
          </p>
        </Section>

        <Section id="limits" title="What a ranking cannot tell you">
          <p>
            A rating is one signal. A skilled tailor with few reviews can be
            better than a popular one with many, and a rating cannot say whether a
            shop suits your outfit or budget. Use the order as a starting point,
            then confirm the details with the shop. If you spot a wrong detail,
            email <Email /> and we will check it.
          </p>
        </Section>

        <Section id="guides" title="How we write the guides">
          <p>
            In our <A href="/blog">guides</A> we say where a figure came from,
            label estimates as estimates, show when a guide was last updated, and
            correct mistakes quickly when readers point them out.
          </p>
          <p>
            More about us is on the <A href="/about">About page</A>.
          </p>
        </Section>
      </PageBody>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            type: "WebPage",
            name: TITLE,
            description: DESCRIPTION,
            path: "/how-we-rank",
            dateModified: POLICIES_UPDATED.iso,
          }),
        ]}
      />
    </>
  );
}
