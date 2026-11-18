import type { Locale } from "@/lib/content";
import { formatTime } from "@/lib/hours";

/**
 * Mise en forme des dates de réservation, côté serveur comme côté
 * navigateur. Une clé `AAAA-MM-JJ` est une date de calendrier, sans
 * heure : on la formate en UTC pour qu'aucun fuseau ne la décale d'un jour.
 */

const localeTag = (l: Locale) => (l === "fr" ? "fr-CA" : "en-CA");
const utcDate = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

/** « lundi 17 novembre » / « Monday, November 17 ». */
export const longDate = (key: string, l: Locale) =>
  new Intl.DateTimeFormat(localeTag(l), { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(utcDate(key));

/** « lun. » / « Mon ». */
export const shortWeekday = (key: string, l: Locale) =>
  new Intl.DateTimeFormat(localeTag(l), { timeZone: "UTC", weekday: "short" }).format(utcDate(key)).replace(/\.$/, "");

/** « nov. » / « Nov ». */
export const shortMonth = (key: string, l: Locale) =>
  new Intl.DateTimeFormat(localeTag(l), { timeZone: "UTC", month: "short" }).format(utcDate(key)).replace(/\.$/, "");

/** « novembre 2026 » / « November 2026 ». */
export const monthYear = (key: string, l: Locale) =>
  new Intl.DateTimeFormat(localeTag(l), { timeZone: "UTC", month: "long", year: "numeric" }).format(utcDate(key));

export const dayNumber = (key: string) => Number(key.slice(8, 10));

export const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** « 14 h 30 » / « 2:30pm », la convention déjà utilisée sur le site. */
export const timeLabel = (hhmm: string, l: Locale) => formatTime(toMinutes(hhmm), l);

/** « lundi 17 novembre à 14 h 30 » / « Monday, November 17 at 2:30pm ». */
export const whenLabel = (date: string, time: string, l: Locale) =>
  `${longDate(date, l)} ${l === "fr" ? "à" : "at"} ${timeLabel(time, l)}`;
