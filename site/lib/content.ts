export type Locale = "fr" | "en";

/** En français, l'espace avant le $ est une espace fine insécable (U+202F) :
 *  une espace normale en monospace creuse un trou entre le chiffre et le signe. */
export const price = (n: number, l: Locale) => (l === "fr" ? `${n} $` : `$${n}`);
export const duration = (m: number, l: Locale) =>
  l === "fr" ? (m >= 60 ? "1 h" : `${m} min`) : m >= 60 ? "1 hr" : `${m} min`;

export const content = {
  fr: {
    htmlLang: "fr-CA",

    nav: {
      services: "Services",
      gallery: "Travaux",
      visit: "Nous trouver",
      book: "Réserver",
      call: "Appeler",
    },

    hero: {
      h1a: "Barbier à Gatineau,",
      h1b: "sept jours sur sept",
      lead: "Ouvert sept jours sur sept, sans rendez-vous. Coupe à 25 $, sur le boulevard Saint-Joseph.",
      book: "Réserver en ligne",
      call: "Appeler le salon",
      photoAlt:
        "La salle du Barbier RoyalMK : mur de brique rouge, trois fauteuils de barbier et miroirs encadrés de noir.",

      /* Hero en séquence d'images. Le premier texte est le h1 de la page
         et porte le mot-clé local ; le second est la récompense du
         défilement, quand la nuque apparaît. */
      chair: "Réserver un fauteuil",
      scroll: "Défilez",
      next: "Les services ↓",
      lead1: "Sans rendez-vous, sur le boulevard Saint-Joseph, dans le secteur Hull.",
      craft: "Dégradé chirurgical",
      // Espace fine insécable avant le $ : une espace normale laisserait
      // le signe passer seul à la ligne suivante.
      craftSub: "De la tempe à la nuque, sans rupture. 25 $, sans rendez-vous.",
      sequenceAlt:
        "Un dégradé exécuté au salon, vu du profil à la nuque à mesure que la page défile.",
    },

    /* Chaque section porte une étiquette en serif et une phrase en
       capitales qui finit par un point : la mécanique de CRISP. */
    story: {
      label: "Le salon",
      title: "Sans rendez-vous. Coupe à 25 $.",
      body: "Barbier RoyalMK est ouvert sept jours sur sept sur le boulevard Saint-Joseph, dans le secteur Hull. Coupe, barbe, rasage à l’ancienne : on prend les clients sans rendez-vous, et la réservation en ligne reste possible pour choisir son créneau.",
    },

    shout: {
      label: "Une coupe fraîche",
      title: "Passez nous voir.",
    },

    proof: {
      ratingLabel: "sur Google",
      ratingCount: (n: number) => `${n} avis`,
    },

    services: {
      label: "Nos services",
      title: "Voici la liste des prix.",
      aLaCarte: "À la carte",
      lead: "Prix de base, taxes en sus. Chaque ligne ouvre sa page.",
      durationLabel: "Durée",
      go: "Voir",
      note: "Prix en dollars canadiens, taxes en sus. Paiement au salon.",
    },

    svc: {
      inCity: "à Gatineau",
      home: "Accueil",
      all: "Services",
      allTitle: "Les services du salon",
      allLead:
        "Sept services et un forfait, tous au même endroit sur le boulevard Saint-Joseph. Les prix sont ceux du salon, taxes en sus.",
      includes: "Ce que ça comprend",
      forWho: "Bon à savoir",
      price: "Prix",
      duration: "Durée",
      book: "Réserver ce service",
      bookNote:
        "La réservation se fait sur Squire. Choisissez-y le même nom de service pour retrouver le bon créneau.",
      others: "Les autres services",
      backAll: "Voir tous les services",
      savings: (n: number) => `Économie de ${n} $ sur les mêmes services pris à la pièce.`,
    },

    vip: {
      label: "Forfait VIP",
      title: "Tout, en une heure",
      included: "inclus",
      body: "Coupe, barbe, shampooing et soins complets en une seule visite.",
      savings: (saved: number) => `Soit ${saved} $ de moins qu'à la pièce.`,
      insteadOf: (n: number) => `au lieu de ${n} $ à la pièce`,
      book: "Réserver le forfait",
    },

    gallery: {
      label: "Notre travail",
      title: "Ce qu’on fait de mieux.",
      lead: "Des coupes faites au salon, cette semaine.",
      empty:
        "Les photos du salon viennent ici. Déposez-les dans site/public/travaux/ puis listez-les dans lib/gallery.ts.",
    },

    reviews: {
      label: "Ce qu’en disent les clients",
      title: (score: number, count: number) =>
        `${score.toLocaleString("fr-CA", { minimumFractionDigits: 1 })} sur 5, sur ${count} avis.`,
      lead: (score: number, count: number) =>
        `${score.toLocaleString("fr-CA", { minimumFractionDigits: 1 })} sur 5, sur ${count} avis Google.`,
      translated: "traduit de l’anglais",
      all: "Lire tous les avis",
      empty:
        "Collez ici de vrais avis Google, avec le prénom et la date. Aucun avis inventé : voir lib/reviews.ts.",
    },

    visit: {
      label: "De Gatineau, avec soin",
      title2: "Un seul salon, sur Saint-Joseph.",
      title: "Nous trouver",
      addressLabel: "Adresse",
      hoursLabel: "Heures",
      phoneLabel: "Téléphone",
      directions: "Itinéraire",
      mapOpen: "Ouvrir la carte",
      mapAlt:
        "Carte du secteur Hull : le salon est sur le boulevard Saint-Joseph, près des Galeries de Hull.",
      closes: (t: string) => `ferme à ${t}`,
      opens: (t: string) => `ouvre à ${t}`,
      // En français, le jour ne prend pas de majuscule en milieu de phrase.
      opensDay: (d: string, t: string) => `ouvre ${d.toLowerCase()} à ${t}`,
      openNow: "Ouvert",
      shut: "Fermé",
      today: "aujourd’hui",
      tomorrow: "demain",
    },

    footer: {
      rights: "Tous droits réservés.",
      bookNote: "Réservations gérées par Squire.",
    },
  },

  en: {
    htmlLang: "en-CA",

    nav: {
      services: "Prices",
      gallery: "Our work",
      visit: "Find us",
      book: "Book",
      call: "Call",
    },

    hero: {
      h1a: "Barber in Gatineau,",
      h1b: "seven days a week",
      lead: "Open seven days a week, walk-ins welcome. Haircuts $25, on Boulevard Saint-Joseph.",
      book: "Book online",
      call: "Call the shop",
      photoAlt:
        "Inside Barbier RoyalMK: red brick wall, three barber chairs and black-framed mirrors.",

      chair: "Book a chair",
      scroll: "Scroll",
      next: "Services ↓",
      lead1: "Walk-ins welcome, on Boulevard Saint-Joseph, in Hull.",
      craft: "Surgical skin fade",
      craftSub: "Temple to nape, no break in the line. $25, walk in.",
      sequenceAlt:
        "A skin fade done at the shop, seen from the profile to the nape as the page scrolls.",
    },

    story: {
      label: "The shop",
      title: "Walk in. Haircuts $25.",
      body: "Barbier RoyalMK is open seven days a week on Boulevard Saint-Joseph, in Hull. Haircuts, beards, traditional shaves: walk-ins are taken as they come, and online booking is there if you’d rather pick your slot.",
    },

    shout: {
      label: "Get a fresh cut",
      title: "Come see us.",
    },

    proof: {
      ratingLabel: "on Google",
      ratingCount: (n: number) => `${n} reviews`,
    },

    services: {
      label: "Our services",
      title: "See our price list.",
      aLaCarte: "À la carte",
      lead: "Base prices, taxes extra. Each line opens its page.",
      durationLabel: "Length",
      go: "View",
      note: "Canadian dollars, taxes extra. Payment at the shop.",
    },

    svc: {
      inCity: "in Gatineau",
      home: "Home",
      all: "Services",
      allTitle: "What the shop does",
      allLead:
        "Seven services and one package, all in the same chair on Boulevard Saint-Joseph. Prices are the shop's, taxes extra.",
      includes: "What it covers",
      forWho: "Worth knowing",
      price: "Price",
      duration: "Length",
      book: "Book this service",
      bookNote:
        "Booking runs on Squire. Pick the same service name there to land on the right slot.",
      others: "Other services",
      backAll: "See every service",
      savings: (n: number) => `Saves $${n} against booking the same services separately.`,
    },

    vip: {
      label: "VIP Package",
      title: "Everything, in an hour",
      included: "included",
      body: "Haircut, beard, shampoo and full care in a single visit.",
      savings: (saved: number) => `That’s $${saved} less than booking separately.`,
      insteadOf: (n: number) => `instead of $${n} booked separately`,
      book: "Book the package",
    },

    gallery: {
      label: "Our work",
      title: "What we do best.",
      lead: "Cuts done at the shop this week.",
      empty:
        "Shop photos go here. Drop them in site/public/travaux/ and list them in lib/gallery.ts.",
    },

    reviews: {
      label: "What customers say",
      title: (score: number, count: number) =>
        `${score.toFixed(1)} out of 5, across ${count} reviews.`,
      lead: (score: number, count: number) => `${score.toFixed(1)} out of 5, across ${count} Google reviews.`,
      translated: "translated from French",
      all: "Read every review",
      empty: "Paste real Google reviews here, with first name and date. Never invented: see lib/reviews.ts.",
    },

    visit: {
      label: "From Gatineau, with care",
      title2: "One shop, on Saint-Joseph.",
      title: "Find us",
      addressLabel: "Address",
      hoursLabel: "Hours",
      phoneLabel: "Phone",
      directions: "Directions",
      mapOpen: "Open the map",
      mapAlt: "Map of Hull: the shop is on Boulevard Saint-Joseph, near Galeries de Hull.",
      closes: (t: string) => `closes at ${t}`,
      opens: (t: string) => `opens at ${t}`,
      opensDay: (d: string, t: string) => `opens ${d} at ${t}`,
      openNow: "Open",
      shut: "Closed",
      today: "today",
      tomorrow: "tomorrow",
    },

    footer: {
      rights: "All rights reserved.",
      bookNote: "Booking handled by Squire.",
    },
  },
} as const;

export type Copy = (typeof content)["fr"];

/** Les deux langues, pour une fonction qui accepte l'une ou l'autre.
 *  `Copy` porte les chaînes françaises comme types littéraux, donc la
 *  version anglaise ne lui est pas assignable. */
export type AnyCopy = (typeof content)[Locale];
