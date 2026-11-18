import { after } from "next/server";
import { alertSalon } from "./alert";
import { CalendarUnavailableError } from "./calendar";
import { BookingFailure } from "./service";
import type { BookingErrorCode } from "./types";

const STATUS: Record<BookingErrorCode, number> = {
  invalid: 400,
  slot_taken: 409,
  too_many: 409,
  rate_limited: 429,
  unavailable: 503,
  not_found: 404,
  too_late: 409,
  already_cancelled: 410,
};

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

export const json = (data: unknown, status = 200) => Response.json(data, { status, headers });

export const fail = (error: BookingErrorCode, field?: string) => json({ error, field }, STATUS[error]);

/** Toute erreur devient une réponse propre ; seul l'inattendu est journalisé. */
export function failure(err: unknown) {
  if (err instanceof BookingFailure) return fail(err.code, err.field);
  const reason = err instanceof CalendarUnavailableError ? err.message : `erreur inattendue : ${err}`;
  console.error("[reservation] indisponible :", reason);
  // Après la réponse : le client ne doit pas attendre l'envoi du courriel.
  after(() => alertSalon(reason));
  return fail("unavailable");
}
