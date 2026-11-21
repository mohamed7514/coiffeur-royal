"use client";

import { useEffect } from "react";
import { business } from "@/lib/business";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Valeur estimée d'un appel, en CAD, pour Google Ads : le prix d'une coupe.
 * Un appel n'est pas toujours un rendez-vous, il vaut donc moins qu'une
 * réservation en ligne, dont la valeur est le prix réel du service.
 */
const CALL_VALUE = 25;

/** Où le lien d'appel a été cliqué : data-call explicite, sinon la zone de la page. */
function callLocation(anchor: HTMLAnchorElement): string {
  const tagged = anchor.closest<HTMLElement>("[data-call]");
  if (tagged?.dataset.call) return tagged.dataset.call;
  // Bouton d'appel voisin d'un bouton « Réserver » : même emplacement.
  const twin = anchor.parentElement?.querySelector<HTMLElement>("[data-booking]");
  if (twin?.dataset.booking) return twin.dataset.booking;
  if (anchor.closest("header, nav")) return "navigation";
  if (anchor.closest("footer")) return "pied-de-page";
  return anchor.closest<HTMLElement>("section[id]")?.id || "page";
}

/** GTM owns Google Ads tags; one listener reports phone and booking clicks. */
export function PhoneCallTracking() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    const timers = new Set<number>();
    const onClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a") : null;
      if (anchor?.hasAttribute("data-booking")) {
        try {
          window.dataLayer!.push({
            event: "booking_click",
            booking_provider: "site",
            booking_url: anchor.getAttribute("href"),
            link_location: anchor.dataset.booking,
            page_path: window.location.pathname,
          });
        } catch { /* Booking stays available when measurement is blocked. */ }
        return;
      }
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.location.pathname.startsWith("/design")) return;
      const href = anchor?.getAttribute("href");
      if (!href || href.replace(/[ ()-]/g, "") !== "tel:" + business.phone) return;

      event.preventDefault();
      let opened = false;
      let timer: number;
      const openPhone = () => {
        if (opened) return;
        opened = true;
        window.clearTimeout(timer);
        timers.delete(timer);
        window.location.href = href;
      };
      // GTM calls back once its tags finish; this fallback keeps the link usable
      // if the container is blocked, unpublished, or never calls back.
      timer = window.setTimeout(openPhone, 1200);
      timers.add(timer);
      try {
        window.dataLayer!.push({
          event: "phone_call_click",
          conversion_type: "appel",
          value: CALL_VALUE,
          currency: "CAD",
          phone_number: business.phone,
          call_location: callLocation(anchor!),
          // Un clic sur ordinateur n'ouvre souvent aucun appel : GTM peut filtrer dessus.
          call_device: window.matchMedia("(pointer: coarse)").matches ? "mobile" : "ordinateur",
          page_path: window.location.pathname,
          eventCallback: openPhone,
          eventTimeout: 1000,
        });
      } catch {
        openPhone();
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
