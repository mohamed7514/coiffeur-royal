import { createSign, randomBytes } from "node:crypto";
import { bookingRules } from "./config";
import { addDays, dateKeyOf, zonedInstant } from "./time";
import type { CalendarEvent, NewEvent } from "./types";

/**
 * L'agenda du salon, vu par la réservation.
 *
 * En production : Google Agenda, par un compte de service à qui l'agenda
 * du salon est partagé (« Apporter des modifications aux événements »).
 * Pas de bibliothèque Google : un jeton signé avec `node:crypto` et
 * quatre appels REST, c'est tout ce qu'il faut.
 *
 * Sans identifiants, hors production : un agenda de démonstration en
 * mémoire, prérempli, pour essayer le parcours de bout en bout.
 */

export interface CalendarStore {
  readonly demo: boolean;
  list(from: Date, to: Date, filter?: { phone?: string }): Promise<CalendarEvent[]>;
  get(id: string): Promise<CalendarEvent | null>;
  insert(event: NewEvent): Promise<CalendarEvent>;
  remove(id: string): Promise<void>;
}

export class CalendarUnavailableError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "CalendarUnavailableError";
  }
}

/** Identifiant accepté par Google comme id d'événement (base32hex). */
export function newEventId(): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuv";
  return Array.from(randomBytes(26), (b) => alphabet[b % 32]).join("");
}

/* ── Google Agenda ─────────────────────────────────────────────────── */

type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  transparency?: string;
  created?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Record<string, string> };
};

const API = "https://www.googleapis.com/calendar/v3";
const TIMEOUT_MS = 8000;

function fromGoogle(e: GoogleEvent): CalendarEvent | null {
  if (e.status === "cancelled" || !e.start || !e.end) return null;
  const allDay = Boolean(e.start.date && !e.start.dateTime);
  const start = allDay ? zonedInstant(e.start.date!, 0).getTime() : Date.parse(e.start.dateTime!);
  const end = allDay ? zonedInstant(e.end.date!, 0).getTime() : Date.parse(e.end.dateTime!);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return {
    id: e.id,
    start,
    end,
    allDay,
    transparent: e.transparency === "transparent",
    summary: e.summary ?? "",
    created: e.created ? Date.parse(e.created) : 0,
    meta: e.extendedProperties?.private ?? {},
  };
}

/** « fetch failed » seul ne dit rien : Node range la vraie cause (DNS, connexion coupée, délai) dans `cause`. */
function why(err: unknown): string {
  const cause = (err as { cause?: unknown })?.cause;
  return cause ? `${err} (${cause})` : `${err}`;
}

class GoogleCalendar implements CalendarStore {
  readonly demo = false;
  private token: { value: string; expires: number } | null = null;

