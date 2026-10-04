/**
 * Fabrique public/carte.jpg : l'image de la carte servie par le site.
 *
 *   node scripts/carte.mjs
 *
 * Les tuiles viennent d'OpenStreetMap et sont assemblées une fois pour
 * toutes dans un fichier local. Le site ne fait donc aucune requête vers
 * un tiers pour afficher la carte — ni cookie, ni coût de chargement.
 * À relancer seulement si l'adresse du salon change.
 *
 * Attribution obligatoire : « © OpenStreetMap », affichée sur la carte
 * par le composant (voir components/Map.tsx).
 */
import { chromium } from "playwright";

const LAT = 45.4412233;
const LNG = -75.7332243;
const ZOOM = 17;
const W = 1000;
const H = 460;

const n = 2 ** ZOOM;
const centerPx = ((LNG + 180) / 360) * n * 256;
const latRad = (LAT * Math.PI) / 180;
const centerPy =
  ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * 256;

const left = centerPx - W / 2;
const top = centerPy - H / 2;

const x0 = Math.floor(left / 256);
const x1 = Math.floor((left + W) / 256);
const y0 = Math.floor(top / 256);
const y1 = Math.floor((top + H) / 256);

const tiles = [];
for (let x = x0; x <= x1; x++) {
  for (let y = y0; y <= y1; y++) {
    tiles.push(
      `<img src="https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png" style="position:absolute;left:${
        x * 256 - left
      }px;top:${y * 256 - top}px;width:256px;height:256px">`,
    );
  }
}

const html = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#e8e7e2">
<div id="map" style="position:relative;width:${W}px;height:${H}px;overflow:hidden">${tiles.join("")}</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
});
await page.setContent(html, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.locator("#map").screenshot({
  path: "public/carte.jpg",
  type: "jpeg",
  quality: 82,
});
await browser.close();

console.log(`public/carte.jpg — ${W * 2} × ${H * 2}, ${tiles.length} tuiles, zoom ${ZOOM}`);
