/**
 * Tells search engines that support IndexNow (Bing, Yandex and others) about
 * every URL in the live sitemap, so new and changed pages are crawled in hours
 * instead of weeks. Bing also feeds Copilot and some AI answers.
 *
 *   npm run indexnow                          the live site
 *   node scripts/indexnow.mjs https://...     another origin
 *   node scripts/indexnow.mjs --dry-run       show what would be sent
 *
 * Google does not use IndexNow. For Google, keep the sitemap submitted in
 * Search Console and use URL Inspection, "Request indexing", for the few pages
 * that matter most (Google allows about ten a day).
 *
 * The key is not a secret: the protocol requires it to be published at
 * /<key>.txt so the search engine can check that you control the site.
 */
import fs from "node:fs";
import path from "node:path";

const MEANING = {
  200: "accepted",
  202: "accepted; the key is still being checked",
  400: "bad request",
  403: "key not valid",
  422: "a URL does not belong to the host, or the key does not match",
  429: "too many requests; try again later",
};

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const origin = (args.find((a) => a.startsWith("http")) ?? "https://www.groovyn.com").replace(/\/$/, "");
  const host = new URL(origin).host;

  const publicDir = path.join(process.cwd(), "public");
  const keyFile = fs.readdirSync(publicDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (!keyFile) {
    console.error("No IndexNow key file found in public/ (a 32-character hex name ending in .txt).");
    return 1;
  }
  const key = keyFile.replace(/\.txt$/, "");
  const keyLocation = `${origin}/${keyFile}`;

  // The search engine fetches the key file to verify ownership, so it has to
  // be live before anything is submitted.
  const keyRes = await fetch(keyLocation);
  const keyBody = (await keyRes.text()).trim();
  if (!keyRes.ok || keyBody !== key) {
    console.error(`The key file is not live at ${keyLocation} (status ${keyRes.status}). Deploy first.`);
    return 1;
  }

  const sitemapRes = await fetch(`${origin}/sitemap.xml`);
  if (!sitemapRes.ok) {
    console.error(`Could not read ${origin}/sitemap.xml (status ${sitemapRes.status}).`);
    return 1;
  }
  const urls = [...(await sitemapRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => new URL(u).host === host);

  console.log(`${urls.length} URLs from ${origin}/sitemap.xml`);
  if (dryRun) {
    console.log("(dry run: nothing sent)");
    return 0;
  }

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
  });
  console.log(`IndexNow responded ${res.status}: ${MEANING[res.status] ?? "unexpected"}`);
  return res.status === 200 || res.status === 202 ? 0 : 1;
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
