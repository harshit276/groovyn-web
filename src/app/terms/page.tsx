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

// Plain-language terms written for how the site works today. Have a lawyer read
// them before you rely on them, and bump POLICIES_UPDATED in lib/site.ts when
// the text changes.

const TITLE = "Terms of Use";
const DESCRIPTION =
  "The rules for using Groovyn: what we do and do not do, how visit requests work, the limits of the measurement scan, and how disputes are handled.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: openGraphFor({
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/terms",
  }),
};

const TOC = [
  { id: "agreement", label: "Agreeing to these terms" },
  { id: "what-we-are", label: "What Groovyn is" },
  { id: "accuracy", label: "Listings, prices and ratings" },
  { id: "visits", label: "Requesting a visit" },
  { id: "scan", label: "The measurement scan" },
  { id: "your-use", label: "How you may use the site" },
  { id: "shops", label: "For shop owners" },
  { id: "ip", label: "Our content" },
  { id: "disclaimer", label: "Disclaimers" },
  { id: "liability", label: "Limits on our liability" },
  { id: "access", label: "Suspending access" },
  { id: "law", label: "Governing law" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Terms of Use", href: "/terms" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Policy"
        title="Terms of Use"
        lead="The ground rules for using Groovyn, in plain language."
        crumbs={crumbs}
        showUpdated
      />

      <PageBody toc={TOC}>
        <Section id="agreement" title="Agreeing to these terms">
          <p>
            By using Groovyn you agree to these terms and to our{" "}
            <A href="/privacy">Privacy Policy</A>. If you do not agree, please do
            not use the site. You must be 18 or over, or use the site with a
            parent or guardian.
          </p>
        </Section>

        <Section id="what-we-are" title="What Groovyn is">
          <p>
            Groovyn is an independent directory. It helps you find tailors,
            boutiques, fabric shops and rental shops in Delhi NCR, compare them,
            and ask a shop for a visit. We do not stitch, sell or rent clothes
            ourselves, and we are not a party to anything you agree with a shop.
            Any order, payment or rental is a matter between you and the shop.
          </p>
        </Section>

        <Section id="accuracy" title="Listings, prices and ratings">
          <p>
            Shop details come from the shops, from Google and from our own
            research. They can be out of date or wrong. Please confirm the
            address, timings and price with the shop before you travel or pay.
          </p>
          <Bullets>
            <li>
              A price marked as a shop’s own rate card was supplied by that shop on
              the date shown. A price marked as listed on a shop’s website is the
              shop’s own, as we found it on the date shown. Other figures are
              indicative or typical ranges from our research. They are not
              quotes.
            </li>
            <li>
              Ratings marked as Google’s belong to Google and are shown with their
              review counts. We do not change them.
            </li>
            <li>
              “Verified” means the Groovyn team checked the listing facts. It is
              not a guarantee of the shop’s work.
            </li>
          </Bullets>
          <p>
            Read how we order shops on <A href="/how-we-rank">How we rank</A>.
          </p>
        </Section>

        <Section id="visits" title="Requesting a visit">
          <p>
            A visit request is a request, not a confirmed appointment. The shop
            decides whether and when to see you, and may change or decline it.
            Groovyn does not charge you for requesting a visit and cannot promise
            availability, price or the result of the visit.
          </p>
          <p>
            Offers shown on a listing are made by the shop in its own words. Show
            the offer to the shop when you visit, and expect the shop’s own terms
            to apply.
          </p>
          <p>
            For changes, cancellations and what happens if you pay a shop, see{" "}
            <A href="/refund-policy">Cancellations and refunds</A>.
          </p>
        </Section>

        <Section id="scan" title="The measurement scan">
          <Callout>
            Scan results are estimates. They are not medical measurements, and
            they are not a substitute for a tape measure.
          </Callout>
          <p>
            The scan can be wrong, for example with loose clothing, poor light or
            an unusual pose. We have tested the calculations on computer-made
            bodies, not yet against a tape measure on many real people. Ask your
            tailor to confirm every measurement before cutting cloth. You use the
            scan at your own risk.
          </p>
        </Section>

        <Section id="your-use" title="How you may use the site">
          <p>Please do not:</p>
          <Bullets>
            <li>give false details, or pretend to be someone else;</li>
            <li>
              ask us to change a listing unless you own the shop or are
              authorised to act for it;
            </li>
            <li>
              copy listings, prices or guides in bulk, or use bots to collect or
              submit information;
            </li>
            <li>send shops spam, or use their details for anything but your request;</li>
            <li>try to break, overload or get around the security of the site.</li>
          </Bullets>
        </Section>

        <Section id="shops" title="For shop owners">
          <p>
            Listing a shop on Groovyn is free. When you ask us to change a
            listing or show an offer, you confirm that you are allowed to act for
            the shop and that what you give us is accurate. Offers you ask us to
            show must be ones you will honour.
          </p>
          <p>
            Photos and text you send remain yours. You give us a non-exclusive
            licence to show them on Groovyn and to resize them for display, and
            you confirm you have the right to do so. We may edit, hide or remove a
            listing that is wrong, misleading or unsafe. To correct or remove a
            listing, email <Email />.
          </p>
        </Section>

        <Section id="ip" title="Our content">
          <p>
            The Groovyn name, design, code and guides belong to us. You may quote
            a short extract with a link back to the page. Please do not copy whole
            pages or republish our data.
          </p>
        </Section>

        <Section id="disclaimer" title="Disclaimers">
          <p>
            The site is provided “as is”. We try to keep it accurate and
            available, but we do not promise that it will be free of errors or
            interruptions. We do not control, and are not responsible for, the
            quality, price, timing or conduct of any shop, or for other sites we
            link to.
          </p>
        </Section>

        <Section id="liability" title="Limits on our liability">
          <p>
            To the extent the law allows, we are not liable for indirect or
            consequential losses, or for anything a shop does or fails to do.
            Nothing in these terms limits any right you have as a consumer or any
            liability that cannot be limited by law.
          </p>
        </Section>

        <Section id="access" title="Suspending access">
          <p>
            We may limit or stop access to the site for anyone who breaks these
            terms or misuses the service.
          </p>
        </Section>

        <Section id="law" title="Governing law">
          <p>
            These terms are governed by the laws of India. Courts in{" "}
            {site.address.locality}, {site.address.region} have jurisdiction,
            without taking away any right you have to go to the court or forum
            that applies to you as a consumer.
          </p>
        </Section>

        <Section id="changes" title="Changes">
          <p>
            We may update these terms. The date at the top shows the last
            revision, which was {POLICIES_UPDATED.label}. Using the site after a
            change means you accept the new version.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <p>
            Questions about these terms: <Email />. Groovyn, {site.address.locality},{" "}
            {site.address.region}, {site.address.country}. More ways to reach us
            are on the <A href="/contact">contact page</A>.
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
            path: "/terms",
            dateModified: POLICIES_UPDATED.iso,
          }),
        ]}
      />
    </>
  );
}
