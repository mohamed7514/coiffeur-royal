import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

// Run against a local production build: node scripts/check-landing-pages.mjs http://localhost:3100
const base = process.argv[2] ?? "http://localhost:3100";
const output = ".shots/landing-repairs";
mkdirSync(output, { recursive: true });
const servicePairs = [
  ["coupe-de-cheveux", "haircut", 25],
  ["coupe-pour-enfant", "kids-haircut", 20],
  ["coupe-et-barbe", "haircut-and-beard", 36],
  ["taillage-de-barbe", "beard-trim", 19],
  ["rasage-a-l-ancienne", "traditional-shave", 25],
  ["epilation-faciale", "facial-waxing", 10],
  ["shampooing", "shampoo", 4],
  ["forfait-vip", "vip-package", 55],
];
const pairs = [
  ["/barbier-gatineau", "/en/barber-gatineau", 25],
  ...servicePairs.map(([fr, en, amount]) => [`/services/${fr}`, `/en/services/${en}`, amount]),
];
const keyPaths = new Set(pairs.slice(0, 2).flatMap(([fr, en]) => [fr, en]));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
try {
  for (const width of [390, 1440, 320, 768]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, deviceScaleFactor: 1 });
    // Never send test visits or conversion events to Google.
    await context.route(/googletagmanager\.com|googleadservices\.com|doubleclick\.net|google-analytics\.com/, route => route.abort());
    const page = await context.newPage();
    for (const [fr, en, amount] of pairs) {
      for (const [locale, path] of [["fr", fr], ["en", en]]) {
        if ((width === 320 || width === 768) && !keyPaths.has(path)) continue;
        const errors = [];
        const failedResources = [];
        const requests = [];
        const onError = error => errors.push(error.message);
        const onResponse = response => {
          if (response.url().startsWith(base) && response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
        };
        const onRequest = request => requests.push(request.url());
        page.on("pageerror", onError);
        page.on("response", onResponse);
        page.on("request", onRequest);
        const response = await page.goto(base + path, { waitUntil: "load", timeout: 45000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(200);
        await page.waitForFunction(() => [...document.images].filter(image => {
          const box = image.getBoundingClientRect();
          return box.top < innerHeight && box.bottom > 0;
        }).every(image => image.complete && image.naturalWidth > 0));
        assert.equal(response.status(), 200, path);
        const measured = await page.evaluate(() => {
          const rect = selector => {
            const element = document.querySelector(selector);
            const box = element.getBoundingClientRect();
            return { top: Math.round(box.top), bottom: Math.round(box.bottom), text: element.textContent.trim().replace(/\s+/g, " ") };
          };
          return {
            path: location.pathname,
            lang: document.documentElement.lang,
            headings: document.querySelectorAll("h1").length,
            canonical: document.querySelector('link[rel="canonical"]').href,
            french: document.querySelector('header a[hreflang="fr"]').getAttribute("href"),
            english: document.querySelector('header a[hreflang="en"]').getAttribute("href"),
            price: rect("[data-landing-price]"),
            address: rect("[data-landing-address]"),
            directions: rect(".landing-directions"),
            booking: document.querySelector("main [data-booking]").href,
            phone: document.querySelector('main a[href^="tel:"]').getAttribute("href"),
            reviews: document.querySelectorAll("main blockquote").length,
            overflow: document.documentElement.scrollWidth - innerWidth,
            heroMedia: document.querySelectorAll("main video, main canvas").length,
            frames: document.querySelectorAll("iframe").length,
            structuredData: [...document.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent)),
          };
        });
        assert.equal(measured.headings, 1, path);
        assert.equal(measured.lang, `${locale}-CA`, path);
        assert.equal(measured.canonical, `https://www.royalmk.ca${path}`, path);
        assert.equal(measured.french, fr, path);
        assert.equal(measured.english, en, path);
        assert.equal(measured.overflow, 0, `Horizontal overflow: ${path} at ${width}`);
        assert.ok(measured.price.text.includes(locale === "fr" ? `${amount} $` : `$${amount}`), path);
        assert.match(measured.address.text, /331 boul\. Saint-Joseph/, path);
        assert.equal(measured.phone, "tel:+18193180861", path);
        assert.equal(measured.booking, "https://getsquire.com/booking/book/royalmk-gatineau/barber/khadija-ayad/services", path);
        assert.ok(measured.reviews >= 1, `No customer review: ${path}`);
        assert.equal(measured.heroMedia, 0, path);
        assert.equal(measured.frames, 0, `Map loaded before user interaction: ${path}`);
        assert.ok(!JSON.stringify(measured.structuredData).includes("barbierroyalmk.ca"), path);
        if (keyPaths.has(path)) {
          for (const name of ["price", "address", "directions"]) {
            assert.ok(measured[name].top >= 70 && measured[name].bottom <= 844, `${name} below first screen: ${path} at ${width}: ${JSON.stringify(measured[name])}`);
          }
        }
        assert.ok(!requests.some(url => /\/frames(?:-|\/)/.test(url)), `Home sequence loaded: ${path}`);
        assert.deepEqual(errors, [], path);
        assert.deepEqual(failedResources, [], path);
        if (keyPaths.has(path) && [390, 1440].includes(width)) {
          const slug = path.slice(1).replaceAll("/", "-");
          await page.screenshot({ path: `${output}/${slug}-${width}.png` });
          if (width === 390) await page.screenshot({ path: `${output}/${slug}-${width}-full.png`, fullPage: true });
        }
        results.push({ width, ...measured, structuredData: undefined, errors, failedResources });
        page.off("pageerror", onError);
        page.off("response", onResponse);
        page.off("request", onRequest);
      }
    }
    await context.close();
  }

  // Exercise the actual language link, FAQ and service choice, not just their HTML attributes.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route(/googletagmanager\.com|googleadservices\.com|doubleclick\.net|google-analytics\.com/, route => route.abort());
  const page = await context.newPage();
  await page.goto(base + "/barbier-gatineau");
  await page.waitForFunction(() => Array.isArray(window.dataLayer));
  const tracked = await page.evaluate(() => {
    const before = window.dataLayer.filter(item => item.event === "booking_click").length;
    document.addEventListener("click", event => event.preventDefault());
    const booking = document.querySelector("main [data-booking]");
    booking.querySelector("svg").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    const events = window.dataLayer.filter(item => item.event === "booking_click");
    return { count: events.length - before, last: events.at(-1) };
  });
  assert.equal(tracked.count, 1);
  assert.equal(tracked.last.link_location, "local-landing");
  assert.equal(tracked.last.page_path, "/barbier-gatineau");
  // Reload to remove the test-only navigation cancellation listener.
  await page.goto(base + "/barbier-gatineau");
  await page.locator('header a[hreflang="en"]').click();
  await page.waitForURL(base + "/en/barber-gatineau");
  await page.locator("main details summary").first().click();
  assert.equal(await page.locator("main details").first().getAttribute("open"), "");
  await page.locator('main a[href="/en/services/kids-haircut"]').first().click();
  await page.waitForURL(base + "/en/services/kids-haircut");
  await page.locator('header a[hreflang="fr"]').click();
  await page.waitForURL(base + "/services/coupe-pour-enfant");
  assert.match(await page.locator("[data-landing-price]").innerText(), /20/);
  // The index language toggle must also preserve the index page.
  await page.goto(base + "/services");
  await page.locator('header a[hreflang="en"]').click();
  await page.waitForURL(base + "/en/services");
  await context.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await noJs.route(/googletagmanager\.com|googleadservices\.com|doubleclick\.net|google-analytics\.com/, route => route.abort());
  const plain = await noJs.newPage();
  await plain.goto(base + "/barbier-gatineau");
  assert.ok(await plain.locator("[data-landing-price]").isVisible());
  assert.ok(await plain.locator(".landing-directions").isVisible());
  assert.equal(await plain.locator('header a[hreflang="en"]').getAttribute("href"), "/en/barber-gatineau");
  await noJs.close();

  const sitemap = await (await fetch(base + "/sitemap.xml")).text();
  for (const path of ["/barbier-gatineau", "/en/barber-gatineau"]) assert.ok(sitemap.includes(`https://www.royalmk.ca${path}`));
  writeFileSync(`${output}/checks.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: true, pageChecks: results.length, widths: [320, 390, 768, 1440], languageAndServiceFlow: true, noJavaScript: true, sitemap: true, output }));
} finally {
  await browser.close();
}
