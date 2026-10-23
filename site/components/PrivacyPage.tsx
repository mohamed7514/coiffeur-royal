import type { Metadata } from "next";
import { business } from "@/lib/business";
import type { Locale } from "@/lib/content";
import { Nav } from "./Nav";
import { Footer } from "./Visit";

export const privacyPaths = { fr: "/confidentialite", en: "/en/privacy" } as const;

const copy = {
  fr: {
    title: "Confidentialité et mesure du site",
    description: "Informations sur la mesure des interactions du site RoyalMK et les coordonnées du salon.",
    home: "Accueil",
    measurementTitle: "Mesure des interactions",
    measurement: "Ce site utilise Google Tag Manager pour gérer ses outils de mesure. Un clic sur Appeler ou Réserver prépare un événement comprenant la page consultée et le type d’action. Pour une réservation, cet événement comprend aussi le lien ouvert et l’emplacement du bouton ; pour un appel, il comprend le numéro du salon. Ces interactions servent à comprendre l’utilisation du site et les résultats des campagnes.",
    externalTitle: "Services externes",
    external: "L’activation de la carte charge Google Maps. Les liens d’itinéraire et d’avis ouvrent aussi des services Google. La réservation s’ouvre sur un site externe.",
    contactTitle: "Une question sur le site ou sa mesure ?",
    contact: "Contactez le salon par téléphone ou à cette adresse :",
  },
  en: {
    title: "Privacy and website measurement",
    description: "Information about interaction measurement on the RoyalMK website and how to contact the shop.",
    home: "Home",
    measurementTitle: "Interaction measurement",
    measurement: "This website uses Google Tag Manager to manage measurement tools. Clicking Call or Book prepares an event containing the page visited and the type of action. For booking clicks, the event also includes the link opened and the button location; for calls, it includes the shop’s phone number. These interactions help assess website use and campaign results.",
    externalTitle: "External services",
    external: "Activating the map loads Google Maps. Directions and review links also open Google services. Booking opens on an external website.",
    contactTitle: "Questions about the website or its measurement?",
    contact: "Contact the shop by phone or at this address:",
  },
} as const;

export function privacyMetadata(locale: Locale): Metadata {
  return {
    title: `${copy[locale].title} | RoyalMK`,
    description: copy[locale].description,
    alternates: {
      canonical: privacyPaths[locale],
      languages: { "fr-CA": privacyPaths.fr, "en-CA": privacyPaths.en },
    },
    openGraph: {
      title: `${copy[locale].title} | RoyalMK`,
      description: copy[locale].description,
      url: privacyPaths[locale],
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export function PrivacyPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <>
      <Nav locale={locale} languagePaths={privacyPaths} />
      <main className="wrapper">
        <article className="section shell max-w-[80ch]">
          <a href={locale === "fr" ? "/" : "/en"} className="underlined">{c.home}</a>
          <h1 className="display h2 mt-10">{c.title}</h1>
          <section className="mt-10">
            <h2 className="text-lg font-semibold">{c.measurementTitle}</h2>
            <p className="mt-4 leading-relaxed text-mute">{c.measurement}</p>
          </section>
          <section className="mt-10">
            <h2 className="text-lg font-semibold">{c.externalTitle}</h2>
            <p className="mt-4 leading-relaxed text-mute">{c.external}</p>
          </section>
          <section className="mt-10">
            <h2 className="text-lg font-semibold">{c.contactTitle}</h2>
            <p className="mt-4 text-mute">{c.contact}</p>
            <address className="mt-4 not-italic leading-relaxed">
              <strong>{business.name}</strong><br />
              {business.address.street}<br />
              {locale === "fr" ? `${business.address.city}, ${business.address.sector}` : `Hull, ${business.address.city}`}<br />
              <a href={`tel:${business.phone}`} className="underlined">{business.phoneDisplay}</a>
            </address>
          </section>
        </article>
      </main>
      <Footer locale={locale} />
    </>
  );
}
