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
    measurement: "Ce site utilise Google Tag Manager pour gérer ses outils de mesure. Un clic sur Appeler ou Réserver prépare un événement comprenant la page consultée et le type d’action ; pour un appel, il comprend aussi le numéro du salon, et pour une réservation, l’emplacement du bouton. Quand un rendez-vous est confirmé sur ce site, un événement indique le service, la date, le montant et un identifiant de réservation. Pour mesurer les résultats des campagnes Google Ads, le courriel et le téléphone saisis peuvent être transmis à Google sous forme chiffrée. Ces interactions servent à comprendre l’utilisation du site et les résultats des campagnes.",
    bookingTitle: "Réservation en ligne",
    booking: "Pour réserver, nous demandons votre prénom, votre téléphone et votre courriel, et, si vous le souhaitez, votre nom et une note pour le barbier. Ces renseignements servent uniquement à gérer votre rendez-vous : ils sont inscrits dans l’agenda du salon (Google Agenda) et un courriel de confirmation peut vous être envoyé. Si vous cochez « Retenir mes infos sur cet appareil », elles restent dans votre navigateur seulement ; vous pouvez les effacer en supprimant les données du site. Pour faire supprimer un rendez-vous ou vos renseignements, contactez le salon.",
    externalTitle: "Services externes",
    external: "L’activation de la carte charge Google Maps. Les liens d’itinéraire et d’avis ouvrent aussi des services Google.",
    contactTitle: "Une question sur le site ou sa mesure ?",
    contact: "Contactez le salon par téléphone ou à cette adresse :",
  },
  en: {
    title: "Privacy and website measurement",
    description: "Information about interaction measurement on the RoyalMK website and how to contact the shop.",
    home: "Home",
    measurementTitle: "Interaction measurement",
    measurement: "This website uses Google Tag Manager to manage measurement tools. Clicking Call or Book prepares an event containing the page visited and the type of action; for calls it also includes the shop’s phone number, and for booking, the button location. When an appointment is confirmed on this site, an event records the service, the date, the amount and a booking identifier. To measure Google Ads campaign results, the email and phone number entered may be sent to Google in encrypted form. These interactions help assess website use and campaign results.",
    bookingTitle: "Online booking",
    booking: "To book, we ask for your first name, phone number and email, and, if you wish, your last name and a note for the barber. This information is used only to manage your appointment: it is entered in the shop’s calendar (Google Calendar) and a confirmation email may be sent to you. If you tick “Remember my info on this device”, it stays in your browser only; you can erase it by clearing the site’s data. To have an appointment or your information deleted, contact the shop.",
    externalTitle: "External services",
    external: "Activating the map loads Google Maps. Directions and review links also open Google services.",
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
            <h2 className="text-lg font-semibold">{c.bookingTitle}</h2>
            <p className="mt-4 leading-relaxed text-mute">{c.booking}</p>
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
