"use client";

import { useEffect, useState } from "react";
import { content, type Locale } from "./content";
import { dayNames, formatTime, openState, type OpenState } from "./hours";

/**
 * État réel du salon, pour les composants qui l'affichent.
 * Null au premier rendu : la page est servie statiquement, donc annoncer
 * « ouvert » depuis le serveur donnerait une information périmée.
 */
export function useOpen(locale: Locale): { state: OpenState | null; label: string; detail: string } {
  const [state, setState] = useState<OpenState | null>(null);
  const t = content[locale].visit;

  useEffect(() => {
    const tick = () => setState(openState());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!state) return { state: null, label: "", detail: "" };

  return {
    state,
    label: state.open ? t.openNow : t.shut,
    detail: state.open
      ? t.closes(formatTime(state.closesAt, locale))
      : state.today
        ? t.opens(formatTime(state.nextOpen, locale))
        : t.opensDay(dayNames[locale][state.nextDay], formatTime(state.nextOpen, locale)),
  };
}
