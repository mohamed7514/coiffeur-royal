/**
 * Fabrique l'icône du site et l'image de partage.
 *
 *   node scripts/icones.mjs            # le serveur de dev doit tourner
 *   node scripts/icones.mjs http://localhost:3000
 *
 * Produit app/icon.png (512), app/apple-icon.png (180) et
 * app/opengraph-image.png (1200 × 630). Next.js les sert automatiquement
 * dès qu'ils portent ces noms : favicon, icône d'écran d'accueil, et
 * vignette des partages sur les réseaux et dans les messageries.
 *
 * Le rendu se fait dans une page autonome, pas dans le site : React y
 * reprend la main sur le DOM et efface ce qu'on y injecte. La police
 * vient donc de Google Fonts, qui sert le même Archivo que le site.
 * Seule l'image du hero est tirée du serveur local.
 */
import { chromium } from "playwright";

const ORIGIN = process.argv[2] ?? "http://localhost:3100";

const PAPER = "#f5f4f1";
const INK = "#0a090c";

const head = `
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800&display=block" rel="stylesheet">
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:${INK};
      font-family:Archivo,'Arial Black',sans-serif;font-stretch:125%;font-weight:800;color:${PAPER}}
  </style>`;

/** Marque, en Archivo très large : la même que l'en-tête du site. */
const mark = (size) => `
  <div id="shot" style="width:${size}px;height:${size}px;display:flex;
    align-items:center;justify-content:center;background:${INK}">
    <span style="font-size:${Math.round(size * 0.44)}px;letter-spacing:-0.02em;line-height:1">MK</span>
  </div>`;

const og = `
  <div id="shot" style="width:1200px;height:630px;position:relative;background:${INK};overflow:hidden">
    <div style="position:absolute;right:0;top:0;width:560px;height:100%;overflow:hidden">
      <img src="${ORIGIN}/frames/frame_0001.webp" style="width:100%;height:100%;object-fit:cover">
    </div>
    <div style="position:absolute;inset:0;background:
      linear-gradient(to right, rgba(10,9,12,1) 42%, rgba(10,9,12,.75) 62%, rgba(10,9,12,.05) 96%)"></div>
    <div style="position:absolute;left:64px;top:50%;transform:translateY(-50%);max-width:600px">
      <div style="font-size:21px;letter-spacing:.14em;text-transform:uppercase;opacity:.65;font-stretch:100%">
        Gatineau · secteur Hull
      </div>
      <div style="text-transform:uppercase;font-size:74px;line-height:.96;
        letter-spacing:-0.015em;margin-top:22px">
        Barbier à Gatineau, sept jours sur sept
      </div>
      <div style="font-size:25px;margin-top:30px;opacity:.72;font-stretch:100%;font-weight:400">
        Sans rendez-vous · coupe à 25&#8239;$ · 4,9 sur Google
      </div>
    </div>
  </div>`;

const browser = await chromium.launch();

async function shoot(body, width, height, out) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><meta charset="utf-8">${head}<body>${body}</body>`, {
    waitUntil: "networkidle",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(400);
  await page.locator("#shot").screenshot({ path: out });
  await page.close();
  console.log(`${out} — ${width} × ${height}`);
}

await shoot(mark(512), 512, 512, "app/icon.png");
await shoot(mark(180), 180, 180, "app/apple-icon.png");
await shoot(og, 1200, 630, "app/opengraph-image.png");

await browser.close();