  constructor(
    private readonly calendarId: string,
    private readonly clientEmail: string,
    private readonly privateKey: string,
  ) {}

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expires > Date.now() + 60_000) return this.token.value;

    const now = Math.floor(Date.now() / 1000);
    const encode = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
      iss: this.clientEmail,
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })}`;
    const signature = createSign("RSA-SHA256").update(unsigned).sign(this.privateKey, "base64url");

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${unsigned}.${signature}`,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch((err) => {
      throw new CalendarUnavailableError(`Jeton Google injoignable : ${why(err)}`);
    });
    if (!res.ok) throw new CalendarUnavailableError(`Jeton Google refusé (${res.status}) : ${await res.text()}`, res.status);

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
    return data.access_token;
  }

  /**
   * Un appel, avec une seconde chance pour les lectures et suppressions si
   * le réseau a eu un hoquet ou si Google répond 429/5xx. Jamais pour la
   * création : si la première a réussi sans qu'on le sache, la refaire
   * créerait un doublon.
   */
  private async call<T>(path: string, init: RequestInit = {}, allow404 = false): Promise<T | null> {
    const safeToRepeat = !init.method || init.method === "GET" || init.method === "DELETE";
    try {
      return await this.callOnce<T>(path, init, allow404);
    } catch (err) {
      const transient = err instanceof CalendarUnavailableError && (err.status === undefined || err.status === 429 || err.status >= 500);
      if (!safeToRepeat || !transient) throw err;
      console.warn("[reservation] Google Agenda : nouvel essai après", err.message);
      await new Promise((resolve) => setTimeout(resolve, 400));
      return this.callOnce<T>(path, init, allow404);
    }
  }

  private async callOnce<T>(path: string, init: RequestInit, allow404: boolean): Promise<T | null> {
    const res = await fetch(`${API}/calendars/${encodeURIComponent(this.calendarId)}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${await this.accessToken()}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch((err) => {
      throw new CalendarUnavailableError(`Google Agenda injoignable : ${why(err)}`);
    });
    if (allow404 && (res.status === 404 || res.status === 410)) return null;
    if (!res.ok) throw new CalendarUnavailableError(`Google Agenda ${res.status} : ${await res.text()}`, res.status);
    if (res.status === 204) return null;
    return (await res.json()) as T;
  }

  async list(from: Date, to: Date, filter?: { phone?: string }): Promise<CalendarEvent[]> {
    const out: CalendarEvent[] = [];
    let pageToken: string | undefined;
    do {
      const q = new URLSearchParams({
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        singleEvents: "true",
        maxResults: "2500",
        fields: "nextPageToken,items(id,status,summary,transparency,created,start,end,extendedProperties)",
      });
      if (filter?.phone) q.append("privateExtendedProperty", `phone=${filter.phone}`);
      if (pageToken) q.set("pageToken", pageToken);
      const data = await this.call<{ items?: GoogleEvent[]; nextPageToken?: string }>(`/events?${q}`);
      for (const e of data?.items ?? []) {
        const ev = fromGoogle(e);
        if (ev) out.push(ev);
      }
      pageToken = data?.nextPageToken;
    } while (pageToken);
    return out;
  }

  async get(id: string): Promise<CalendarEvent | null> {
    const e = await this.call<GoogleEvent>(`/events/${encodeURIComponent(id)}`, {}, true);
    return e ? fromGoogle(e) : null;
  }

  async insert(event: NewEvent): Promise<CalendarEvent> {
    const tz = bookingRules.timeZone;
    const created = await this.call<GoogleEvent>("/events", {
      method: "POST",
      body: JSON.stringify({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString(), timeZone: tz },
        end: { dateTime: event.end.toISOString(), timeZone: tz },
        transparency: "opaque",
        // Les rappels par défaut de l'agenda : le barbier est prévenu
        // comme pour tout autre rendez-vous.
        reminders: { useDefault: true },
        extendedProperties: { private: event.meta },
      }),
    });
    const ev = created && fromGoogle(created);
    if (!ev) throw new CalendarUnavailableError("Réponse inattendue de Google Agenda à la création.");
    return ev;
  }

  async remove(id: string): Promise<void> {
    await this.call(`/events/${encodeURIComponent(id)}`, { method: "DELETE" }, true);
  }
}

/* ── Agenda de démonstration ───────────────────────────────────────── */

/** Un agenda plausible : quelques clients chaque jour, une pause midi,
 *  un dimanche fermé de temps en temps. Toujours le même pour une date. */
class DemoCalendar implements CalendarStore {
  readonly demo = true;
  private events = new Map<string, CalendarEvent>();
  private seeded = new Set<string>();

  private seed(date: string) {
    if (this.seeded.has(date)) return;
    this.seeded.add(date);
    let h = 0;
    for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const rand = () => ((h = (h * 1103515245 + 12345) >>> 0) / 2 ** 32);

    const add = (startMin: number, minutes: number, summary: string) => {
      const id = `demo${date.replaceAll("-", "")}${startMin}`;
      this.events.set(id, {
        id,
        start: zonedInstant(date, startMin).getTime(),
        end: zonedInstant(date, startMin + minutes).getTime(),
        allDay: false,
        transparent: false,
        summary,
        created: 0,
        meta: {},
      });
    };

    if (rand() < 0.08) {
      const id = `demo${date.replaceAll("-", "")}closed`;
      this.events.set(id, {
        id,
        start: zonedInstant(date, 0).getTime(),
        end: zonedInstant(addDays(date, 1), 0).getTime(),
        allDay: true,
        transparent: true,
        summary: "Fermé",
        created: 0,
        meta: {},
      });
      return;
    }

    add(12 * 60 + 30, 30, "Pause");
    for (let t = 9 * 60; t < 19 * 60; t += 30) {
      if (rand() < 0.38) add(t, 30, "Client");
    }
  }

  async list(from: Date, to: Date, filter?: { phone?: string }) {
    for (let d = dateKeyOf(from); d <= dateKeyOf(to); d = addDays(d, 1)) this.seed(d);
    return [...this.events.values()].filter(
      (e) =>
        e.start < to.getTime() &&
        e.end > from.getTime() &&
        (!filter?.phone || e.meta.phone === filter.phone),
    );
  }

  async get(id: string) {
    return this.events.get(id) ?? null;
  }

  async insert(event: NewEvent) {
    const ev: CalendarEvent = {
      id: event.id,
      start: event.start.getTime(),
      end: event.end.getTime(),
      allDay: false,
      transparent: false,
      summary: event.summary,
      created: Date.now(),
      meta: event.meta,
    };
    this.events.set(ev.id, ev);
    return ev;
  }

  async remove(id: string) {
    this.events.delete(id);
  }
}

/* ── Choix de l'agenda ─────────────────────────────────────────────── */

const g = globalThis as unknown as { __royalmkCalendar?: CalendarStore };

/** L'agenda à utiliser, ou une erreur si la production n'est pas configurée. */
export function calendar(): CalendarStore {
  if (g.__royalmkCalendar) return g.__royalmkCalendar;

  const id = process.env.GOOGLE_CALENDAR_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Les hébergeurs stockent souvent la clé sur une ligne, avec des « \n » littéraux.
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // `BOOKING_CALENDAR=demo` force la démonstration même si les identifiants
  // Google sont présents : pour essayer le site ou le tester sans écrire
  // dans le vrai agenda.
  const forceDemo = process.env.BOOKING_CALENDAR === "demo";

  if (!forceDemo && id && email && key) {
    g.__royalmkCalendar = new GoogleCalendar(id, email, key);
  } else if (forceDemo || process.env.NODE_ENV !== "production" || process.env.BOOKING_DEMO === "1") {
    g.__royalmkCalendar = new DemoCalendar();
  } else {
    throw new CalendarUnavailableError(
      "Réservation non configurée : GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_PRIVATE_KEY sont requis.",
    );
  }
  return g.__royalmkCalendar;
}
