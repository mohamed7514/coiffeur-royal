import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";
import { Hours } from "./Hours";
import { Map } from "./Map";
import { OpenNow } from "./OpenNow";

/**
 * L'adresse, les heures, puis la carte. La carte n'est pas une iframe
 * chargée d'office — voir components/Map.tsx pour le détail.
 */
export function Visit({ locale }: { locale: Locale }) {
  const c = content[locale];
  const a = business.address;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${business.geo.lat},${business.geo.lng}`;

  return (
    <section id="visiter" className="section shell">
      <div className="flex flex-col gap-3">
        <span className="mini">{c.visit.label}</span>
        <h2 className="display h2">{c.visit.title2}</h2>
      </div>

      <div className="mt-14 grid gap-10 border-t border-ink pt-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="mini mb-3.5">{c.visit.addressLabel}</div>
          <p className="text-[1.15rem] leading-relaxed">
            {a.street}
            <br />
            <span className="text-mute">
              {a.city} ({a.region}), {a.sector}
            </span>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a href={directions} target="_blank" rel="noopener" className="btn">
              {c.visit.directions}
            </a>
            <a href={`tel:${business.phone}`} className="underlined num">
              {business.phoneDisplay}
            </a>
          </div>
        </div>

        <div>
          <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
            <span className="mini">{c.visit.hoursLabel}</span>
            <OpenNow locale={locale} />
          </div>
          <Hours locale={locale} />
        </div>
      </div>

      <div className="mt-14">
        <Map locale={locale} />
      </div>
    </section>
  );
}

/** Le dernier appel avant le pied de page, centré : chez CRISP, c'est
 *  la seule section qui ne tient pas la marge de gauche. */
export function Shout({ locale }: { locale: Locale }) {
  const c = content[locale];

  return (
    <section className="section shell flex flex-col items-center gap-7 text-center">
      <span className="mini">{c.shout.label}</span>
      <h2 className="display h2">{c.shout.title}</h2>
      <a href={business.booking} target="_blank" rel="noopener" className="btn">
        {c.nav.book}
      </a>
      <a href={`tel:${business.phone}`} className="underlined num">
        {business.phoneDisplay}
      </a>
    </section>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const c = content[locale];
  const a = business.address;

  return (
    <footer className="relative z-10 mt-[clamp(5rem,10vw,11rem)] border-t border-rule px-4 pt-10 md:px-8">
      <div className="flex flex-wrap justify-between gap-8 text-[0.9rem] text-mute">
        <div>
          <div className="display text-[1.4rem] tracking-[0.02em] text-ink">RoyalMK</div>
          <p className="mt-2.5">
            {a.street}
            <br />
            {a.city} ({a.region})
            <br />
            <a href={`tel:${business.phone}`} className="num transition-colors hover:text-ink">
              {business.phoneDisplay}
            </a>
          </p>
        </div>

        <div>
          <Hours locale={locale} compact />
        </div>

        <div className="flex flex-col gap-2">
          <a href={business.maps} target="_blank" rel="noopener" className="transition-colors hover:text-ink">
            Google
          </a>
          <a
            href={business.booking}
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-ink"
          >
            {c.footer.bookNote}
          </a>
          <a
            href={locale === "fr" ? "/services" : "/en/services"}
            className="transition-colors hover:text-ink"
          >
            {c.nav.services}
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-rule py-5 text-[0.75rem] text-mute">
        <span>
          © {new Date().getFullYear()} {business.name}. {c.footer.rights}
        </span>
        <span>{c.footer.bookNote}</span>
      </div>
    </footer>
  );
}

export function ActionBar({ locale }: { locale: Locale }) {
  const c = content[locale];

  return (
    <div className="actionbar">
      <a href={`tel:${business.phone}`}>{c.nav.call}</a>
      <a
        href={business.booking}
        target="_blank"
        rel="noopener"
        className="!bg-paper !text-ink"
      >
        {c.nav.book}
      </a>
    </div>
  );
}
