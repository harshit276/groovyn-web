import type { Metadata } from "next";

import {
  A,
  PageBody,
  PageHero,
  Section,
} from "@/components/content-page";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";
import { openGraphFor } from "@/lib/seo";
import { POLICIES_UPDATED, site } from "@/lib/site";

const TITLE = "Frequently Asked Questions";
const DESCRIPTION =
  "Answers about Groovyn: how visit requests work, who sees your number, how shops are ranked, how accurate the measurement scan is, and which cities we cover.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: openGraphFor({
    title: `${TITLE} | ${site.name}`,
    description: DESCRIPTION,
    url: "/faq",
  }),
};

// Answers are plain text on purpose: the page and its FAQ markup must say
// exactly the same thing, and the audit script checks that they do.
const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Groovyn?",
    a: "Groovyn is a free directory of tailors, boutiques, fabric shops and rental shops in Delhi NCR. You can compare shops, see Google ratings and starting prices where we have them, and request a free visit.",
  },
  {
    q: "Is Groovyn free, and how does it make money?",
    a: "It is free. Searching, using the measurement scan and requesting a visit cost nothing, and shops are listed for free. Groovyn does not charge anyone today, and shops cannot pay to rank higher.",
  },
  {
    q: "How does requesting a visit work?",
    a: "Pick a shop, tell us your name, number and when you would like to go, and send the request. We pass it to that shop, which confirms or suggests another time. A request is not a confirmed appointment until the shop agrees.",
  },
  {
    q: "Who sees my phone number?",
    a: "Only the shop you ask for a visit and the Groovyn team. We never sell it and never share it with advertisers.",
  },
  {
    q: "How do you decide which shops come first?",
    a: "Shops we have confirmed come first. The rest are ordered by Google rating, adjusted so that a few reviews cannot beat many. Nobody can pay to move up. The full method is on the How we rank page.",
  },
  {
    q: "Are the prices real?",
    a: "Prices say where they came from. A shop's own rate card carries its date. A range marked indicative is our research, not a quote. For a shop that has given us no prices, we show typical prices for shops of its kind in the city, and say so. Always confirm the price with the shop.",
  },
  {
    q: "How accurate is the measurement scan?",
    a: "It gives estimates. We have tested the calculations on computer-made bodies but not yet against a tape measure on many real people, so treat the numbers as a starting point and ask your tailor to confirm them.",
  },
  {
    q: "Do you keep my photos or camera images?",
    a: "No. The scan runs on your phone and the camera frames are discarded. Only the resulting numbers are saved, in your own browser, and they reach us only if you attach them to a visit request.",
  },
  {
    q: "Which cities do you cover?",
    a: "Delhi NCR: Delhi, Gurugram and Noida. Most listings are in Delhi today, and we add areas as we can check shops properly.",
  },
  {
    q: "My shop is listed. How do I correct or remove it?",
    a: "Email us the page address and what should change, or ask us to remove the listing. We will check that you run the shop first.",
  },
  {
    q: "How do I suggest a shop?",
    a: "Use the suggest a shop page with the shop's name, area and phone number. We check each one before listing it.",
  },
  {
    q: "A detail on a page is wrong. What should I do?",
    a: "Email us the page address and what is wrong. We check it and fix it.",
  },
  {
    q: "Do you sell clothes or stitch them?",
    a: "No. We list shops. Some boutiques also show a few pieces from their own online shop, with their permission, and the Buy button takes you to that shop's website. Any order or payment is between you and the shop.",
  },
];

export default function FaqPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions"
        lead="Short answers about visits, privacy, prices, rankings and the measurement scan."
        crumbs={crumbs}
      />

      <PageBody>
        <div className="divide-y divide-ink-100">
          {FAQS.map((f) => (
            <div key={f.q} className="py-6 first:pt-0">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-ink-950">
                {f.q}
              </h2>
              <p className="mt-2">{f.a}</p>
            </div>
          ))}
        </div>

        <Section id="more" title="More help">
          <p>
            <A href="/how-we-rank">How we rank</A>, <A href="/privacy">Privacy
            Policy</A>, <A href="/terms">Terms of Use</A>,{" "}
            <A href="/refund-policy">Cancellations and Refunds</A>,{" "}
            <A href="/suggest">Suggest a shop</A>, <A href="/measurements">the
            measurement scan</A> and <A href="/contact">Contact</A>.
          </p>
        </Section>
      </PageBody>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          faqSchema(FAQS),
          webPageSchema({
            type: "WebPage",
            name: TITLE,
            description: DESCRIPTION,
            path: "/faq",
            dateModified: POLICIES_UPDATED.iso,
          }),
        ]}
      />
    </>
  );
}
