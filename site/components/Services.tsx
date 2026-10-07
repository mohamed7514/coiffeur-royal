import { ServicePhoto } from "./ServicePhoto";
import { business, services, vip, nameFor, servicePath, type Service } from "@/lib/business";
import { serviceCopy } from "@/lib/services-content";
import { content, price, type Locale } from "@/lib/content";

const showcaseCopy = {
  fr: {
    title: "Le style, dans le détail.",
    lead: "Une coupe nette, une barbe soignée, du temps pour vous. Choisissez ce qui vous ressemble.",
    all: "Explorer les services",
    detail: "Découvrir le service",
    vipDetail: "Découvrir le forfait",
  },
  en: {
    title: "Style, down to the detail.",
    lead: "A clean cut, a kept beard, time for yourself. Find the service that fits you.",
    all: "Explore our services",
    detail: "Explore this service",
    vipDetail: "Explore the package",
  },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="home-service-arrow">
      {diagonal ? (
        <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <path d="M3 12h18m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.5" />
      )}
    </svg>
  );
}

function ServiceVisual({ service, locale, number, featured = false, wide = false }: {
  service: Service;
  locale: Locale;
  number: string;
  featured?: boolean;
  wide?: boolean;
}) {
  const copy = showcaseCopy[locale];
  return (
    <a
      href={servicePath(service, locale)}
      className={"home-service-card" + (featured ? " home-service-card--featured" : "")}
    >
      <div className="home-service-kicker">
        <span className="mini" aria-hidden="true">{number}</span>
        <span className="home-service-discover">{copy.detail} <Arrow diagonal /></span>
      </div>
      <ServicePhoto
        id={service.id}
        placement="home"
        locale={locale}
        sizes={featured
          ? "(min-width: 1024px) 55vw, (min-width: 768px) 50vw, calc(100vw - 32px)"
          : wide
            ? "(min-width: 768px) 50vw, calc(100vw - 32px)"
            : "(min-width: 768px) 33vw, calc(100vw - 32px)"}
      />
      <div className="home-service-caption">
        <h3 className="display">{nameFor(service, locale)}</h3>
        <span className="display num home-service-price">{price(service.price, locale)}</span>
      </div>
      <p className="home-service-description">{serviceCopy[service.id][locale].tagline}</p>
    </a>
  );
}

/** Grandes photos et légendes séparées : le service et son prix restent lisibles.
 * Les liens ouvrent la fiche, où la réservation est à un geste près. */
export function Services({ locale }: { locale: Locale }) {
  const c = content[locale];
  const copy = showcaseCopy[locale];
  const items = (locale === "fr" ? vip.includes : vip.includesEn) ?? [];
  const featured = services.filter((s) => s.id === "coupe" || s.id === "coupe-barbe");
  const remaining = services.filter((s) => s.id !== "coupe" && s.id !== "coupe-barbe");

  return (
    <section id="services" className="section shell home-services">
      <div className="home-services-heading">
        <div>
          <span className="mini">{c.services.label}</span>
          <h2 className="display h2">{copy.title}</h2>
        </div>
        <div className="home-services-intro">
          <p>{copy.lead}</p>
          <a href={locale === "fr" ? "/services" : "/en/services"} className="home-services-all">
            {copy.all} <Arrow />
          </a>
        </div>
      </div>

      <div id="travaux" className="home-services-featured">
        {featured.map((service, index) => (
          <ServiceVisual key={service.id} service={service} locale={locale} number={"0" + (index + 1)} featured />
        ))}
      </div>

      <div className="home-services-grid">
        {remaining.map((service, index) => (
          <ServiceVisual key={service.id} service={service} locale={locale} number={"0" + (index + 3)} wide={index >= 3} />
        ))}
      </div>

      <div className="home-vip">
        <div className="home-vip-copy">
          <div className="home-vip-kicker">
            <span className="mini">{c.vip.title}</span>
            <span className="mini" aria-hidden="true">08</span>
          </div>
          <h3 className="display">{c.vip.label}</h3>
          <p className="home-vip-lead">{c.vip.body}</p>
          <ul className="home-vip-includes">
            {items.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="home-vip-bottom">
            <div>
              <div className="display num home-vip-price">{price(vip.price, locale)}</div>
              <p className="home-vip-savings">{c.vip.insteadOf(vip.partsTotal ?? 0)}</p>
            </div>
            <a href={`tel:${business.phone}`} className="btn btn-light">
              {c.hero.call}
            </a>
          </div>
          <a href={servicePath(vip, locale)} className="home-vip-detail">
            {copy.vipDetail} <Arrow diagonal />
          </a>
        </div>
        <a href={servicePath(vip, locale)} className="home-vip-image" aria-label={nameFor(vip, locale)}>
          <ServicePhoto id="vip" placement="home" locale={locale} sizes="(min-width: 1024px) 50vw, calc(100vw - 32px)" />
        </a>
      </div>

      <p className="home-services-note">{c.services.note}</p>
    </section>
  );
}
