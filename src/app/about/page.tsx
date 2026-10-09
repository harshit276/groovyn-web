import type { Metadata } from "next";

import {
  A,
  Bullets,
  PageBody,
  PageHero,
  Section,
} from "@/components/content-page";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { openGraphFor } from "@/lib/seo";
import { POLICIES_UPDATED, site } from "@/lib/site";

const TITLE = "About Us and How Groovyn Works";
const DESCRIPTION =
  "Groovyn is a free directory of tailors, boutiques, fabric shops and rental stores in Delhi NCR. What we do, the principles we follow, and who to contact.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: openGraphFor({
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/about",
  }),
};

export default function AboutPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <PageHero
        eyebrow="About"
        title="About Groovyn"
        lead="A free directory of tailors, boutiques, fabric shops and rental stores in Delhi NCR, built to give a straight answer on who does what, and at what price."
        crumbs={crumbs}
      />

      <PageBody>
        <Section id="what" title="What Groovyn does">
          <p>
            Getting clothes made in Delhi still runs on word of mouth. The best
            tailors often have no website, prices are quoted at the counter, and
            the same questions go unanswered: who is good at what, what will it
            cost, and how long will it take.
          </p>
          <p>
            Groovyn puts the shops in one place. Each listing shows the address,
            the Google rating and a starting price where we have one, and you can
            ask the shop for a free visit.
          </p>
        </Section>

        <Section id="how" title="How it works">
          <Bullets>
            <li>
              <strong>Find.</strong> Browse tailors, boutiques, fabric shops and
              rental stores by area, and compare ratings and prices.
            </li>
            <li>
              <strong>Measure, if you like.</strong> Use the free{" "}
              <A href="/measurements">measurement scan</A> on your phone, or follow
              our <A href="/blog">guides</A> to take measurements with a tape.
            </li>
            <li>
              <strong>Visit.</strong> Request a free visit. We pass your request to
              the shop, which confirms a time.
            </li>
          </Bullets>
        </Section>

        <Section id="principles" title="What we stand for">
          <Bullets>
            <li>
              <strong>Rankings are not for sale.</strong> No shop can pay to rank
              higher. See <A href="/how-we-rank">how we rank</A>.
            </li>
            <li>
              <strong>Prices say where they came from.</strong> A shop’s own rate
              card is kept apart from our estimates.
            </li>
            <li>
              <strong>Your number is not for sale.</strong> It goes to the shop you
              choose and to our team, and nowhere else.
            </li>
            <li>
              <strong>Estimates are called estimates.</strong> That includes the
              measurement scan.
            </li>
            <li>
              <strong>Mistakes get fixed.</strong> If something on a page is wrong,{" "}
              <A href="/contact">tell us</A>.
            </li>
          </Bullets>
        </Section>

        <Section id="funding" title="How Groovyn is funded">
          <p>
            Today Groovyn charges nothing, to shops or to customers. If that ever
            changes, rankings will still not be for sale, and we will say so on
            this page first.
          </p>
        </Section>

        <Section id="where" title="Where we are">
          <p>
            Groovyn is based in {site.address.locality}, {site.address.region},{" "}
            {site.address.country}. We cover Delhi NCR, growing area by area, and
            we add a shop only once we can check it.
          </p>
        </Section>

        <Section id="touch" title="Get in touch">
          <p>
            Customers and shop owners are both welcome. Start with the{" "}
            <A href="/contact">contact page</A>, or{" "}
            <A href="/suggest">suggest a shop</A> we are missing. Shop owners can
            write to us to correct or remove a listing. Common questions are
            answered in the <A href="/faq">FAQ</A>.
          </p>
        </Section>
      </PageBody>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            type: "AboutPage",
            name: "About Groovyn",
            description: DESCRIPTION,
            path: "/about",
            dateModified: POLICIES_UPDATED.iso,
          }),
        ]}
      />
    </>
  );
}
