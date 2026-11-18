import { bookingRules } from "./config";

/**
 * Dates « murales » du salon, sans bibliothèque.
 *
 * Une date de calendrier circule sous forme de clé `AAAA-MM-JJ` et une
 * heure sous forme de minutes depuis minuit, toujours dans le fuseau du
 * salon. On ne passe en `Date` (instant UTC) qu'au contact de Google
 * Agenda. Le décalage horaire est relu à chaque conversion : les
 * changements d'heure d'automne et de printemps tombent juste.
 */

const TZ = bookingRules.timeZone;

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function zonedParts(date: Date) {
  const p: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(date)) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  return { year: p.year, month: p.month, day: p.day, hour: p.hour % 24, minute: p.minute, second: p.second };
}

/** Écart du fuseau du salon avec UTC à cet instant, en minutes (−300 l'hiver). */
function offsetMinutes(date: Date): number {
  const p = zonedParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** Instant réel d'une heure murale du salon. */
export function zonedInstant(dateKey: string, minutes: number): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d, 0, minutes);
  const first = wall - offsetMinutes(new Date(wall)) * 60000;
  const second = wall - offsetMinutes(new Date(first)) * 60000;
  return new Date(second);
}

/** Clé de date du salon pour un instant. */
export function dateKeyOf(date: Date): string {
  const p = zonedParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Minutes depuis minuit, heure du salon, pour un instant. */
export function minutesOf(date: Date): number {
  const p = zonedParts(date);
  return p.hour * 60 + p.minute;
}

export function addDays(dateKey: string, n: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

/** 0 = dimanche, comme `business.hours`. */
export function weekdayOf(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export const isDateKey = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/** « 09:30 » ↔ 570. */
export const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
