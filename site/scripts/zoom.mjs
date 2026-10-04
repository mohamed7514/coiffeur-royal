/**
 * Capture rapprochée d'une zone, pour relire un détail.
 *   node scripts/zoom.mjs <url> <dossier> <nom> <x> <y> <w> <h>
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [, , url, out, name, x, y, w, h] = process.argv;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 4,
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.screenshot({
  path: `${out}/${name}.png`,
  clip: { x: Number(x), y: Number(y), width: Number(w), height: Number(h) },
});
console.log(`${name}.png`);
await browser.close();
