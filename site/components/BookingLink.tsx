import type { CSSProperties, ReactNode } from "react";
import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";

/** Render a normal link; PhoneCallTracking delegates measurement for all links. */
export function BookingLink({ locale, placement, className, children, style }: {
  locale: Locale;
  placement: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const c = content[locale];
  return (
    <a
      href={business.booking}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      data-booking={placement}
    >
      {children ?? c.booking.label}
      <span className="sr-only"> {c.booking.newTab}</span>
    </a>
  );
}
