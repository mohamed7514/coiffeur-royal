import {
  Anton,
  Archivo,
  Azeret_Mono,
  Bodoni_Moda,
  Chivo,
  Instrument_Serif,
  JetBrains_Mono,
  Manrope,
} from "next/font/google";

/* ── Site actuel ──────────────────────────────────────────────────── */

/** Archivo porte un axe de largeur : le display est réglé large et lourd,
 *  à rebours du condensé que tout le secteur utilise. */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Pour les chiffres qui s'alignent en colonne : prix, durées, heures. */
export const azeret = Azeret_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-azeret",
  display: "swap",
});

/** Le serif des étiquettes de section, seul contrepoint à la grotesque.
 *  Déclaré ici parce que le site entier s'en sert depuis la direction D. */
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

/** Deux polices, pas trois : les chiffres sont en Archivo tabulaire, le
 *  monospace ne sert plus à rien depuis que la page est claire. */
export const fontVars = `${archivo.variable} ${instrument.variable}`;

/* ── Propositions de design ───────────────────────────────────────── */

/** A — Lame. Didone à très fort contraste : les déliés font la lame. */
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
export const fontsA = `${bodoni.variable} ${manrope.variable}`;

/** B — Affiche. Condensé très lourd, pour du texte qui déborde du cadre. */
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});
export const fontsB = `${anton.variable} ${archivo.variable} ${azeret.variable}`;

/** D — Crisp. Même couple que le site, qui a adopté cette direction. */
export const fontsD = fontVars;

/** C — Atelier. Grotesque serré, et du monospace comme structure. */
const chivo = Chivo({ subsets: ["latin"], variable: "--font-chivo", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
export const fontsC = `${chivo.variable} ${jetbrains.variable}`;
