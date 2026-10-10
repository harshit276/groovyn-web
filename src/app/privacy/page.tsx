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

// This page is a plain-language policy written for how the site works today.
// Have a lawyer read it before you rely on it, and update it (and
// POLICIES_UPDATED in lib/site.ts) whenever the site starts collecting
// something new, for example analytics.

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "How Groovyn collects, uses and protects your information: visit requests, the on-device measurement scan, cookies, your rights and how to reach us.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: openGraphFor({
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/privacy",
  }),
};

const TOC = [
  { id: "short", label: "The short version" },
  { id: "who", label: "Who we are" },
  { id: "collect", label: "What we collect and why" },
  { id: "scan", label: "The measurement scan" },
  { id: "share", label: "Who we share it with" },
  { id: "cookies", label: "Cookies and local storage" },
  { id: "third-parties", label: "Google, maps and other links" },
  { id: "consent", label: "Consent" },
  { id: "keep", label: "How long we keep it" },
  { id: "rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "security", label: "Security" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact and complaints" },
];

export default function PrivacyPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Policy"
        title="Privacy Policy"
        lead="What we collect, why, who sees it, and how to ask us to change or delete it."
        crumbs={crumbs}
        showUpdated
      />

      <PageBody toc={TOC}>
        <Section id="short" title="The short version">
          <Bullets>
            <li>We collect only what a feature needs to work.</li>
            <li>
              Your phone number goes to the shop you choose and to our team. We
              never sell it and never share it with advertisers.
            </li>
            <li>
              The measurement scan runs on your phone. Photos and video frames
              from the camera are not uploaded or kept.
            </li>
            <li>
              We use no advertising or tracking cookies. We count visits with
              privacy-friendly analytics that does not follow you across sites.
            </li>
            <li>
              You can ask us to correct or delete your information at any time at{" "}
              <Email />.
            </li>
          </Bullets>
        </Section>

        <Section id="who" title="Who we are">
          <p>
            Groovyn (“we”, “us”) runs {site.url.replace(/^https?:\/\//, "")}, a
            free directory of tailors, boutiques, fabric shops and rental shops
            in Delhi NCR. We are based in {site.address.locality},{" "}
            {site.address.region}, {site.address.country}.
          </p>
          <p>
            For the information described here, we decide why and how it is used,
            which makes us the “data fiduciary” under India’s Digital Personal
            Data Protection Act, 2023. You are the “data principal”.
          </p>
        </Section>

        <Section id="collect" title="What we collect and why">
          <p>Here is everything we collect, by feature.</p>
          <Bullets>
            <li>
              <strong>Visit requests.</strong> Your name, mobile number,
              preferred date and time, what you need, any notes, and the page you
              booked from. If you choose to attach your measurements, we also
              keep a copy of those numbers as they were when you booked. We use
              this to pass your request to the shop you picked, to contact you
              about it, and to look after bookings.
            </li>
            <li>
              <strong>Shop owners.</strong> If you write to us about a listing,
              your name, phone number or email, your role, and any offer or
              message you add. We use this to check that you run the shop and to
              update the listing.
            </li>
            <li>
              <strong>Suggesting a shop.</strong> The shop’s name, category, city,
              area, phone and address, and any note you add. We use this to check
              the shop and add it.
            </li>
            <li>
              <strong>Messages to us.</strong> If you email us, we keep your
              message and address so we can reply and keep a record.
            </li>
            <li>
              <strong>Technical data.</strong> Our hosting provider records
              standard server logs, such as your IP address, browser type, the
              pages requested and the time. This is used to deliver the site,
              keep it secure and fix faults.
            </li>
            <li>
              <strong>Visit statistics.</strong> We use Vercel Web Analytics and
              Vercel Speed Insights to count visits and to measure how fast pages
              load. They record the page viewed, the site you came from, your
              country and city, your device type, browser and operating system,
              and page-speed measurements. They do not use tracking cookies, do
              not follow you across other sites and do not record your name or
              phone number. A visitor is told apart from others by a code that is
              discarded after 24 hours. We use this to see what is useful and what
              is slow.
            </li>
            <li>
              <strong>Taps on a shop’s Buy button.</strong> Some boutiques show a
              few pieces on their page. When you tap one, we add one to a count
              for that piece, so we can tell the shop what we send it, and then
              send you to the shop’s own website. The count holds no name, number
              or device details. Once you are on the shop’s site, its own privacy
              policy applies.
            </li>
          </Bullets>
          <p>
            Some things stay on your own device and are not sent to us: the shops
            you save, your saved measurement profile, and a small flag that makes
            the shop-door animation play once per visit.
          </p>
        </Section>

        <Section id="scan" title="The measurement scan">
          <p>
            The scan uses your camera only while you run it, and only after your
            browser asks for and receives your permission. The pose-detection
            model is downloaded to your device and runs in your browser. We do
            not receive, upload or store photos or video from the scan.
          </p>
          <p>
            The scan produces numbers, such as chest and waist. They are saved in
            your browser so you can reuse them. They reach us only if you attach
            them to a visit request, and then they are shared with that shop like
            any other booking detail. You can remove the saved profile with the
            “Delete from this device” button on the{" "}
            <A href="/measurements">measurements page</A>, or by clearing this
            site’s data in your browser.
          </p>
          <p>
            Scan results are estimates. See the <A href="/terms">Terms</A> for
            what that means.
          </p>
        </Section>

        <Section id="share" title="Who we share it with">
          <Bullets>
            <li>
              <strong>The shop you choose.</strong> When you request a visit, we
              give that shop your name, number, request and, if you attached
              them, your measurements.
            </li>
            <li>
              <strong>Companies that run the site for us.</strong> Our hosting
              provider, which also provides our visit statistics, and our
              database provider process data on our behalf. They may do so on
              servers outside India.
            </li>
            <li>
              <strong>Authorities.</strong> If the law requires it, or to protect
              people’s safety or our legal rights.
            </li>
            <li>
              <strong>A successor.</strong> If the business is ever sold or
              merged, the information may move with it, under this policy.
            </li>
          </Bullets>
          <Callout>
            We do not sell personal information, and we do not give it to
            advertisers.
          </Callout>
        </Section>

        <Section id="cookies" title="Cookies and local storage">
          <p>
            We do not use advertising, analytics or tracking cookies. A sign-in
            cookie is set only for our own staff. The features listed above use
            your browser’s local storage, which you can clear in your browser
            settings at any time.
          </p>
          <p>
            Visit statistics are collected without cookies, as described above.
            If we add any other kind of tracking in future, we will say so on this
            page first.
          </p>
        </Section>

        <Section id="third-parties" title="Google, maps and other links">
          <p>
            Ratings and some shop details come from Google and are shown with
            attribution. Links to Google Maps, WhatsApp, Instagram and shops’ own
            websites take you off Groovyn, and those services’ own privacy
            policies apply there.
          </p>
        </Section>

        <Section id="consent" title="Consent">
          <p>
            We rely on your consent, which you give when you submit a form or
            choose to attach your measurements. We may also use information where
            the law allows it without consent, for example to answer a request you
            made.
          </p>
          <p>
            You can withdraw consent at any time by emailing <Email />.
            Withdrawing does not undo what we already did with your information,
            and we may no longer be able to act on a request that needed it.
          </p>
        </Section>

        <Section id="keep" title="How long we keep it">
          <p>
            We keep visit requests, shop owners’ messages and suggestions for as long as we need
            to handle them, settle any dispute and meet legal obligations. After
            that we delete or anonymise them. You can ask us to delete yours
            sooner. Our hosting provider keeps server logs for a short period.
          </p>
        </Section>

        <Section id="rights" title="Your rights">
          <p>You can ask us to:</p>
          <Bullets>
            <li>tell you what information we hold about you and how we use it;</li>
            <li>correct or update it;</li>
            <li>delete it;</li>
            <li>stop using it, by withdrawing your consent;</li>
            <li>
              deal with a complaint (see below), or let a person you name act for
              you if you cannot.
            </li>
          </Bullets>
          <p>
            Email <Email /> from the address or phone number you used, so we can
            confirm it is you. We reply within two working days and aim to finish
            your request within 15 days. If you are not satisfied, you may also
            complain to the Data Protection Board of India where the law allows.
          </p>
        </Section>

        <Section id="children" title="Children">
          <p>
            Groovyn is meant for adults. We do not knowingly collect information
            from anyone under 18. A parent or guardian who books for a child is
            responsible for the details they give. If you think a child has sent
            us information, email us and we will delete it.
          </p>
        </Section>

        <Section id="security" title="Security">
          <p>
            The site uses HTTPS. Access to bookings is limited to our staff and
            protected by a sign-in. No system is perfectly secure, so please tell
            us at <Email /> if you notice a problem. If a breach affects you, we
            will tell you and the authorities as the law requires.
          </p>
        </Section>

        <Section id="changes" title="Changes to this policy">
          <p>
            We will update this page when the site changes what it collects. The
            date at the top shows the last revision, which was{" "}
            {POLICIES_UPDATED.label}.
          </p>
        </Section>

        <Section id="contact" title="Contact and complaints">
          <p>
            Grievance Officer, Groovyn, {site.address.locality},{" "}
            {site.address.region}, {site.address.country}.
          </p>
          <p>
            Email: <Email />. See also our <A href="/contact">contact page</A> and{" "}
            <A href="/terms">Terms</A>.
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
            path: "/privacy",
            dateModified: POLICIES_UPDATED.iso,
          }),
        ]}
      />
    </>
  );
}
