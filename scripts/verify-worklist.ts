// tsx does not load .env the way Next.js does — load it explicitly.
import "dotenv/config";

/**
 * Generates the field-work call list.
 *
 *   npm run worklist            print to stdout
 *   npm run worklist -- --out data/worklist.md
 *
 * Researched listings are a starting point, not a product. This ranks what to
 * phone first, and every call is also the rate-card conversation — which is the
 * only thing that turns a directory into something a competitor can't copy.
 */
import { writeFileSync } from "node:fs";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");

const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

/** No digit anywhere usually means we only captured a locality, not an address. */
function hasStreetNumber(address: string): boolean {
  return /\d/.test(address);
}

type Gap = { label: string; weight: number };

function gapsFor(s: {
  phone: string | null;
  address: string;
  openingHours: string;
  verified: boolean;
  rateCardVerified: boolean;
  priceItems: { source: string }[];
}): Gap[] {
  const gaps: Gap[] = [];

  if (!hasStreetNumber(s.address)) {
    // Worst case: a listing nobody can act on.
    gaps.push({ label: "no street address", weight: 5 });
  }
  if (!s.phone) gaps.push({ label: "no phone", weight: 4 });

  let hours: Record<string, string> = {};
  try {
    hours = JSON.parse(s.openingHours);
  } catch {
    /* treat as missing */
  }
  if (!Object.keys(hours).length) gaps.push({ label: "no hours", weight: 2 });

  if (!s.rateCardVerified) {
    const onlyEstimates =
      s.priceItems.length > 0 && s.priceItems.every((p) => p.source === "estimate");
    gaps.push({
      label: onlyEstimates ? "prices are estimates only" : "no rate card",
      weight: 3,
    });
  }
  if (!s.verified) gaps.push({ label: "unverified", weight: 1 });

  return gaps;
}

async function main() {
  const outFlag = process.argv.indexOf("--out");
  const outPath = outFlag > -1 ? process.argv[outFlag + 1] : null;

  const stores = await db.store.findMany({
    include: {
      city: { select: { name: true } },
      locality: { select: { name: true } },
      priceItems: { select: { source: true } },
    },
    orderBy: { name: "asc" },
  });

  const rows = stores
    .map((s) => {
      const gaps = gapsFor(s);
      return {
        name: s.name,
        where: [s.locality?.name, s.city.name].filter(Boolean).join(", "),
        category: s.category,
        phone: s.phone,
        address: s.address,
        gaps,
        score: gaps.reduce((n, g) => n + g.weight, 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const callable = rows.filter((r) => r.phone);
  const unreachable = rows.filter((r) => !r.phone);
  const noAddress = rows.filter((r) => r.gaps.some((g) => g.label === "no street address"));

  const lines: string[] = [];
  lines.push("# Field-work call list\n");
  lines.push(
    `${stores.length} listings. ${callable.length} have a phone number and can be called today. ` +
      `${unreachable.length} need a number found first. ${noAddress.length} have no usable street address.\n`
  );
  lines.push(
    "Ask for two things on every call: **confirm the address**, and **ask them to WhatsApp their rate list**. " +
      "The second is what no competitor has.\n"
  );

  lines.push("\n## Call these first\n");
  lines.push("| Shop | Where | Category | Phone | Missing |");
  lines.push("|---|---|---|---|---|");
  for (const r of callable.slice(0, 40)) {
    lines.push(
      `| ${r.name} | ${r.where} | ${r.category} | ${r.phone} | ${r.gaps.map((g) => g.label).join(", ")} |`
    );
  }

  if (unreachable.length) {
    lines.push("\n## No phone number yet — find one before calling\n");
    lines.push("| Shop | Where | Address as recorded |");
    lines.push("|---|---|---|");
    for (const r of unreachable) {
      lines.push(`| ${r.name} | ${r.where} | ${r.address} |`);
    }
  }

  if (noAddress.length) {
    lines.push("\n## No street address — do not publish until confirmed\n");
    lines.push(
      "These record only a locality. On a directory that is close to useless, " +
        "and it emits as `streetAddress` in structured data.\n"
    );
    for (const r of noAddress) {
      lines.push(`- **${r.name}** (${r.where}) — recorded as "${r.address}"`);
    }
  }

  const output = lines.join("\n") + "\n";

  if (outPath) {
    writeFileSync(outPath, output);
    console.log(`Wrote ${outPath} (${stores.length} listings).`);
  } else {
    console.log(output);
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await db.$disconnect();
  process.exitCode = 1;
});
