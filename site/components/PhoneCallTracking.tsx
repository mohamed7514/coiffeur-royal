"use client";

import { useEffect } from "react";
import { business } from "@/lib/business";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** GTM owns Google Ads tags; this component only reports the phone interaction. */
export function PhoneCallTracking() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    const timers = new Set<number>();
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.location.pathname.startsWith("/design")) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href^='tel:']") : null;
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
          phone_number: business.phone,
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
