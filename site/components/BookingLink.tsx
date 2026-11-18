import type { CSSProperties, ReactNode } from "react";
import type { ServiceId } from "@/lib/business";
import { content, type Locale } from "@/lib/content";
import { bookingPaths } from "@/lib/booking/copy";

/**
 * Lien vers la réservation en ligne du site, dans la même fenêtre.
 * `service` préchoisit la prestation : depuis la page d'un service, le
 * client arrive directement au choix du jour et de l'heure.
 * PhoneCallTracking mesure le clic pour tous les liens `data-booking`.
 */
export function BookingLink({ locale, placement, service, className, children, style }: {
  locale: Locale;
  placement: string;
  service?: ServiceId;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const c = content[locale];
  const href = service ? `${bookingPaths[locale]}?service=${service}` : bookingPaths[locale];
  return (
    <a href={href} className={className} style={style} data-booking={placement}>
      {children ?? c.booking.label}
    </a>
  );
}
