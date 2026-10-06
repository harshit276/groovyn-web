import { Mail } from "lucide-react";
import type { Metadata } from "next";

import {
  A,
  Bullets,
  Email,
  PageBody,
  PageHero,
  Section,
} from "@/components/content-page";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";
import { openGraphFor } from "@/lib/seo";
import { POLICIES_UPDATED, site } from "@/lib/site";

const TITLE = "Contact Us";
const DESCRIPTION =
  "Contact Groovyn by email for booking help, corrections to a listing, shop owner requests, privacy requests and complaints. We reply within two working days.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: openGraphFor({
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/contact",
  }),
};

export default function ContactPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact Groovyn"
        lead="Questions, corrections, shop listings and privacy requests all start with an email."
        crumbs={crumbs}
      />

      <PageBody>
        <Section id="email" title="Email us">
          <p className="flex items-center gap-3 text-xl">
            <Mail aria-hidden className="size-6 shrink-0 text-brand-500" />
            <Email />
          </p>
          <p>
            We reply within two working days. Please include the page address or
            the shop’s name, so we can find it quickly.
          </p>
        </Section>

        <Section id="topics" title="What to write to us about">
          <Bullets>
            <li>
              <strong>Help with a visit request,</strong> or a visit you want to
              cancel. Give the shop’s name and the phone number you used.
            </li>
            <li>
              <strong>A wrong detail on a listing,</strong> such as the address,
              timings or price. Send the page address and what should change.
            </li>
            <li>
              <strong>Shop owners:</strong> to take over a listing,{" "}
              <A href="/claim">use the claim form</A>. To change or remove one,
              email us.
            </li>
            <li>
              <strong>Privacy requests,</strong> such as seeing, correcting or
              deleting your information. See the{" "}
              <A href="/privacy">Privacy Policy</A>.
            </li>
            <li>
              <strong>Press and partnerships.</strong>
            </li>
          </Bullets>
          <p>
            Many answers are already in the <A href="/faq">FAQ</A>.
          </p>
        </Section>

        <Section id="where" title="Where we are">
          <p>
            Groovyn, {site.address.locality}, {site.address.region},{" "}
            {site.address.country}.
          </p>
        </Section>

        <Section id="grievance" title="Grievance officer">
          <p>
            To make a complaint about the site, a listing or how your information
            is handled, write to the Grievance Officer, Groovyn, at <Email />. We
            reply within two working days and aim to resolve complaints within 15
            days.
          </p>
          <p>
            See also the <A href="/terms">Terms of Use</A> and{" "}
            <A href="/refund-policy">Cancellations and Refunds</A>.
          </p>
        </Section>
      </PageBody>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          webPageSchema({
            type: "ContactPage",
            name: TITLE,
            description: DESCRIPTION,
            path: "/contact",
            dateModified: POLICIES_UPDATED.iso,
          }),
        ]}
      />
    </>
  );
}
