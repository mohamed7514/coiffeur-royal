"use client";

import { useEffect, useState } from "react";
import { business } from "@/lib/business";
import { dayNames, formatTime, gatineauNow } from "@/lib/hours";
import { type Locale } from "@/lib/content";

/** Semaine commençant le lundi, à la québécoise. */
const order = [1, 2, 3, 4, 5, 6, 0];

type Group = { days: number[]; open: number; close: number };

/**
 * Les heures par plages, pas sept lignes : « Lundi – samedi : 9 h – 19 h ».
 * Le regroupement se calcule à partir de lib/business.ts plutôt que d'être
 * écrit à la main, donc un changement d'horaire se répercute tout seul.
 */
function grouped(): Group[] {
  const out: Group[] = [];
  for (const d of order) {
    const h = business.hours[d];
    const last = out[out.length - 1];
    if (last && last.open === h.open && last.close === h.close) last.days.push(d);
    else out.push({ days: [d], open: h.open, close: h.close });
  }
  return out;
}

const label = (g: Group, locale: Locale) => {
  const names = dayNames[locale];
  if (g.days.length === 1) return names[g.days[0]];
  const last = names[g.days[g.days.length - 1]];
  // En français, le second jour d'une plage ne prend pas de majuscule.
  return `${names[g.days[0]]} – ${locale === "fr" ? last.toLowerCase() : last}`;
};

export function Hours({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setToday(gatineauNow().day);
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const groups = grouped();

  if (compact) {
    return (
      <div className="flex flex-col gap-1.5 text-[0.9rem]">
        {groups.map((g) => (
          <p key={g.days.join()}>
            {label(g, locale)} : <span className="num">
              {formatTime(g.open, locale)} – {formatTime(g.close, locale)}
            </span>
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-[1.02rem] text-mute">
      {groups.map((g) => {
        const isToday = today !== null && g.days.includes(today);
        return (
          <div
            key={g.days.join()}
            className={`flex justify-between gap-6 ${isToday ? "font-bold text-ink" : ""}`}
          >
            <span>{label(g, locale)}</span>
            <span className="num">
              {formatTime(g.open, locale)} – {formatTime(g.close, locale)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
