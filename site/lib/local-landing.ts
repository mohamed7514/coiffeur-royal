import type { Metadata } from "next";
import { business, services } from "./business";
import { price, type Locale } from "./content";

export const localLandingPaths = {
  fr: "/barbier-gatineau",
  en: "/en/barber-gatineau",
} as const;

const haircut = services.find((service) => service.id === "coupe")!;

export const localLandingCopy = {
  fr: {
    title: "Votre barbier à Hull.",
    lead: "Une coupe aux ciseaux ou à la tondeuse, avec finition des contours et de la nuque. Apportez une photo pour nous montrer la coupe souhaitée.",
    walkInNote: "Avec ou sans rendez-vous, 7 jours sur 7.",
    haircut: "Coupe homme",
    taxes: "CAD · taxes en sus",
    location: "Hull, Gatineau",
    salonCaption: "Le salon, au 331 boul. Saint-Joseph, secteur Hull.",
    servicesTitle: "Vous venez pour quoi ?",
    servicesLead: "Choisissez votre prestation pour voir ce qui est inclus et préparer votre visite.",
    faqTitle: "Réservez ou passez directement.",
    walkInQuestion: "Faut-il prendre rendez-vous ?",
    walkInAnswer: "Vous pouvez passer sans rendez-vous pendant les heures d’ouverture. L’attente dépend de l’affluence. Pour choisir un créneau avec Khadija Ayad, réservez en ligne.",
    locationQuestion: "Où se trouve le salon ?",
    locationAnswer: `${business.address.street}, dans le secteur Hull à Gatineau. Le bouton Itinéraire ouvre le trajet vers cette adresse dans Google Maps.`,
    styleQuestion: "Puis-je montrer une photo de la coupe souhaitée ?",
    styleAnswer: "Oui. Apportez une photo pour discuter de la longueur, du dégradé et de la finition avec le barbier avant de commencer.",
    paymentQuestion: "Comment réserver et payer ?",
    paymentAnswer: "La réservation se fait sur Squire. Les prix sont en dollars canadiens, taxes en sus, et le paiement se fait au salon.",
  },
  en: {
    title: "Your barber in Hull.",
    lead: "Scissors or clippers, with your edges and neckline finished. Bring a photo to show us the cut you want.",
    walkInNote: "Book ahead or walk in, seven days a week.",
    haircut: "Men’s haircut",
    taxes: "CAD · taxes extra",
    location: "Hull, Gatineau",
    salonCaption: "The shop at 331 boul. Saint-Joseph, in Hull.",
    servicesTitle: "What are you coming in for?",
    servicesLead: "Choose a service to see what is included before you visit.",
    faqTitle: "Book ahead or walk in.",
    walkInQuestion: "Do I need an appointment?",
    walkInAnswer: "Walk-ins are welcome during opening hours. Waiting time depends on how busy the shop is. To choose a time with Khadija Ayad, book online.",
    locationQuestion: "Where is the shop?",
    locationAnswer: `${business.address.street}, in the Hull sector of Gatineau. Directions opens the route to this address in Google Maps.`,
    styleQuestion: "Can I bring a haircut photo?",
    styleAnswer: "Yes. Bring a reference photo to discuss length, the fade and the finish with your barber before the cut starts.",
    paymentQuestion: "How do booking and payment work?",
    paymentAnswer: "Book through Squire. Prices are in Canadian dollars, taxes extra, and payment is at the shop.",
  },
} as const;

export function localLandingMetadata(locale: Locale): Metadata {
  const title = locale === "fr"
    ? `Barbier à Gatineau, Hull — Coupe homme ${price(haircut.price, locale)} | RoyalMK`
    : `Barber Shop in Gatineau, Hull — ${price(haircut.price, locale)} Haircuts | RoyalMK`;
  const description = locale === "fr"
    ? `Coiffeur pour hommes et enfants au ${business.address.street}, Hull. Coupe ${price(haircut.price, locale)}, sans rendez-vous, ouvert 7 jours sur 7. Prix et horaires.`
    : `Men’s and kids’ barber at ${business.address.street}, Hull. ${price(haircut.price, locale)} haircuts, walk-ins welcome, open seven days a week. Prices and hours.`;
  return {
    title,
    description,
    alternates: {
      canonical: localLandingPaths[locale],
      languages: { "fr-CA": localLandingPaths.fr, "en-CA": localLandingPaths.en },
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      url: localLandingPaths[locale],
      title,
      description,
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
    },
  };
}
