"use client";

import { useEffect, useState } from "react";
import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";
import { LangToggle, type LanguagePaths } from "./LangToggle";
import { BookingLink } from "./BookingLink";

/**
 * Liens à gauche, marque au centre, langue et réservation à droite.
 *
 * Sur l'accueil, l'en-tête est posé sur la photo du hero, donc clair ;
 * passé le hero, la page est beige et il bascule en noir. Partout
 * ailleurs — pages de services — il n'y a pas de photo, donc il est noir
 * dès le départ : d'où `overHero`.
 */
export function Nav({ locale, overHero = false, languagePaths, localNavigation = false }: {
  locale: Locale;
  overHero?: boolean;
  languagePaths?: LanguagePaths;
  localNavigation?: boolean;
}) {
  const c = content[locale];
  /** Les ancres ne vivent que sur l'accueil : depuis une page de service,
   *  elles doivent y ramener plutôt que de ne rien faire. */
  const home = locale === "fr" ? "/" : "/en";
  const sectionBase = localNavigation ? "" : home;
  const [solid, setSolid] = useState(!overHero);

  useEffect(() => {
    if (!overHero) return;

    // Le fond change quand la section qui suit le hero atteint le menu.
    const after = document.getElementById("apres-hero");

    const onScroll = () => {
      const top = after
        ? after.getBoundingClientRect().top
        : window.innerHeight * 0.85 - window.scrollY;
      setSolid(top <= 72);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  return (
    <header
      // Marque centrée seulement là où les liens existent : plus bas,
      // la grille à trois colonnes pousse « Appeler » hors de l'écran.
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-[1.1rem] transition-colors duration-300 md:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 ${
        solid
          ? "border-b border-rule bg-paper text-ink"
          : "border-b border-transparent text-paper"
      }`}
    >
      <nav className="hidden items-center gap-6 text-[0.82rem] uppercase tracking-[0.06em] lg:flex">
        <a
          href={localNavigation ? "#services" : locale === "fr" ? "/services" : "/en/services"}
          className="opacity-75 transition-opacity hover:opacity-100"
        >
          {c.nav.services}
        </a>
        <a href={sectionBase + "#travaux"} className="opacity-75 transition-opacity hover:opacity-100">
          {c.nav.gallery}
        </a>
        <a href={sectionBase + "#visiter"} className="opacity-75 transition-opacity hover:opacity-100">
          {c.nav.visit}
        </a>
      </nav>

      <a
        href={home}
        className="display text-[1.05rem] tracking-[0.02em] lg:col-start-2 lg:justify-self-center"
      >
        RoyalMK
      </a>

      <div className="flex items-center justify-end gap-3 md:gap-4 lg:col-start-3">
        <LangToggle locale={locale} paths={languagePaths} />
        <a
          href={`tel:${business.phone}`}
          className="hidden text-[0.82rem] font-bold uppercase tracking-[0.06em] transition-opacity hover:opacity-65 md:inline-flex"
        >
          {c.nav.call}
        </a>
        <BookingLink locale={locale} placement="nav" className="hidden border border-current px-3 py-2 md:inline-flex text-[0.75rem] font-bold uppercase tracking-[0.04em] transition-opacity hover:opacity-65">
          {c.nav.book}
        </BookingLink>
      </div>
    </header>
  );
}
