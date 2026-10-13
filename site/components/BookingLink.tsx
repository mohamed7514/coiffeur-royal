"use client";

import type { CSSProperties, ReactNode } from "react";
import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";

/** A normal external link works before hydration and keeps the shop page open. */
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
      onClick={() => {
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "booking_click",
            booking_provider: "squire",
            booking_url: business.booking,
            link_location: placement,
            page_path: window.location.pathname,
          });
        } catch { /* Booking stays available when measurement is blocked. */ }
      }}
    >
      {children ?? c.booking.label}
      <span className="sr-only"> {c.booking.newTab}</span>
    </a>
  );
}
