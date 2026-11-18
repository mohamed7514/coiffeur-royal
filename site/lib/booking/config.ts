import { allServices, business, type Service, type ServiceId } from "@/lib/business";

/**
 * Règles de la réservation en ligne, à un seul endroit.
 *
 * Les heures d'ouverture et les services restent dans `lib/business.ts` :
 * la réservation lit la même source que le reste du site, donc un
 * changement d'horaire ou de prix s'applique partout d'un coup.
 */
export const bookingRules = {
  /** Fuseau du salon. Toutes les heures affichées et calculées y sont. */
  timeZone: "America/Toronto",

  /** Pas entre deux débuts de créneau, en minutes. 30 colle aux services
   *  de 30 min et évite les trous de 15 min inutilisables dans l'agenda. */
  slotStep: 30,

  /** Délai minimal avant un rendez-vous pris en ligne, en minutes. */
  minNotice: 60,

  /** Jusqu'où on peut réserver, en jours (aujourd'hui compris). */
  horizonDays: 30,

  /** Temps laissé libre après chaque rendez-vous, en minutes. */
  buffer: 0,

  /** Rendez-vous à venir permis par numéro de téléphone (anti-abus). */
  maxUpcomingPerPhone: 2,

  /** En deçà de ce délai, l'annulation en ligne est fermée : il faut appeler. */
  cancelCutoffMinutes: 120,

  /** Événements « toute la journée » dont le titre ferme la journée, même
   *  marqués « Disponible » dans Google Agenda (leur réglage par défaut). */
  // Pas de `\b` : en JavaScript il ignore les lettres accentuées, et
  // « Fermé » ne serait pas reconnu. Les bornes sont posées en Unicode.
  closureWords: /(?<!\p{L})(ferm[ée]e?|fermeture|closed?|cong[ée]s?|vacances?|f[ée]ri[ée]e?|holidays?|off)(?!\p{L})/iu,
} as const;

/** Tous les services se réservent, forfait VIP compris. */
export const bookableServices: Service[] = allServices;

export const bookableService = (id: string | null | undefined) =>
  bookableServices.find((s) => s.id === id) as Service | undefined;

export const isServiceId = (id: string): id is ServiceId => Boolean(bookableService(id));

export const salonHours = business.hours;

/** Marque posée sur chaque événement créé par le site, pour les retrouver. */
export const EVENT_SOURCE = "royalmk-site";
