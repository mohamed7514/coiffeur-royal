import { bookingRules, salonHours } from "./config";
import { addDays, hhmm, weekdayOf, zonedInstant } from "./time";
import type { Busy, CalendarEvent, DayAvailability } from "./types";

/**
 * Calcul des créneaux libres. Fonction pure : elle reçoit l'agenda déjà lu
 * et l'heure actuelle, donc on la teste sans Google ni horloge.
 */

/** Les événements qui bloquent l'agenda. */
export function busyFrom(events: CalendarEvent[]): Busy[] {
  return events
    .filter((e) => {
      if (e.allDay) return !e.transparent || bookingRules.closureWords.test(e.summary);
      return !e.transparent;
    })
    .map((e) => ({ start: e.start, end: e.end }));
}

const overlaps = (aStart: number, aEnd: number, b: Busy) => aStart < b.end && b.start < aEnd;

/** Créneaux d'une journée pour une durée donnée, en heures « HH:MM ». */
export function daySlots(opts: {
  date: string;
  minutes: number;
  busy: Busy[];
  now: number;
  step?: number;
  minNotice?: number;
  buffer?: number;
}): string[] {
  const { date, minutes, busy, now } = opts;
  const step = opts.step ?? bookingRules.slotStep;
  const minNotice = opts.minNotice ?? bookingRules.minNotice;
  const buffer = opts.buffer ?? bookingRules.buffer;

  const hours = salonHours.find((h) => h.day === weekdayOf(date));
  if (!hours) return [];

  const earliest = now + minNotice * 60000;
  const slots: string[] = [];

  for (let t = hours.open; t + minutes <= hours.close; t += step) {
    const start = zonedInstant(date, t).getTime();
    if (start < earliest) continue;
    const end = start + (minutes + buffer) * 60000;
    if (busy.some((b) => overlaps(start, end, b))) continue;
    slots.push(hhmm(t));
  }
  return slots;
}

/** Créneaux de plusieurs jours de suite. */
export function rangeSlots(opts: {
  from: string;
  days: number;
  minutes: number;
  events: CalendarEvent[];
  now: number;
}): DayAvailability[] {
  const busy = busyFrom(opts.events);
  const closures = busyFrom(opts.events.filter((e) => e.allDay));
  const out: DayAvailability[] = [];
  for (let i = 0; i < opts.days; i++) {
    const date = addDays(opts.from, i);
    const hours = salonHours.find((h) => h.day === weekdayOf(date));
    const closed =
      !hours ||
      closures.some((c) => overlaps(zonedInstant(date, hours.open).getTime(), zonedInstant(date, hours.close).getTime(), c));
    out.push({ date, closed, slots: closed ? [] : daySlots({ date, minutes: opts.minutes, busy, now: opts.now }) });
  }
  return out;
}

/** Vrai si ce début précis est libre, selon les mêmes règles que l'affichage. */
export function isSlotOpen(opts: {
  date: string;
  time: string;
  minutes: number;
  events: CalendarEvent[];
  now: number;
  ignoreId?: string;
}): boolean {
  const events = opts.ignoreId ? opts.events.filter((e) => e.id !== opts.ignoreId) : opts.events;
  const slots = daySlots({ date: opts.date, minutes: opts.minutes, busy: busyFrom(events), now: opts.now });
  return slots.includes(opts.time);
}
