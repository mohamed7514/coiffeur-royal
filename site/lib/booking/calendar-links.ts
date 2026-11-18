import { business, nameFor, type ServiceId } from "@/lib/business";
import type { Locale } from "@/lib/content";
import { bookableService } from "./config";

/**
 * « Ajouter à mon agenda » : un fichier .ics (Apple, Outlook, et la pièce
 * jointe du courriel) et un lien Google Agenda. Sans dépendance serveur,
 * pour servir aussi dans le navigateur.
 */

type Appointment = { id: string; service: ServiceId; start: string; end: string; locale: Locale };

const address = () => `${business.address.street}, ${business.address.city} (${business.address.region})`;

const title = (a: Appointment) => {
  const s = bookableService(a.service);
  return `${s ? nameFor(s, a.locale) : ""} — ${business.name}`;
};

const details = (a: Appointment) =>
  a.locale === "fr"
    ? `Paiement au salon. Un empêchement ? Appelez le ${business.phoneDisplay}.`
    : `Payment at the shop. Can't make it? Call ${business.phoneDisplay}.`;

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Échappement et pliage de lignes exigés par la norme iCalendar. */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
/** 75 octets par ligne au plus, sans couper un caractère accentué en deux. */
const fold = (line: string) => {
  const enc = new TextEncoder();
  let out = "";
  let cur = "";
  let len = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (len + n > 75) {
      out += cur + "\r\n ";
      cur = "";
      len = 1;
    }
    cur += ch;
    len += n;
  }
  return out + cur;
};

export function icsFile(a: Appointment, method: "PUBLISH" | "CANCEL" = "PUBLISH"): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Barbier RoyalMK//Reservation//FR",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${a.id}@royalmk.ca`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(a.start)}`,
    `DTEND:${stamp(a.end)}`,
    `SUMMARY:${esc(title(a))}`,
    `LOCATION:${esc(address())}`,
    `DESCRIPTION:${esc(details(a))}`,
    `STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT2H",
    `DESCRIPTION:${esc(title(a))}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(a: Appointment): string {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: title(a),
    dates: `${stamp(a.start)}/${stamp(a.end)}`,
    details: details(a),
    location: address(),
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}
