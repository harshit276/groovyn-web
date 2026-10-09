/**
 * Checks that search understands how shoppers type.
 *
 * Run with `npm run verify:search`. It reads the live database through the same
 * `listStores` the site uses, so it needs DATABASE_URL, and it exits non-zero if
 * a phrase that should find shops finds none.
 *
 * It exists because the first version of search looked for the whole phrase in
 * one field, so "bridal lehenga chandni chowk" returned nothing while "lehenga"
 * and "chandni chowk" each returned shops.
 */
// Must come first: the query module reads DATABASE_URL when it loads.
import "dotenv/config";

import { listStores } from "../src/lib/queries";
import { parseQuery } from "../src/lib/search-terms";

type Case = {
  q: string;
  /** The search must return at least one shop. */
  mustFind?: boolean;
  /** The search must return nothing. */
  mustBeEmpty?: boolean;
};

const CASES: Case[] = [
  { q: "bridal lehenga chandni chowk", mustFind: true },
  { q: "bandhgala tailor", mustFind: true },
  { q: "silk fabric lajpat nagar", mustFind: true },
  { q: "darzi in connaught place", mustFind: true },
  { q: "cp tailors", mustFind: true },
  { q: "lehenga on rent", mustFind: true },
  { q: "wedding tailor delhi", mustFind: true },
  { q: "tailor under 100", mustFind: true },
  { q: "best shops in delhi", mustFind: true },
  { q: "lehenga", mustFind: true },
  { q: "lehnga", mustFind: true },
  { q: "chandni chowk", mustFind: true },
  { q: "zzzzxqj", mustBeEmpty: true },
];

async function main() {
  const failures: string[] = [];

  console.log("query".padEnd(34), "shops", " note");
  for (const c of CASES) {
    const result = await listStores({ q: c.q, perPage: 48 });
    const words = parseQuery(c.q).terms.map((t) => t.label).join(" + ") || "(no words)";
    console.log(
      c.q.padEnd(34),
      String(result.total).padStart(5),
      " ",
      result.note ? "loosened" : "",
      `[${words}]`
    );

    if (c.mustFind && result.total === 0) failures.push(`"${c.q}" found nothing`);
    if (c.mustBeEmpty && result.total !== 0) failures.push(`"${c.q}" should find nothing but found ${result.total}`);
  }

  // Alternate spellings must behave like the usual one.
  const [a, b] = await Promise.all([
    listStores({ q: "lehenga", perPage: 48 }),
    listStores({ q: "ghagra", perPage: 48 }),
  ]);
  if (a.total !== b.total) failures.push(`"lehenga" (${a.total}) and "ghagra" (${b.total}) should match the same shops`);

  console.log(failures.length ? `\nFAIL\n  ${failures.join("\n  ")}` : "\nPASS");
  return failures.length ? 1 : 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    console.error(err);
    process.exitCode = 1;
  }
);
