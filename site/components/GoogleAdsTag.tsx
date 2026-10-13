"use client";

import Script from "next/script";
import { useEffect } from "react";
import { business } from "@/lib/business";

const TAG_ID = "AW-18338323790";
const CONTACT_DESTINATION = "AW-18338323790/TaoYCNqIqJMdEM66sqhE";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** One delegated listener covers existing and newly rendered FR/EN phone links. */
export function GoogleAdsTag() {
  useEffect(() => {
    const timers = new Set<number>();
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.location.pathname.startsWith("/design")) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href^='tel:']") : null;
      const href = anchor?.getAttribute("href");
      if (!href || href.replace(/[ ()-]/g, "") !== "tel:" + business.phone || !window.gtag) return;

      // Give the conversion a short chance to send, while keeping phone links
      // usable when Google is blocked or never runs the callback.
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
      timer = window.setTimeout(openPhone, 1200);
      timers.add(timer);
      try {
        window.gtag("event", "conversion", {
          send_to: CONTACT_DESTINATION,
          event_callback: openPhone,
          event_timeout: 1000,
          transport_type: "beacon",
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

  return (
    <>
      <Script id="royalmk-google-ads-init" strategy="afterInteractive">{
        `window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
window.gtag('js', new Date());
window.gtag('config', '${TAG_ID}');`
      }</Script>
      <Script id="royalmk-google-ads-loader" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${TAG_ID}`} />
    </>
  );
}
