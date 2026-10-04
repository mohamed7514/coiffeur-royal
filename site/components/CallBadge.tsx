"use client";

import { useEffect, useState } from "react";
import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";
import { useOpen } from "@/lib/useOpen";

/**
 * Bouton d'appel flottant, sur grand écran seulement.
 *
 * Sur mobile, la barre d'action en bas de page fait déjà ce travail, et
 * mieux : elle tombe sous le pouce et ne recouvre pas le texte. Ce badge
 * comble le manque sur desktop, où rien ne suit le défilement à part
 * l'en-tête.
 *
 * Il n'apparaît qu'une fois le premier écran passé : par-dessus le hero,
 * il ferait doublon avec le bouton de réservation. L'étiquette suit
 * l'état réel du salon — quand c'est fermé, elle dit quand ça rouvre
 * plutôt que d'inviter à appeler dans le vide.
 */
export function CallBadge({ locale }: { locale: Locale }) {
  const { state, label, detail } = useOpen(locale);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={`tel:${business.phone}`}
      aria-label={`${content[locale].hero.call} ${business.phoneDisplay}`}
      className={`fixed bottom-6 right-6 z-50 hidden items-center gap-3 bg-ink px-5 py-3.5 text-[0.82rem] leading-tight text-paper transition-all duration-300 md:flex ${
        shown ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
      }`}
    >
      {state && (
        <span>
          <b className="block uppercase tracking-[0.04em]">{label}</b>
          <span className="block opacity-60">{detail}</span>
        </span>
      )}

      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
      </svg>
    </a>
  );
}
