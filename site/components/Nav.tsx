"use client";

import { useEffect, useState } from "react";
import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";
import { LangToggle } from "./LangToggle";

/**
 * Liens à gauche, marque au centre, langue et réservation à droite.
 *
 * Sur l'accueil, l'en-tête est posé sur la photo du hero, donc clair ;
 * passé le hero, la page est beige et il bascule en noir. Partout
 * ailleurs — pages de services — il n'y a pas de photo, donc il est noir
 * dès le départ : d'où `overHero`.
 */
export function Nav({ locale, overHero = false }: { locale: Locale; overHero?: boolean }) {
  const c = content[locale];
  /** Les ancres ne vivent que sur l'accueil : depuis une page de service,
   *  elles doivent y ramener plutôt que de ne rien faire. */
  const home = locale === "fr" ? "/" : "/en";
  const [solid, setSolid] = useState(!overHero);

  useEffect(() => {
    if (!overHero) return;

    // Le hero est épinglé : il occupe deux écrans et demi de défilement,
    // pas un. Un seuil exprimé en hauteurs d'écran ferait basculer la
    // barre en beige alors que la photo est encore là. On se repère donc
    // sur la section qui suit le hero, quelle que soit sa durée.
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
      // la grille à trois colonnes pousse « Réserver » hors de l'écran.
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-[1.1rem] transition-colors duration-300 md:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 ${
        solid
          ? "border-b border-rule bg-paper text-ink"
          : "border-b border-transparent text-paper"
      }`}
    >
      <nav className="hidden items-center gap-6 text-[0.82rem] uppercase tracking-[0.06em] lg:flex">
        <a
          href={locale === "fr" ? "/services" : "/en/services"}
          className="opacity-75 transition-opacity hover:opacity-100"
        >
          {c.nav.services}
        </a>
        <a href={home + "#travaux"} className="opacity-75 transition-opacity hover:opacity-100">
          {c.nav.gallery}
        </a>
        <a href={home + "#visiter"} className="opacity-75 transition-opacity hover:opacity-100">
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
        <LangToggle locale={locale} />
        <a
          href={business.booking}
          target="_blank"
          rel="noopener"
          className="text-[0.82rem] font-bold uppercase tracking-[0.06em] transition-opacity hover:opacity-65"
        >
          {c.nav.book}
        </a>
      </div>
    </header>
  );
}
