"use client";

import { useOpen } from "@/lib/useOpen";
import { type Locale } from "@/lib/content";

/**
 * État réel du salon, calculé à l'heure de Gatineau.
 *
 * Le premier rendu est volontairement neutre : la page est servie
 * statiquement, et afficher « Ouvert » depuis le serveur donnerait une
 * information périmée. L'état arrive après le montage, et la place est
 * réservée pour qu'il n'y ait pas de décalage à son arrivée.
 */
export function OpenNow({ locale, className = "" }: { locale: Locale; className?: string }) {
  const { state, label, detail } = useOpen(locale);

  return (
    <span
      className={`inline-flex min-h-[1.2rem] items-center gap-2.5 text-[0.78rem] uppercase tracking-[0.08em] ${className}`}
    >
      {state && (
        <>
          <span className={`dot ${state.open ? "dot-open" : ""}`} />
          {label} — {detail}
        </>
      )}
    </span>
  );
}
