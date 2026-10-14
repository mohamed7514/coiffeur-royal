"use client";

import { useEffect, useState } from "react";
import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";
import { BookingLink } from "./BookingLink";
import { ActionIcon } from "./ActionIcon";

/** The mobile bar takes over only when contextual actions leave the screen. */
export function MobileActionBar({ locale }: { locale: Locale }) {
  const c = content[locale];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    let observer: IntersectionObserver | undefined;
    const observeActions = () => {
      observer?.disconnect();
      setVisible(false);
      if (!mobile.matches) return;
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-hero], [data-primary-actions]"));
      if (!targets.length) { setVisible(true); return; }
      const headerHeight = Math.ceil(document.querySelector("header")?.getBoundingClientRect().height ?? 72);
      const barSpace = Math.ceil(parseFloat(getComputedStyle(document.body).paddingBottom));
      const visibility = new Map(targets.map(target => [target, false]));
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) visibility.set(entry.target as HTMLElement, entry.isIntersecting && entry.intersectionRatio > 0);
        setVisible(!Array.from(visibility.values()).some(Boolean));
      }, { rootMargin: `-${headerHeight}px 0px -${barSpace}px 0px`, threshold: 0 });
      for (const target of targets) observer.observe(target);
    };
    observeActions();
    mobile.addEventListener("change", observeActions);
    return () => { observer?.disconnect(); mobile.removeEventListener("change", observeActions); };
  }, []);

  return (
    <div className="actionbar" hidden={!visible}>
      <BookingLink locale={locale} placement="mobile-bar" className="attention-cta attention-cta-book">
        <span className="attention-sheen" aria-hidden="true" /><ActionIcon kind="book" /><span>{c.nav.book}</span>
      </BookingLink>
      <a href={`tel:${business.phone}`} className="attention-cta attention-cta-call">
        <span className="attention-sheen" aria-hidden="true" /><ActionIcon kind="call" /><span>{c.nav.call}</span>
      </a>
    </div>
  );
}
