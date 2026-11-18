import { createHmac, timingSafeEqual } from "node:crypto";
import { CalendarUnavailableError } from "./calendar";

/**
 * Lien d'annulation sans base de données : l'identifiant du rendez-vous,
 * signé avec un secret du serveur. Personne ne peut fabriquer le lien
 * d'un autre client sans ce secret.
 */

function secret(): string {
  const s = process.env.BOOKING_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV !== "production" || process.env.BOOKING_DEMO === "1" || process.env.BOOKING_CALENDAR === "demo") {
    return "royalmk-dev-secret-do-not-use-in-production";
  }
  throw new CalendarUnavailableError("BOOKING_SECRET manquant ou trop court (32 caractères minimum).");
}

const sign = (id: string) => createHmac("sha256", secret()).update(`cancel:${id}`).digest("base64url").slice(0, 32);

export const cancelToken = (id: string) => `${id}.${sign(id)}`;

/** L'identifiant du rendez-vous si la signature est bonne, sinon null. */
export function readCancelToken(token: string | null | undefined): string | null {
  if (!token || token.length > 200) return null;
  const [id, mac] = token.split(".");
  if (!id || !mac || !/^[0-9a-v]{5,64}$/.test(id)) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given) ? id : null;
}
