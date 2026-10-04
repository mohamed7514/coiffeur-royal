import { business } from "./business";

/**
 * L'état « ouvert / fermé » se calcule dans le fuseau du salon
 * (America/Toronto), pas dans celui du visiteur. Quelqu'un qui consulte
 * depuis Vancouver doit lire les heures de Gatineau.
 */

export type OpenState =
  | { open: true; closesAt: number }
  | { open: false; nextDay: number; nextOpen: number; today: boolean };

/** Minutes depuis minuit + jour de la semaine, heure de Gatineau. */
export function gatineauNow(d: Date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const days: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  // "24" peut apparaître à minuit selon la plateforme
  const hour = Number(get("hour")) % 24;

  return { day: days[get("weekday")] ?? 0, minutes: hour * 60 + Number(get("minute")) };
}

export function openState(now = gatineauNow()): OpenState {
  const today = business.hours[now.day];

  if (today && now.minutes >= today.open && now.minutes < today.close) {
    return { open: true, closesAt: today.close };
  }

  // Pas encore ouvert aujourd'hui
  if (today && now.minutes < today.open) {
    return { open: false, nextDay: now.day, nextOpen: today.open, today: true };
  }

  // Prochaine ouverture : le salon ouvre 7 j/7, donc c'est demain
  const nextDay = (now.day + 1) % 7;
  return {
    open: false,
    nextDay,
    nextOpen: business.hours[nextDay].open,
    today: false,
  };
}

export function formatTime(minutes: number, locale: "fr" | "en"): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (locale === "fr") {
    // Convention québécoise : « 9 h », « 11 h 30 »
    return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
  }

  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

export const dayNames = {
  fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
