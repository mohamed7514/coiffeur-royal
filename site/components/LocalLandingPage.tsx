import Image from "next/image";
import { allServices, business, nameFor, servicePath } from "@/lib/business";
import { content, duration, price, type Locale } from "@/lib/content";
import { localLandingCopy, localLandingPaths } from "@/lib/local-landing";
import { serviceCopy } from "@/lib/services-content";
import { gallery } from "@/lib/gallery";
import salon from "@/public/salon-hd.webp";
import { Nav } from "./Nav";
import { OpenNow } from "./OpenNow";
import { Hours } from "./Hours";
import { Lines } from "./Lines";
import { JsonLd } from "./JsonLd";
import { LandingActions, directionsUrl } from "./LandingActions";
import { RatingLink } from "./RatingLink";
import { HaircutWork } from "./HaircutWork";
import { ReviewHighlight } from "./Reviews";
import { Visit, Shout, Footer, ActionBar } from "./Visit";

const featuredServices = ["coupe", "coupe-barbe", "barbe", "enfant"].map(
  id => allServices.find(service => service.id === id)!,
);

export function LocalLandingPage({ locale }: { locale: Locale }) {
  const c = content[locale];
  const copy = localLandingCopy[locale];
  const haircut = allServices.find((service) => service.id === "coupe")!;
  const heroPhoto = gallery[0];
  const faqs = [
    [copy.walkInQuestion, copy.walkInAnswer],
    [copy.locationQuestion, copy.locationAnswer],
    [copy.styleQuestion, copy.styleAnswer],
    [copy.paymentQuestion, copy.paymentAnswer],
  ];

  return (
    <div className="landing-page">
      <JsonLd locale={locale} path={localLandingPaths[locale]} />
      <Nav locale={locale} languagePaths={localLandingPaths} localNavigation />
      <main className="wrapper landing-wrapper">
        <Lines />
        <section className="section shell landing-hero">
          <div>
            <div className="landing-kicker">
              <span className="mini">RoyalMK · {copy.location}</span>
              <OpenNow locale={locale} />
            </div>
            <h1 className="display landing-title">{copy.title}</h1>
            <div className="landing-offer" data-landing-price>
              <span className="display num landing-price">{price(haircut.price, locale)}</span>
              <div>
                <p className="font-semibold">{copy.haircut} · {duration(haircut.minutes, locale)}</p>
                <p className="text-xs text-mute">{copy.taxes}</p>
              </div>
            </div>
            <p className="landing-lead">{copy.lead}</p>
            <p className="mt-3 text-sm font-semibold">{copy.walkInNote}</p>
            <address className="landing-address" data-landing-address>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <strong>{business.address.street}</strong><br />{copy.location}
              </a>
            </address>
            <LandingActions locale={locale} placement="local-landing" />
            <div className="landing-hours" aria-label={c.visit.hoursLabel}><Hours locale={locale} compact /></div>
            <RatingLink locale={locale} />
            <div className="landing-alternatives">
              {allServices.filter((service) => service.id === "enfant" || service.id === "coupe-barbe").map((service) => (
                <a key={service.id} href={servicePath(service, locale)} className="underlined">
                  {nameFor(service, locale)} · {price(service.price, locale)}
                </a>
              ))}
            </div>
          </div>
          <figure className="landing-shop-photo">
            <Image src={heroPhoto.src} alt={locale === "fr" ? heroPhoto.alt : heroPhoto.altEn} width={510} height={510} sizes="(min-width: 1024px) 45vw, calc(100vw - 32px)" quality={75} loading="eager" fetchPriority="high" />
            <figcaption className="mt-3 text-sm text-mute">
              {locale === "fr" ? "Une coupe réalisée chez RoyalMK." : "A haircut done at RoyalMK."}
            </figcaption>
          </figure>
        </section>

        <HaircutWork locale={locale} compact />
        <div className="section shell">
          <ReviewHighlight locale={locale} context="local" />
        </div>

        <section id="services" className="section shell">
          <span className="mini">{c.services.label}</span>
          <h2 className="display h3 mt-3">{copy.servicesTitle}</h2>
          <p className="mt-4 max-w-[54ch] text-mute">{copy.servicesLead}</p>
          <div className="mt-6 grid gap-x-12 lg:grid-cols-2">
            {featuredServices.map((service) => (
              <a key={service.id} href={servicePath(service, locale)} className="row landing-service-row">
                <span>
                  <span className="block font-semibold">{nameFor(service, locale)}</span>
                  <span className="mt-1 block text-sm text-mute">{serviceCopy[service.id][locale].tagline}</span>
                </span>
                <span className="row-price whitespace-nowrap">{price(service.price, locale)}</span>
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs text-mute">{c.services.note}</p>
          <a href={locale === "fr" ? "/services" : "/en/services"} className="underlined mt-5 inline-flex min-h-11 items-center">
            {locale === "fr" ? "Voir tous les services" : "View all services"}
          </a>
        </section>

        <section className="section shell landing-arrival">
          <div className="landing-faq">
            <h2 className="display h3">{copy.faqTitle}</h2>
            <div className="mt-6 border-t border-ink">
              {faqs.map(([question, answer]) => (
                <details key={question} className="border-b border-rule py-5">
                  <summary className="cursor-pointer font-semibold">{question}</summary>
                  <p className="mt-4 max-w-[65ch] text-mute">{answer}</p>
                </details>
              ))}
            </div>
          </div>
          <figure className="landing-shop-photo">
            <Image src={salon} alt={c.hero.photoAlt} sizes="(min-width: 1024px) 40vw, calc(100vw - 32px)" quality={75} />
            <figcaption className="mt-3 text-sm text-mute">{copy.salonCaption}</figcaption>
          </figure>
        </section>
        <Visit locale={locale} />
        <Shout locale={locale} />
      </main>
      <Footer locale={locale} />
      <ActionBar locale={locale} />
    </div>
  );
}
