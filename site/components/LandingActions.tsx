import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";
import { ActionIcon } from "./ActionIcon";
import { BookingLink } from "./BookingLink";

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.geo.lat},${business.geo.lng}`;

/** Plain server-rendered links keep the first actions available before hydration. */
export function LandingActions({ locale, placement }: { locale: Locale; placement: string }) {
  const c = content[locale];
  return (
    <div className="landing-actions" data-primary-actions>
      <BookingLink locale={locale} placement={placement} className="btn">
        <ActionIcon kind="book" /><span>{c.nav.book}</span>
      </BookingLink>
      <a href={`tel:${business.phone}`} className="btn landing-call">
        <ActionIcon kind="call" /><span>{c.nav.call}</span>
      </a>
      <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="landing-directions">
        {c.visit.directions} <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
