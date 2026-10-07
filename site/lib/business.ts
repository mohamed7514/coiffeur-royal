/**
 * Source unique des informations du salon.
 * Vérifiées le 01/10/2026 : prix et durées relevés dans Squire,
 * note et avis sur la fiche Google, coordonnées GPS tirées du lien Maps.
 *
 * Toute modification se fait ICI, jamais dans un composant : le nom,
 * l'adresse et le téléphone doivent rester identiques au caractère près
 * entre le site, la fiche Google et Squire (signal local).
 */

export const business = {
  name: "Barbier RoyalMK",
  tagline: "Adoptez le style que vous méritez",

  phone: "+18193180861",
  phoneDisplay: "(819) 318-0861",

  address: {
    street: "331 boul. Saint-Joseph",
    sector: "secteur Hull",
    city: "Gatineau",
    region: "QC",
    country: "CA",
  },

  geo: { lat: 45.4412233, lng: -75.7332243 },

  /** Page du salon, jamais celle d'un barbier : un lien vers un seul
   *  barbier meurt dès qu'il est complet ou absent. */
  booking: "https://getsquire.com/booking/book/royalmk-gatineau",

  /** Lien court et stable de la fiche Google (CID), pas l'URL Maps longue. */
  maps: "https://maps.google.com/?cid=9676733797717479798",

  /** Affiché à l'écran, mais jamais balisé en aggregateRating :
   *  Google interdit de marquer ses propres avis sur son propre site. */
  rating: { score: 4.9, count: 103 },

  /** 0 = dimanche. Heures en minutes depuis minuit, fuseau America/Toronto. */
  hours: [
    { day: 0, open: 10 * 60, close: 16 * 60 },
    { day: 1, open: 9 * 60, close: 19 * 60 },
    { day: 2, open: 9 * 60, close: 19 * 60 },
    { day: 3, open: 9 * 60, close: 19 * 60 },
    { day: 4, open: 9 * 60, close: 19 * 60 },
    { day: 5, open: 9 * 60, close: 19 * 60 },
    { day: 6, open: 9 * 60, close: 19 * 60 },
  ],
} as const;

export type ServiceId =
  | "coupe"
  | "enfant"
  | "coupe-barbe"
  | "barbe"
  | "rasage"
  | "epilation"
  | "shampooing"
  | "vip";

export type Service = {
  id: ServiceId;
  /** Adresse de la page. Localisée : un mot-clé dans l'URL aide le référencement. */
  slug: string;
  slugEn: string;
  name: string;
  nameEn: string;
  minutes: number;
  price: number;
  /** Forfaits seulement : prix cumulé des mêmes services pris à la pièce. */
  partsTotal?: number;
  includes?: string[];
  includesEn?: string[];
};

/**
 * Noms repris mot pour mot de Squire. Ne pas « améliorer » :
 * Squire ne permet pas de présélectionner un service par l'URL, donc le
 * visiteur doit retrouver ces mots exacts dans la liste après son clic.
 */
export const services: Service[] = [
  {
    id: "coupe",
    slug: "coupe-de-cheveux",
    slugEn: "haircut",
    name: "Coupe de Cheveux",
    nameEn: "Haircut",
    minutes: 30,
    price: 25,
  },
  {
    id: "enfant",
    slug: "coupe-pour-enfant",
    slugEn: "kids-haircut",
    name: "Coupe pour Enfant",
    nameEn: "Kids’ Haircut",
    minutes: 30,
    price: 20,
  },
  {
    id: "coupe-barbe",
    slug: "coupe-et-barbe",
    slugEn: "haircut-and-beard",
    name: "Coupe + Barbe",
    nameEn: "Haircut + Beard",
    minutes: 30,
    price: 36,
    partsTotal: 44,
  },
  {
    id: "barbe",
    slug: "taillage-de-barbe",
    slugEn: "beard-trim",
    name: "Taillage de Barbe",
    nameEn: "Beard Trim",
    minutes: 30,
    price: 19,
  },
  {
    id: "rasage",
    slug: "rasage-a-l-ancienne",
    slugEn: "traditional-shave",
    name: "Rasage à l’ancienne",
    nameEn: "Traditional Shave",
    minutes: 30,
    price: 25,
  },
  {
    id: "epilation",
    slug: "epilation-faciale",
    slugEn: "facial-waxing",
    name: "Épilation Faciale",
    nameEn: "Facial Waxing",
    minutes: 30,
    price: 10,
  },
  {
    id: "shampooing",
    slug: "shampooing",
    slugEn: "shampoo",
    name: "Shampooing",
    nameEn: "Shampoo",
    minutes: 15,
    price: 4,
  },
];

/** Le forfait est traité à part sur l'accueil : c'est l'offre à pousser. */
export const vip: Service = {
  id: "vip",
  slug: "forfait-vip",
  slugEn: "vip-package",
  name: "Forfait VIP",
  nameEn: "VIP Package",
  minutes: 60,
  price: 55,
  /** Coupe 25 + barbe 19 + shampooing 4 + soins = l'écart à montrer. */
  partsTotal: 65,
  includes: ["Coupe de Cheveux", "Taillage de Barbe", "Shampooing", "Soins complets"],
  includesEn: ["Haircut", "Beard trim", "Shampoo", "Full care"],
};

/** Tout ce qui mérite sa page. */
export const allServices: Service[] = [...services, vip];

export const serviceBySlug = (slug: string, locale: "fr" | "en") =>
  allServices.find((s) => (locale === "fr" ? s.slug : s.slugEn) === slug);

export const slugFor = (s: Service, locale: "fr" | "en") => (locale === "fr" ? s.slug : s.slugEn);
export const nameFor = (s: Service, locale: "fr" | "en") => (locale === "fr" ? s.name : s.nameEn);
export const servicePath = (s: Service, locale: "fr" | "en") =>
  locale === "fr" ? `/services/${s.slug}` : `/en/services/${s.slugEn}`;
