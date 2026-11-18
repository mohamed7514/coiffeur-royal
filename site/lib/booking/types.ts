import type { ServiceId } from "@/lib/business";
import type { Locale } from "@/lib/content";

/** Une plage occupée de l'agenda, en instants UTC (ms). */
export type Busy = { start: number; end: number };

/** Un événement de l'agenda tel que la réservation a besoin de le voir. */
export type CalendarEvent = {
  id: string;
  start: number;
  end: number;
  /** Événement « toute la journée ». */
  allDay: boolean;
  /** Marqué « Disponible » dans Google Agenda : ne bloque rien. */
  transparent: boolean;
  summary: string;
  /** Instant de création, pour départager deux réservations simultanées. */
  created: number;
  /** Propriétés privées posées par le site (vides pour les autres). */
  meta: Record<string, string>;
};

export type NewEvent = {
  id: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  meta: Record<string, string>;
};

/** `closed` : salon fermé ce jour-là (horaire ou fermeture dans l'agenda),
 *  par opposition à une journée simplement complète. */
export type DayAvailability = { date: string; slots: string[]; closed: boolean };

export type AvailabilityResponse = {
  service: ServiceId;
  timeZone: string;
  days: DayAvailability[];
  demo: boolean;
};

export type BookingRequest = {
  service: ServiceId;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note: string;
  locale: Locale;
  /** Champ piège invisible : rempli seulement par les robots. */
  website: string;
  /** Millisecondes passées sur le formulaire. */
  elapsed: number;
};

export type Booking = {
  id: string;
  service: ServiceId;
  date: string;
  time: string;
  minutes: number;
  price: number;
  start: string;
  end: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note: string;
  locale: Locale;
};

export type BookingConfirmation = {
  booking: Booking;
  cancelToken: string;
  emailSent: boolean;
  demo: boolean;
};

export type BookingErrorCode =
  | "invalid"
  | "slot_taken"
  | "too_many"
  | "rate_limited"
  | "unavailable"
  | "not_found"
  | "too_late"
  | "already_cancelled";

export type BookingError = { error: BookingErrorCode; field?: string };
