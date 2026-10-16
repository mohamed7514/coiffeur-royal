import { ServicePhoto } from "./ServicePhoto";
import { serviceImages } from "@/lib/service-images";
import {
  allServices,
  business,
  nameFor,
  servicePath,
  type Service,
} from "@/lib/business";
import { serviceCopy } from "@/lib/services-content";
import { content, duration, price, type Locale } from "@/lib/content";
import { Nav } from "./Nav";
import { OpenNow } from "./OpenNow";
import { Visit, Shout, Footer, ActionBar } from "./Visit";
import { CallBadge } from "./CallBadge";
import { ServiceJsonLd } from "./JsonLd";
import { Lines } from "./Lines";
import { LandingActions, directionsUrl } from "./LandingActions";
import { RatingLink } from "./RatingLink";
import { Reviews } from "./Reviews";
import { HaircutWork } from "./HaircutWork";
import { localLandingPaths } from "@/lib/local-landing";

export function ServicePage({ service, locale }: { service: Service; locale: Locale }) {
  const c = content[locale];
  const copy = serviceCopy[service.id][locale];
  const name = nameFor(service, locale);
  const photo = serviceImages[service.id];
  /** Quatre suggestions : une rangée pleine sur grand écran, deux sur
   *  tablette. Les sept autres laisseraient une case vide en fin de grille. */
  const others = allServices.filter((s) => s.id !== service.id).slice(0, 4);
  const saved = service.partsTotal ? service.partsTotal - service.price : 0;

  return (
    <div className="landing-page">
      <ServiceJsonLd service={service} locale={locale} />
      <Nav locale={locale} languagePaths={{ fr: servicePath(service, "fr"), en: servicePath(service, "en") }} />

      <main>
        <article className="wrapper landing-wrapper">
          <Lines />

          <div className="section shell">
            <nav
              aria-label={locale === "fr" ? "fil d’Ariane" : "breadcrumb"}
              className="flex flex-wrap items-center gap-2 text-sm text-mute"
            >
              <a href={locale === "fr" ? "/" : "/en"} className="transition-colors hover:text-ink">
                {c.svc.home}
              </a>
              <span aria-hidden>/</span>
              <a
                href={locale === "fr" ? "/services" : "/en/services"}
                className="transition-colors hover:text-ink"
              >
                {c.svc.all}
              </a>
              <span aria-hidden>/</span>
              <span>{name}</span>
            </nav>

            <div className="landing-hero landing-service-hero">
              <div>
                <OpenNow locale={locale} className="text-mute" />

                <div className="mini mt-2">RoyalMK · Hull, Gatineau</div>

                <h1 className="display landing-title">
                  {copy.heading ?? name} {c.svc.inCity}
                </h1>

                <div className="landing-offer" data-landing-price>
                  <span className="display num landing-price">{price(service.price, locale)}</span>
                  <div>
                    <p className="font-semibold">{duration(service.minutes, locale)}</p>
                    <p className="text-xs text-mute">{locale === "fr" ? "CAD · taxes en sus" : "CAD · taxes extra"}</p>
                  </div>
                </div>

                {saved > 0 && (
                  <p className="mt-3 text-sm text-mute">
                    <s className="num">{price(service.partsTotal ?? 0, locale)}</s>{" "}{c.svc.savings(saved)}
                  </p>
                )}
                <p className="landing-lead">{copy.summary ?? copy.tagline}</p>
                <address className="landing-address" data-landing-address>
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                    <strong>{business.address.street}</strong><br />Hull, Gatineau
                  </a>
                </address>
                <LandingActions locale={locale} placement={"service-" + service.id} />
                <p className="mt-3 max-w-[46ch] text-sm text-mute">{c.svc.walkInNote}</p>
                <RatingLink locale={locale} />
                {service.id === "coupe" && (
                  <div className="landing-alternatives">
                    {allServices.filter((s) => s.id === "enfant" || s.id === "coupe-barbe").map((s) => (
                      <a key={s.id} href={servicePath(s, locale)} className="underlined">
                        {nameFor(s, locale)} · {price(s.price, locale)}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="self-start">
                <figure className="m-0 max-w-[600px]">
                  <ServicePhoto id={service.id} locale={locale} sizes="(min-width: 1024px) 40vw, (min-width: 640px) 600px, calc(100vw - 32px)" preload />
                  {photo.caption && <figcaption className="mt-3 text-sm text-mute">{photo.caption[locale]}</figcaption>}
                </figure>
              </div>
            </div>
          </div>

          <div className="section shell grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="display h3">{c.svc.includes}</h2>
              <ul className="mt-6 m-0 list-none p-0">
                {copy.includes.map((it) => (
                  <li key={it} className="border-b border-rule py-[1.05rem]">
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="display h3">{c.svc.forWho}</h2>
              <p className="mt-6 max-w-[48ch] leading-relaxed text-mute">{copy.lead}</p>
              <p className="mt-4 max-w-[48ch] leading-relaxed text-mute">{copy.forWho}</p>
            </div>
          </div>

          {service.id === "coupe" && <HaircutWork locale={locale} />}
          <Reviews locale={locale} compact />

          <div className="section shell">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
              <h2 className="display h3">{c.svc.others}</h2>
              <a
                href={locale === "fr" ? "/services" : "/en/services"}
                className="underlined text-[0.95rem]"
              >
                {c.svc.backAll}
              </a>
            </div>

            <div className="mt-8 grid gap-x-16 lg:grid-cols-2">
              {others.map((s) => (
                <a key={s.id} href={servicePath(s, locale)} className="row service-row">
                  <span className="flex items-center gap-3 md:gap-5">
                    <ServicePhoto id={s.id} locale={locale} sizes="(min-width: 768px) 80px, 64px" className="service-thumb" />
                    <span className="font-semibold">{nameFor(s, locale)}</span>
                  </span>
                  <span className="row-price">{price(s.price, locale)}</span>
                </a>
              ))}
            </div>
            <a href={localLandingPaths[locale]} className="underlined mt-6 inline-block text-sm">
              {locale === "fr" ? "Le salon à Hull : horaires, accès et services" : "The shop in Hull: hours, directions and services"}
            </a>
          </div>

          <Visit locale={locale} />
          <Shout locale={locale} />
        </article>
      </main>

      <Footer locale={locale} />
      <CallBadge locale={locale} />
      <ActionBar locale={locale} />
    </div>
  );
}
