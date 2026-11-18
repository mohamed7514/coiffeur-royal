import { nameFor, type ServiceId } from "@/lib/business";
import { price, duration } from "@/lib/content";
import { calendar, newEventId } from "./calendar";
import { bookableService, bookingRules, EVENT_SOURCE } from "./config";
import { sendCancellation, sendConfirmation } from "./email";
import { whenLabel } from "./format";
import { busyFrom, isSlotOpen, rangeSlots } from "./slots";
import { addDays, dateKeyOf, hhmm, minutesOf, zonedInstant } from "./time";
import { cancelToken, readCancelToken } from "./token";
import { displayPhone } from "./validate";
import type {
  AvailabilityResponse,
  Booking,
  BookingConfirmation,
  BookingErrorCode,
  BookingRequest,
  CalendarEvent,
} from "./types";

/**
 * Les trois opérations de la réservation : lire les disponibilités,
 * réserver, annuler. Les routes d'API ne font que les appeler.
 */

export class BookingFailure extends Error {
  constructor(readonly code: BookingErrorCode, readonly field?: string) {
    super(code);
    this.name = "BookingFailure";
  }
}

const dayStart = (date: string) => zonedInstant(date, 0);

/* ── Disponibilités ─────────────────────────────────────────────────── */

export async function availability(serviceId: ServiceId, now = Date.now()): Promise<AvailabilityResponse> {
  const service = bookableService(serviceId)!;
  const cal = calendar();
  const from = dateKeyOf(new Date(now));
  const days = bookingRules.horizonDays;
  const events = await cal.list(dayStart(from), dayStart(addDays(from, days)));
  return {
    service: service.id,
    timeZone: bookingRules.timeZone,
    days: rangeSlots({ from, days, minutes: service.minutes, events, now }),
    demo: cal.demo,
  };
}

/* ── Réserver ───────────────────────────────────────────────────────── */

function bookingFromEvent(e: CalendarEvent): Booking | null {
  const m = e.meta;
  const service = bookableService(m.service);
  if (m.source !== EVENT_SOURCE || !service) return null;
  const start = new Date(e.start);
  return {
    id: e.id,
    service: service.id,
    date: dateKeyOf(start),
    time: hhmm(minutesOf(start)),
    minutes: Math.round((e.end - e.start) / 60000),
    price: Number(m.price) || service.price,
    start: start.toISOString(),
    end: new Date(e.end).toISOString(),
    firstName: m.firstName ?? "",
    lastName: m.lastName ?? "",
    phone: m.phone ?? "",
    email: m.email ?? "",
    note: "",
    locale: m.locale === "en" ? "en" : "fr",
  };
}

export async function book(req: BookingRequest, now = Date.now()): Promise<BookingConfirmation> {
  const service = bookableService(req.service)!;
  const cal = calendar();

  // Rien à faire au-delà de l'horizon ouvert à la réservation.
  const today = dateKeyOf(new Date(now));
  if (req.date < today || req.date >= addDays(today, bookingRules.horizonDays)) throw new BookingFailure("slot_taken");

  // Anti-abus : pas plus de N rendez-vous à venir par numéro.
  const upcoming = await cal.list(new Date(now), dayStart(addDays(today, bookingRules.horizonDays + 1)), { phone: req.phone });
  if (upcoming.filter((e) => e.meta.source === EVENT_SOURCE).length >= bookingRules.maxUpcomingPerPhone) {
    throw new BookingFailure("too_many");
  }

  // Le créneau est-il toujours libre, selon les mêmes règles que l'affichage ?
  const window = () => cal.list(dayStart(req.date), dayStart(addDays(req.date, 1)));
  if (!isSlotOpen({ date: req.date, time: req.time, minutes: service.minutes, events: await window(), now })) {
    throw new BookingFailure("slot_taken");
  }

  const start = zonedInstant(req.date, Number(req.time.slice(0, 2)) * 60 + Number(req.time.slice(3, 5)));
  const end = new Date(start.getTime() + service.minutes * 60000);
  const fullName = `${req.firstName} ${req.lastName}`.trim();

  const ours = await cal.insert({
    id: newEventId(),
    start,
    end,
    summary: `${fullName} — ${nameFor(service, "fr")}`,
    description: [
      `Service : ${nameFor(service, "fr")} (${duration(service.minutes, "fr")}, ${price(service.price, "fr")})`,
      `Client : ${fullName}`,
      `Téléphone : ${displayPhone(req.phone)}`,
      `Courriel : ${req.email}`,
      req.note ? `Note du client : ${req.note}` : "",
      "",
      `Réservé en ligne sur le site (${req.locale.toUpperCase()}). Paiement au salon.`,
      "Pour annuler : supprimez l'événement et prévenez le client.",
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n"),
    meta: {
      source: EVENT_SOURCE,
      service: service.id,
      price: String(service.price),
      firstName: req.firstName,
      lastName: req.lastName,
      phone: req.phone,
      email: req.email,
      locale: req.locale,
    },
  });

  // Deux clients peuvent valider le même créneau à la même seconde. Après
  // l'écriture, on relit l'agenda : si un événement créé AVANT le nôtre
  // chevauche notre plage, on retire le nôtre. Les deux serveurs font le
  // même calcul et arrivent à la même conclusion — un seul gagne.
  const earlier = (e: CalendarEvent) =>
    e.id !== ours.id && (e.created < ours.created || (e.created === ours.created && e.id < ours.id));
  const clash = busyFrom((await window()).filter(earlier)).some((b) => b.start < ours.end && ours.start < b.end);
  if (clash) {
    await cal.remove(ours.id);
    throw new BookingFailure("slot_taken");
  }

  const booking: Booking = { ...bookingFromEvent(ours)!, note: req.note };
  const token = cancelToken(ours.id);
  const emailSent = cal.demo ? false : await sendConfirmation(booking, token);

  console.info(`[reservation] ${ours.id} ${service.id} ${whenLabel(booking.date, booking.time, "fr")}`);
  return { booking, cancelToken: token, emailSent, demo: cal.demo };
}

/* ── Annuler ────────────────────────────────────────────────────────── */

async function findByToken(token: string | null | undefined) {
  const id = readCancelToken(token);
  if (!id) throw new BookingFailure("not_found");
  const event = await calendar().get(id);
  if (!event) throw new BookingFailure("already_cancelled");
  const booking = bookingFromEvent(event);
  if (!booking) throw new BookingFailure("not_found");
  return booking;
}

export type CancelPreview = { booking: Booking; canCancel: boolean; past: boolean };

export async function previewCancel(token: string | null, now = Date.now()): Promise<CancelPreview> {
  const booking = await findByToken(token);
  const start = Date.parse(booking.start);
  return {
    booking,
    past: start <= now,
    canCancel: start - now >= bookingRules.cancelCutoffMinutes * 60000,
  };
}

export async function cancel(token: string | null, now = Date.now()): Promise<Booking> {
  const { booking, canCancel } = await previewCancel(token, now);
  if (!canCancel) throw new BookingFailure("too_late");
  const cal = calendar();
  await cal.remove(booking.id);
  if (!cal.demo) await sendCancellation(booking).catch((err) => console.error("[reservation] courriel d'annulation", err));
  console.info(`[reservation] annulé ${booking.id}`);
  return booking;
}
