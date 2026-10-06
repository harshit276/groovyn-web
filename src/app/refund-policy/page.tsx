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

// Groovyn takes no payments today, so this page mostly explains that and what to
// do when you have paid a shop. If the site ever starts charging for anything,
// this page must say how refunds work before the first charge.

const TITLE = "Cancellations and Refunds";
const DESCRIPTION =
  "Groovyn is free to use, so there is nothing to refund. How to cancel a visit request, and what to do if you have paid a shop and something goes wrong.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/refund-policy" },
  openGraph: openGraphFor({
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/refund-policy",
  }),
};

const TOC = [
  { id: "free", label: "Groovyn is free" },
  { id: "cancel", label: "Cancelling a visit request" },
  { id: "shops", label: "If you pay a shop" },
  { id: "wrong", label: "If something goes wrong" },
  { id: "future", label: "If this ever changes" },
];

export default function RefundPolicyPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Cancellations and Refunds", href: "/refund-policy" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Policy"
        title="Cancellations and Refunds"
        lead="We charge nothing, so there is nothing to refund. Here is what to do about a visit you no longer want, or a payment to a shop."
        crumbs={crumbs}
        showUpdated
      />

      <PageBody toc={TOC}>
        <Section id="free" title="Groovyn is free">
          <p>
            Searching, comparing shops, using the measurement scan and requesting
            a visit are all free. We do not take payment on Groovyn for any of
            this, so there is no fee to cancel and no refund to ask us for.
          </p>
        </Section>

        <Section id="cancel" title="Cancelling a visit request">
          <p>
            If you no longer want a visit, tell the shop, or email <Email /> with
            the shop’s name and the phone number you used, and we will pass the
            cancellation on. Groovyn charges nothing for cancelling.
          </p>
        </Section>

        <Section id="shops" title="If you pay a shop">
          <p>
            Anything you pay for stitching, fabric, alterations or a rental is paid
            to the shop, under the shop’s own terms. Groovyn does not collect or
            hold that money and cannot refund it on the shop’s behalf.
          </p>
          <p>Before you pay, ask the shop, and ideally get it in writing:</p>
          <Bullets>
            <li>the total price, and how much is an advance;</li>
            <li>the delivery date, and what happens if it is late;</li>
            <li>whether one round of alterations is included, and what extra ones cost;</li>
            <li>for rentals, the deposit and what it is returned against;</li>
            <li>the shop’s cancellation and refund rules.</li>
          </Bullets>
          <p>Keep the receipt and any messages.</p>
        </Section>

        <Section id="wrong" title="If something goes wrong">
          <Bullets>
            <li>Talk to the shop first, calmly, with your receipt and the details.</li>
            <li>
              If that does not work, email <Email /> with the shop’s name, what
              happened and what you would like to happen. We will pass it to the
              shop and tell you what we hear back. We cannot force a shop to
              refund you, but we take complaints seriously and may change or
              remove a listing because of them.
            </li>
            <li>
              For a dispute you cannot settle, you can contact the National
              Consumer Helpline on 1915.
            </li>
          </Bullets>
        </Section>

        <Section id="future" title="If this ever changes">
          <Callout>
            If Groovyn ever charges for something, we will explain the price and
            the refund rules here before the first charge.
          </Callout>
          <p>
            Related pages: <A href="/terms">Terms of Use</A>,{" "}
            <A href="/privacy">Privacy Policy</A> and{" "}
            <A href="/contact">Contact</A>.
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
            path: "/refund-policy",
            dateModified: POLICIES_UPDATED.iso,
          }),
        ]}
      />
    </>
  );
}
