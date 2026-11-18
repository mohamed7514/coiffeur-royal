import { bookableService } from "./config";
import { isDateKey } from "./time";
import type { BookingRequest } from "./types";

/** Téléphone en format international (E.164), ou null s'il est invalide. */
export function normalizePhone(raw: string): string | null {
  const t = raw.trim();
  const digits = t.replace(/\D/g, "");
  if (t.startsWith("+")) {
    if (digits.startsWith("1")) return digits.length === 11 && /^1[2-9]/.test(digits) ? `+${digits}` : null;
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10 && /^[2-9]/.test(digits)) return `+1${digits}`;
  if (digits.length === 11 && /^1[2-9]/.test(digits)) return `+${digits}`;
  return null;
}

/** (819) 555-1234 pour un numéro nord-américain, sinon tel quel. */
export function displayPhone(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

export const isEmail = (s: string) => s.length <= 254 && /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/i.test(s);

/** Texte libre nettoyé : sans caractères de contrôle, espaces resserrées. */
const clean = (v: unknown, max: number, multiline = false) => {
  if (typeof v !== "string") return "";
  const s = v.replace(multiline ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, " ");
  return (multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ")).trim().slice(0, max);
};

export type Validation = { ok: true; value: BookingRequest } | { ok: false; field: string };

export function validateBooking(body: unknown): Validation {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const service = typeof b.service === "string" ? bookableService(b.service) : undefined;
  if (!service) return { ok: false, field: "service" };

  const date = typeof b.date === "string" && isDateKey(b.date) ? b.date : "";
  if (!date) return { ok: false, field: "date" };

  const time = typeof b.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(b.time) ? b.time : "";
  if (!time) return { ok: false, field: "time" };

  const firstName = clean(b.firstName, 60);
  if (firstName.length < 1) return { ok: false, field: "firstName" };

  const lastName = clean(b.lastName, 60);

  const phone = normalizePhone(typeof b.phone === "string" ? b.phone : "");
  if (!phone) return { ok: false, field: "phone" };

  const email = clean(b.email, 254).toLowerCase();
  if (!isEmail(email)) return { ok: false, field: "email" };

  return {
    ok: true,
    value: {
      service: service.id,
      date,
      time,
      firstName,
      lastName,
      phone,
      email,
      note: clean(b.note, 500, true),
      locale: b.locale === "en" ? "en" : "fr",
      website: typeof b.website === "string" ? b.website : "",
      elapsed: typeof b.elapsed === "number" && Number.isFinite(b.elapsed) ? b.elapsed : 0,
    },
  };
}
