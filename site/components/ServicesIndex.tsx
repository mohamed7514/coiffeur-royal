import { ServicePhoto } from "./ServicePhoto";
import { allServices, business, nameFor, servicePath } from "@/lib/business";
import { serviceCopy } from "@/lib/services-content";
import { content, duration, price, type Locale } from "@/lib/content";
import { Nav } from "./Nav";
import { OpenNow } from "./OpenNow";
import { Visit, Shout, Footer, ActionBar } from "./Visit";
import { CallBadge } from "./CallBadge";
import { Lines } from "./Lines";

export function ServicesIndex({ locale }: { locale: Locale }) {
  const c = content[locale];

  return (
    <>
      <Nav locale={locale} />

      <main>
        <div className="wrapper">
          <Lines />

          <div className="section shell">
            <nav
              aria-label={locale === "fr" ? "fil d’Ariane" : "breadcrumb"}
              className="flex items-center gap-2 text-sm text-mute"
            >
              <a href={locale === "fr" ? "/" : "/en"} className="transition-colors hover:text-ink">
                {c.svc.home}
              </a>
              <span aria-hidden>/</span>
              <span>{c.svc.all}</span>
            </nav>

            <div className="mt-10 flex flex-col gap-3">
              <OpenNow locale={locale} className="text-mute" />
              <span className="mini">{c.services.label}</span>
              <h1 className="display h1">{c.svc.allTitle}</h1>
            </div>

            <p className="mt-8 max-w-[44ch] text-[1.05rem] text-mute">{c.svc.allLead}</p>

            <div className="mt-8">
              <a href={`tel:${business.phone}`} className="btn">
                {c.nav.call}
              </a>
            </div>

            {/* Chaque photo accompagne les informations du service dans un même lien. */}
            <div className="mt-14 grid gap-x-16 lg:grid-cols-2">
              {allServices.map((s) => (
                <a key={s.id} href={servicePath(s, locale)} className="service-index-link">
                  <ServicePhoto id={s.id} locale={locale} sizes="(min-width: 768px) 160px, 96px" />
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-semibold">{nameFor(s, locale)}</span>
                      <span className="mt-1 block max-w-[38ch] text-sm text-mute">
                        {serviceCopy[s.id][locale].tagline}
                      </span>
                      <span className="mt-1.5 block text-[0.8rem] uppercase tracking-[0.04em] text-mute">
                        {duration(s.minutes, locale)}
                      </span>
                    </span>
                    <span className="row-price whitespace-nowrap">{price(s.price, locale)}</span>
                  </span>
                </a>
              ))}
            </div>

            <p className="mt-10 text-[0.85rem] text-mute">{c.services.note}</p>
          </div>

          <Visit locale={locale} />
          <Shout locale={locale} />
        </div>
      </main>

      <Footer locale={locale} />
      <CallBadge locale={locale} />
      <ActionBar locale={locale} />
    </>
  );
}
