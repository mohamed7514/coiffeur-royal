import type { Metadata } from "next";
import { allServices, type ServiceId } from "@/lib/business";
import type { Locale } from "@/lib/content";
import { bookingCopy, bookingPaths } from "@/lib/booking/copy";
import { Nav } from "../Nav";
import { BookingFlow } from "./BookingFlow";
import s from "./Booking.module.css";

export function bookingMetadata(locale: Locale): Metadata {
  const c = bookingCopy[locale];
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: {
      canonical: bookingPaths[locale],
      languages: { "fr-CA": bookingPaths.fr, "en-CA": bookingPaths.en },
    },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: bookingPaths[locale],
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
    },
  };
}

/** `?service=` accepte l'identifiant (coupe-barbe) ou l'adresse de la page
 *  du service, dans l'une ou l'autre langue (coupe-et-barbe, haircut-and-beard). */
export function serviceFromParam(raw: string | string[] | undefined): ServiceId | undefined {
  const v = typeof raw === "string" ? raw.toLowerCase() : undefined;
  return v ? allServices.find((svc) => svc.id === v || svc.slug === v || svc.slugEn === v)?.id : undefined;
}

/** Page volontairement dépouillée : pas de pied de page ni de décor, seulement la tâche. */
export function BookingPage({ locale, service }: { locale: Locale; service?: ServiceId }) {
  return (
    <>
      <Nav locale={locale} languagePaths={bookingPaths} />
      <main className={`shell ${s.page}`}>
        <BookingFlow locale={locale} initialService={service} />
      </main>
    </>
  );
}
