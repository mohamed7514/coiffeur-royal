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
    <>
      <ServiceJsonLd service={service} locale={locale} />
      <Nav locale={locale} />

      <main>
        <article className="wrapper">
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

            <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
              <div>
                <OpenNow locale={locale} className="text-mute" />

                <div className="mini mt-3">{c.svc.all}</div>

                <h1 className="display h1 mt-2">
                  {name} {c.svc.inCity}
                </h1>

                <p className="mt-8 max-w-[44ch] text-[1.05rem] text-mute">{copy.lead}</p>

                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <a href={`tel:${business.phone}`} className="btn">
                    {c.hero.call}
                  </a>
                  <a href="#visiter" className="underlined">
                    {c.visit.title}
                  </a>
                </div>

                <p className="mt-5 max-w-[46ch] text-[0.85rem] text-mute">{c.svc.walkInNote}</p>
              </div>

              {/* Prix et durée tenus ensemble : les deux questions qu'on se
                  pose avant de réserver quoi que ce soit. */}
              <div className="self-start">
                <figure className="m-0 mb-8 max-w-[600px]">
                  <ServicePhoto id={service.id} locale={locale} sizes="(min-width: 1024px) 40vw, (min-width: 640px) 600px, calc(100vw - 32px)" preload />
                  {photo.caption && <figcaption className="mt-3 text-sm text-mute">{photo.caption[locale]}</figcaption>}
                </figure>
                <aside className="border-t border-ink pt-6">
                  <div className="flex flex-wrap gap-12">
                    <div>
                      <div className="mini">{c.svc.price}</div>
                      <div className="display num mt-2 text-[clamp(2.4rem,6vw,3.4rem)] leading-[0.85]">
                        {price(service.price, locale)}
                      </div>
                    </div>
                    <div>
                      <div className="mini">{c.svc.duration}</div>
                      <div className="display num mt-2 text-[clamp(2.4rem,6vw,3.4rem)] leading-[0.85]">
                        {duration(service.minutes, locale)}
                      </div>
                    </div>
                  </div>

                  {saved > 0 && (
                    <p className="mt-6 text-[0.85rem] text-mute">
                      <s className="num">{price(service.partsTotal ?? 0, locale)}</s>{" "}
                      {c.svc.savings(saved)}
                    </p>
                  )}

                  <div className="mt-8 border-t border-rule pt-5">
                    <div className="mini">{c.visit.addressLabel}</div>
                    <p className="mt-2 leading-snug">
                      {business.address.street}
                      <br />
                      <span className="text-mute">
                        {business.address.city}, {business.address.sector}
                      </span>
                    </p>
                  </div>
                </aside>
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
              <p className="mt-6 max-w-[48ch] leading-relaxed text-mute">{copy.forWho}</p>
            </div>
          </div>

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
          </div>

          <Visit locale={locale} />
          <Shout locale={locale} />
        </article>
      </main>

      <Footer locale={locale} />
      <CallBadge locale={locale} />
      <ActionBar locale={locale} />
    </>
  );
}
