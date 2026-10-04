/**
 * Captures d'une série de sites de référence, pour les relire côte à côte.
 *   node scripts/refs.mjs <dossier> <url> [url ...]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = process.argv[2];
const urls = process.argv.slice(3);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

for (const url of urls) {
  const slug = url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .slice(0, 40);

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 860 },
    deviceScaleFactor: 2,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  const page = await ctx.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(4500);
    await page.screenshot({ path: `${out}/${slug}-top.png` });

    // Un peu plus bas, pour voir comment la page continue
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.35));
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${out}/${slug}-next.png` });

    const title = await page.title();
    console.log(`OK   ${slug}  — ${title}`);
  } catch (e) {
    console.log(`ÉCHEC ${slug}  — ${String(e).split("\n")[0]}`);
  }

  await ctx.close();
}

await browser.close();
