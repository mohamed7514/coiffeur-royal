import { business, services, vip, nameFor, servicePath, type Service } from "@/lib/business";
import { serviceCopy } from "@/lib/services-content";
import { content, type Locale } from "@/lib/content";

const SITE = "https://barbierroyalmk.ca";

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Données structurées HairSalon.
 *
 * ⚠️ Volontairement SANS aggregateRating. Les règles de Google
 * interdisent de baliser ses propres avis sur son propre site, et plus
 * encore des avis repris d'une autre plateforme. Les étoiles des
 * résultats de recherche viennent de la fiche d'établissement, pas d'ici.
 * La note reste affichée à l'écran : c'est l'affichage qui est permis,
 * pas le balisage.
 */
export function JsonLd({ locale }: { locale: Locale }) {
  const url = locale === "fr" ? "https://barbierroyalmk.ca/" : "https://barbierroyalmk.ca/en";

  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: business.name,
    url,
    telephone: business.phone,
    image: "https://barbierroyalmk.ca/salon.jpg",
    priceRange: "$$",
    currenciesAccepted: "CAD",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      addressCountry: business.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.lat,
      longitude: business.geo.lng,
    },
    openingHoursSpecification: business.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS[h.day],
      opens: hhmm(h.open),
      closes: hhmm(h.close),
    })),
    sameAs: [business.maps],
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: business.booking,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
      },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "fr" ? "Services" : "Services",
      itemListElement: [...services, vip].map((s) => ({
        "@type": "Offer",
        price: s.price,
        priceCurrency: "CAD",
        itemOffered: {
          "@type": "Service",
          name: locale === "fr" ? s.name : s.nameEn,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Page de service : le service lui-même, plus le fil d'Ariane.
 * Toujours sans aggregateRating, pour la même raison que ci-dessus.
 */
export function ServiceJsonLd({ service, locale }: { service: Service; locale: Locale }) {
  const c = content[locale];
  const name = nameFor(service, locale);
  const url = SITE + servicePath(service, locale);

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name,
      description: serviceCopy[service.id][locale].lead,
      url,
      serviceType: name,
      areaServed: { "@type": "City", name: business.address.city },
      provider: {
        "@type": "HairSalon",
        name: business.name,
        telephone: business.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address.street,
          addressLocality: business.address.city,
          addressRegion: business.address.region,
          addressCountry: business.address.country,
        },
      },
      offers: {
        "@type": "Offer",
        price: service.price,
        priceCurrency: "CAD",
        availability: "https://schema.org/InStock",
        url: business.booking,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: c.svc.home, item: locale === "fr" ? SITE : `${SITE}/en` },
        {
          "@type": "ListItem",
          position: 2,
          name: c.svc.all,
          item: locale === "fr" ? `${SITE}/services` : `${SITE}/en/services`,
        },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
