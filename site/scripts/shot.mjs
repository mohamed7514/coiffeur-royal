/**
 * Captures du site en cours d'exécution, pour relire la mise en page.
 *   node scripts/shot.mjs [url] [dossier] [chemin,chemin,...]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.argv[3] ?? "./.shots";
const only = process.argv[4]?.split(",").filter(Boolean);
mkdirSync(out, { recursive: true });

const all = [
  { name: "desktop", width: 1440, height: 900, path: "/" },
  { name: "mobile", width: 390, height: 844, path: "/", mobile: true },
  { name: "services", width: 1440, height: 900, path: "/services" },
  { name: "service", width: 1440, height: 900, path: "/services/taillage-de-barbe" },
  { name: "a", width: 1440, height: 900, path: "/design/a" },
  { name: "b", width: 1440, height: 900, path: "/design/b" },
  { name: "c", width: 1440, height: 900, path: "/design/c" },
  { name: "d", width: 1440, height: 900, path: "/design/d" },
  { name: "d-mobile", width: 390, height: 844, path: "/design/d", mobile: true },
  { name: "a-mobile", width: 390, height: 844, path: "/design/a", mobile: true },
  { name: "b-mobile", width: 390, height: 844, path: "/design/b", mobile: true },
  { name: "c-mobile", width: 390, height: 844, path: "/design/c", mobile: true },
];

const views = only ? all.filter((v) => only.includes(v.name)) : all;
const browser = await chromium.launch();

for (const v of views) {
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: 2,
    isMobile: Boolean(v.mobile),
    hasTouch: Boolean(v.mobile),
  });
  const page = await ctx.newPage();

  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(base + v.path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  await page.screenshot({ path: `${out}/${v.name}.png`, fullPage: true });
  console.log(
    `${v.name}: ok${overflow > 0 ? `  ⚠ débordement horizontal ${overflow}px` : ""}${
      errors.length ? `\n   erreurs: ${errors.join(" | ")}` : ""
    }`,
  );

  await ctx.close();
}

await browser.close();
