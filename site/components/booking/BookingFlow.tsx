"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { business, nameFor, type ServiceId } from "@/lib/business";
import { duration, price, type Locale } from "@/lib/content";
import { bookableService, bookableServices } from "@/lib/booking/config";
import { bookingCopy, cancelPaths } from "@/lib/booking/copy";
import { dayNumber, longDate, monthYear, shortMonth, shortWeekday, timeLabel } from "@/lib/booking/format";
import { trackConfirmed, trackStep } from "@/lib/booking/track";
import type { AvailabilityResponse, BookingConfirmation, BookingErrorCode } from "@/lib/booking/types";
import s from "./Booking.module.css";

type Step = "service" | "when" | "details";
type Avail =
  | { status: "loading" }
  | { status: "error"; code: BookingErrorCode | "network" }
  | { status: "ready"; data: AvailabilityResponse; at: number };
type Fields = { firstName: string; lastName: string; phone: string; email: string; note: string };
type FieldName = "firstName" | "phone" | "email";

const STEPS: Step[] = ["service", "when", "details"];
const STORE_CLIENT = "royalmk-client";
const STORE_LAST = "royalmk-last-booking";
/** Les disponibilités affichées sont relues au-delà de cette durée. */
const STALE_MS = 60_000;

const store = {
  get<T>(key: string, session = false): T | null {
    try {
      const raw = (session ? sessionStorage : localStorage).getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown, session = false) {
    try {
      const st = session ? sessionStorage : localStorage;
      if (value === null) st.removeItem(key);
      else st.setItem(key, JSON.stringify(value));
    } catch {
      /* Stockage bloqué : la réservation fonctionne sans. */
    }
  },
};

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; code: BookingErrorCode | "network"; field?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { "Content-Type": "application/json" } });
    const body = await res.json().catch(() => null);
    if (res.ok) return { ok: true, data: body as T };
    return { ok: false, code: (body?.error as BookingErrorCode) ?? "unavailable", field: body?.field };
  } catch {
    return { ok: false, code: "network" };
  } finally {
    clearTimeout(timer);
  }
}

const formatPhoneInput = (raw: string) => {
  const d = raw.replace(/\D/g, "");
  const local = d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
  return local.length === 10 && !raw.trim().startsWith("+")
    ? `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
    : raw.trim();
};

export function BookingFlow({ locale, initialService }: { locale: Locale; initialService?: ServiceId }) {
  const c = bookingCopy[locale];
  const firstStep: Step = initialService ? "when" : "service";

  const [step, setStep] = useState<Step>(firstStep);
  const [serviceId, setServiceId] = useState<ServiceId | null>(initialService ?? null);
  const [avail, setAvail] = useState<Record<string, Avail>>({});
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [fields, setFields] = useState<Fields>({ firstName: "", lastName: "", phone: "", email: "", note: "" });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [remember, setRemember] = useState(true);
  const [showNote, setShowNote] = useState(false);
  const [banner, setBanner] = useState<{ step: Step; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<BookingConfirmation | null>(null);

  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const service = bookableService(serviceId);
  const current = serviceId ? avail[serviceId] : undefined;
  const days = current?.status === "ready" ? current.data.days : [];
  const demo = current?.status === "ready" && current.data.demo;
  const day = days.find((d) => d.date === date);
  const stepIndex = STEPS.indexOf(step);

  /* ── Reprise : coordonnées mémorisées, rendez-vous qui vient d'être pris ── */
  useEffect(() => {
    const saved = store.get<Fields>(STORE_CLIENT);
    if (saved) setFields((f) => ({ ...f, ...saved, note: "" }));
    const last = store.get<BookingConfirmation>(STORE_LAST, true);
    if (last && Date.parse(last.booking.end) > Date.now()) setDone(last);
  }, []);

  /* ── Le bouton retour du téléphone ramène à l'étape précédente ────── */
  useEffect(() => {
    try {
      history.replaceState({ ...history.state, bkStep: firstStep }, "");
    } catch {}
    const onPop = (e: PopStateEvent) => {
      const prev = e.state?.bkStep as Step | undefined;
      setBanner(null);
      setStep(prev && STEPS.includes(prev) ? prev : firstStep);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [firstStep]);

  /* ── Disponibilités ───────────────────────────────────────────────── */
  const load = useCallback(async (id: ServiceId, force = false) => {
    setAvail((a) => {
      const prev = a[id];
      if (!force && prev?.status === "ready" && Date.now() - prev.at < STALE_MS) return a;
      if (!force && prev?.status === "loading") return a;
      return { ...a, [id]: { status: "loading" } };
    });
    const res = await request<AvailabilityResponse>(`/api/reservation/disponibilites?service=${id}`);
    setAvail((a) => ({
      ...a,
      [id]: res.ok ? { status: "ready", data: res.data, at: Date.now() } : { status: "error", code: res.code },
    }));
  }, []);

  useEffect(() => {
    if (serviceId) void load(serviceId);
  }, [serviceId, load]);

  // Toujours un jour choisi : celui d'avant s'il a encore de la place,
  // sinon le premier jour qui en a.
  useEffect(() => {
    if (!days.length) return;
    const keep = days.find((d) => d.date === date && d.slots.length);
    if (keep) {
      if (time && !keep.slots.includes(time)) setTime(null);
      return;
    }
    const first = days.find((d) => d.slots.length);
    setDate(first?.date ?? days[0].date);
    setTime(null);
  }, [days]); // `date` et `time` sont lus, pas suivis : seule l'arrivée de nouvelles disponibilités compte.

  // Le jour choisi reste visible dans la bande, sans faire bouger la page.
  useEffect(() => {
    const strip = datesRef.current;
    const el = strip?.querySelector<HTMLElement>(`[data-date="${date}"]`);
    if (!strip || !el) return;
    const left = el.offsetLeft;
    if (left < strip.scrollLeft || left + el.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: left - strip.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
    }
  }, [date, step, days.length]);

  /* ── Navigation : un écran par étape ──────────────────────────────── */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    titleRef.current?.focus({ preventScroll: true });
  }, [step, done]);

  const go = (next: Step) => {
    if (next === step) return;
    setBanner(null);
    setStep(next);
    try {
      history.pushState({ ...history.state, bkStep: next }, "");
    } catch {}
    if (next === "when" && serviceId) void load(serviceId);
  };

  const goNext = () => {
    if (step === "service" && service) {
      trackStep("booking_service_selected", { service_id: service.id, service_name: nameFor(service, "fr"), value: service.price, currency: "CAD" });
      go("when");
    } else if (step === "when" && date && time) {
      trackStep("booking_slot_selected", { service_id: serviceId, booking_date: date, booking_time: time });
      go("details");
    }
  };

  const canContinue = step === "service" ? Boolean(service) : step === "when" ? Boolean(date && time) : true;

  /* ── Envoi ────────────────────────────────────────────────────────── */
  const validate = (): Partial<Record<FieldName, string>> => {
    const e: Partial<Record<FieldName, string>> = {};
    if (!fields.firstName.trim()) e.firstName = c.errors.firstName;
    const digits = fields.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) e.phone = c.errors.phone;
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(fields.email.trim())) e.email = c.errors.email;
    return e;
  };

  const focusField = (name: string) => document.getElementById(`bk-${name}`)?.focus();

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (submitting || !serviceId || !date || !time) return;
    const found = validate();
    setErrors(found);
    const firstBad = (["firstName", "phone", "email"] as FieldName[]).find((k) => found[k]);
    if (firstBad) return focusField(firstBad);

    setSubmitting(true);
    setBanner(null);
    const res = await request<BookingConfirmation>("/api/reservation", {
      method: "POST",
      body: JSON.stringify({
        service: serviceId,
        date,
        time,
        ...fields,
        locale,
        website: honeypot.current?.value ?? "",
        elapsed: Date.now() - startedAt.current,
      }),
    });
    setSubmitting(false);

    if (res.ok) {
      store.set(STORE_CLIENT, remember ? { ...fields, note: "" } : null);
      store.set(STORE_LAST, res.data, true);
      trackConfirmed(res.data.booking, nameFor(bookableService(res.data.booking.service)!, "fr"));
      setDone(res.data);
      void load(serviceId, true);
      return;
    }

    if (res.code === "slot_taken") {
      setTime(null);
      await load(serviceId, true);
      setStep("when");
      setBanner({ step: "when", text: c.errors.slot_taken });
      return;
    }
    if (res.code === "invalid" && res.field && res.field in c.errors) {
      setErrors({ [res.field]: c.errors[res.field as FieldName] });
      return focusField(res.field);
    }
    const key = res.code in c.errors ? (res.code as keyof typeof c.errors) : "unavailable";
    setBanner({ step: "details", text: c.errors[key] });
  };

  const reset = () => {
    store.set(STORE_LAST, null, true);
    setDone(null);
    setTime(null);
    setStep("service");
    setServiceId(null);
    startedAt.current = Date.now();
  };

  if (done) return <Confirmation locale={locale} confirmation={done} onAnother={reset} />;

  /* ── Rendu ────────────────────────────────────────────────────────── */
  const scrollDates = (dir: 1 | -1) => {
    const el = datesRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const field = (
    name: keyof Fields,
    label: string,
    opts: { type?: string; autoComplete?: string; hint?: string; optional?: boolean; inputMode?: "tel" | "email" | "text"; placeholder?: string } = {},
  ) => {
    const err = errors[name as FieldName];
    const hintId = opts.hint ? `bk-${name}-hint` : undefined;
    const errId = err ? `bk-${name}-err` : undefined;
    return (
      <div className={s.field}>
        <label className={s.label} htmlFor={`bk-${name}`}>
          {label} {opts.optional && <em>({c.optional})</em>}
        </label>
        <input
          id={`bk-${name}`}
          name={name}
          className={s.input}
          type={opts.type ?? "text"}
          inputMode={opts.inputMode}
          autoComplete={opts.autoComplete}
          required={!opts.optional}
          placeholder={opts.placeholder}
          aria-invalid={err ? true : undefined}
          aria-describedby={[errId, hintId].filter(Boolean).join(" ") || undefined}
          value={fields[name]}
          maxLength={name === "email" ? 254 : 60}
          onChange={(e) => {
            const v = e.target.value;
            setFields((f) => ({ ...f, [name]: v }));
            if (err) setErrors((x) => ({ ...x, [name]: undefined }));
          }}
          onBlur={name === "phone" ? () => setFields((f) => ({ ...f, phone: formatPhoneInput(f.phone) })) : undefined}
        />
        {err ? (
          <p id={errId} className={s.fieldError}>
            {err}
          </p>
        ) : opts.hint ? (
          <p id={hintId} className={s.fieldHint}>
            {opts.hint}
          </p>
        ) : null}
      </div>
    );
  };

  const callBanner = (text: string) => (
    <div className={s.banner} role="alert">
      <span>{text}</span>
      <a href={`tel:${business.phone}`}>{business.phoneDisplay}</a>
    </div>
  );

  // Le prix est déjà sur le bouton à la dernière étape : on garde de la place pour la date.
  const barLine = !service
    ? ""
    : step === "details" && date && time
      ? `${shortWeekday(date, locale)} ${dayNumber(date)} ${shortMonth(date, locale)} · ${timeLabel(time, locale)}`
      : step === "when" && date && time
        ? `${shortWeekday(date, locale)} ${dayNumber(date)} ${shortMonth(date, locale)} · ${timeLabel(time, locale)} · ${price(service.price, locale)}`
        : `${duration(service.minutes, locale)} · ${price(service.price, locale)}`;

  return (
    <>
      <div className={s.flow}>
        <div className={s.top}>
          {step === "service" ? (
            <a className={s.back} href={locale === "fr" ? "/" : "/en"}>
              <ChevronLeft />
              {c.back}
            </a>
          ) : (
            <button type="button" className={s.back} onClick={() => go(STEPS[stepIndex - 1])}>
              <ChevronLeft />
              {c.back}
            </button>
          )}
          <div className={s.progress} role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={stepIndex + 1} aria-label={c.stepOf(stepIndex + 1)}>
            {STEPS.map((st, i) => (
              <span key={st} data-on={i <= stepIndex} />
            ))}
          </div>
          <span className={s.stepNo}>{c.stepOf(stepIndex + 1)}</span>
        </div>

        <h1 ref={titleRef} tabIndex={-1} className={s.title}>
          {c.titles[step]}
        </h1>
        {step === "service" && <p className={s.sub}>{c.perks.join(" · ")}</p>}
        {demo && <p className={s.demo}>{c.demo}</p>}

        {/* ── Étape 1 : service ── */}
        {step === "service" && (
          <ul className={s.list}>
            {bookableServices.map((svc) => {
              const includes = svc.includes && (locale === "fr" ? svc.includes : svc.includesEn ?? svc.includes);
              return (
                <li key={svc.id}>
                  <button type="button" className={s.item} aria-pressed={svc.id === serviceId} onClick={() => setServiceId(svc.id)}>
                    <span className={s.radio} aria-hidden />
                    <span className={s.itemName}>
                      {nameFor(svc, locale)}
                      {includes && <span className={s.tag}>{c.package}</span>}
                    </span>
                    <span className={s.itemMeta}>
                      {duration(svc.minutes, locale)}
                      {includes && ` · ${includes.join(", ").toLowerCase()}`}
                    </span>
                    <span className={s.itemPrice}>{price(svc.price, locale)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* ── Étape 2 : date et heure ── */}
        {step === "when" && serviceId && (
          <>
            {banner?.step === "when" && (
              <div className={s.banner} role="alert">
                <span>{banner.text}</span>
              </div>
            )}

            {(!current || current.status === "loading") && (
              <div aria-busy="true" aria-live="polite">
                <span className={s.srOnly}>{c.loading}</span>
                <div className={s.skDates}>
                  {Array.from({ length: 8 }, (_, k) => (
                    <span key={k} className={s.skel} />
                  ))}
                </div>
                <div className={s.skSlots}>
                  {Array.from({ length: 9 }, (_, k) => (
                    <span key={k} className={s.skel} />
                  ))}
                </div>
              </div>
            )}

            {current?.status === "error" && (
              <>
                {callBanner(current.code in c.errors ? c.errors[current.code as keyof typeof c.errors] : c.errors.unavailable)}
                <button type="button" className={s.linkBtn} onClick={() => load(serviceId, true)}>
                  {c.retry}
                </button>
              </>
            )}

            {current?.status === "ready" && !days.some((d) => d.slots.length) && callBanner(c.noSlotsAtAll)}

            {current?.status === "ready" && days.some((d) => d.slots.length) && (
              <>
                <div className={s.monthRow}>
                  <span className={s.month} aria-live="polite">
                    {date ? monthYear(date, locale) : ""}
                  </span>
                  <div className={s.dayNav}>
                    <button type="button" className={s.navBtn} onClick={() => scrollDates(-1)} aria-label={c.prevDays}>
                      <Chevron dir="left" />
                    </button>
                    <button type="button" className={s.navBtn} onClick={() => scrollDates(1)} aria-label={c.nextDays}>
                      <Chevron dir="right" />
                    </button>
                  </div>
                </div>

                <div className={s.dates} ref={datesRef} role="group" aria-label={c.steps.when}>
                  {days.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      data-date={d.date}
                      className={s.date}
                      aria-pressed={d.date === date}
                      disabled={!d.slots.length}
                      aria-label={`${longDate(d.date, locale)}, ${d.closed ? c.closed : d.slots.length ? c.spots(d.slots.length) : c.full}`}
                      onClick={() => {
                        setDate(d.date);
                        setTime(null);
                        setBanner(null);
                      }}
                    >
                      <span className={s.dateWk}>{shortWeekday(d.date, locale)}</span>
                      <span className={s.dateNum}>{dayNumber(d.date)}</span>
                    </button>
                  ))}
                </div>

                {day && day.slots.length > 0 && (
                  <div key={day.date}>
                    <p className={s.sectionLabel}>{c.availableOn(longDate(day.date, locale))}</p>
                    <div className={s.slots}>
                      {day.slots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={s.slot}
                          aria-pressed={t === time}
                          aria-label={`${longDate(day.date, locale)}, ${timeLabel(t, locale)}`}
                          onClick={() => setTime(t)}
                        >
                          {timeLabel(t, locale)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {day && !day.slots.length && (
                  <div className={s.empty}>
                    <p>{c.noSlots}</p>
                    {days.find((d) => d.date > day.date && d.slots.length) && (
                      <button
                        type="button"
                        className={s.linkBtn}
                        onClick={() => setDate(days.find((d) => d.date > day.date && d.slots.length)!.date)}
                      >
                        {c.nextFree} {longDate(days.find((d) => d.date > day.date && d.slots.length)!.date, locale)} →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Étape 3 : coordonnées ── */}
        {step === "details" && service && date && time && (
          <>
            <div className={s.recap}>
              <div className={s.recapRow}>
                <div>
                  <strong>{nameFor(service, locale)}</strong>
                  <span>
                    {duration(service.minutes, locale)} · {price(service.price, locale)}
                  </span>
                </div>
                <button type="button" className={s.linkBtn} onClick={() => go("service")}>
                  {c.edit}
                </button>
              </div>
              <div className={s.recapRow}>
                <div>
                  <strong className={s.cap}>{longDate(date, locale)}</strong>
                  <span>{timeLabel(time, locale)}</span>
                </div>
                <button type="button" className={s.linkBtn} onClick={() => go("when")}>
                  {c.edit}
                </button>
              </div>
            </div>

            {banner?.step === "details" && callBanner(banner.text)}

            <form id="bk-form" className={s.form} onSubmit={submit} noValidate>
              <div className={s.row2}>
                {field("firstName", c.firstName, { autoComplete: "given-name" })}
                {field("lastName", c.lastName, { autoComplete: "family-name", optional: true })}
              </div>
              {field("phone", c.phone, { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "819 555-1234" })}
              {field("email", c.email, {
                type: "email",
                inputMode: "email",
                autoComplete: "email",
                hint: c.emailHint,
                placeholder: locale === "fr" ? "nom@exemple.com" : "name@example.com",
              })}

              {showNote || fields.note ? (
                <div className={s.field}>
                  <label className={s.label} htmlFor="bk-note">
                    {c.note} <em>({c.optional})</em>
                  </label>
                  <textarea
                    id="bk-note"
                    className={s.input}
                    maxLength={500}
                    rows={3}
                    placeholder={c.notePlaceholder}
                    value={fields.note}
                    onChange={(e) => setFields((f) => ({ ...f, note: e.target.value }))}
                  />
                </div>
              ) : (
                <button type="button" className={s.linkBtn} style={{ justifySelf: "start" }} onClick={() => setShowNote(true)}>
                  + {c.addNote}
                </button>
              )}

              {/* Champ piège : invisible pour un humain, rempli par les robots. */}
              <div className={s.honeypot} aria-hidden="true">
                <label>
                  Website
                  <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <label className={s.check}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                {c.remember}
              </label>

              <p className={s.consent}>
                {c.consent} <a href={locale === "fr" ? "/confidentialite" : "/en/privacy"}>{c.privacy}</a>
              </p>
            </form>
          </>
        )}
      </div>

      {/* Barre fixe : le récapitulatif et le bouton principal restent sous le pouce. */}
      <div className={s.bar}>
        <div className={s.barIn}>
          <div className={s.barInfo}>
            {service ? (
              <>
                <strong>{nameFor(service, locale)}</strong>
                <span>{barLine}</span>
              </>
            ) : (
              <span>{c.noneChosen}</span>
            )}
          </div>
          {/* Deux boutons distincts (clés différentes) : sinon React réutilise
              le même élément en changeant son type, et le clic sur « Continuer »
              enverrait aussitôt le formulaire de l'étape suivante. */}
          {step === "details" ? (
            <button key="confirm" type="submit" form="bk-form" className={`${s.primary} ${submitting ? s.busy : ""}`} disabled={submitting} data-continue>
              {submitting && <span className={s.spinner} aria-hidden />}
              {submitting ? c.confirming : service ? `${c.confirmShort} · ${price(service.price, locale)}` : c.confirmShort}
            </button>
          ) : (
            <button key="next" type="button" className={s.primary} disabled={!canContinue} onClick={goNext} data-continue>
              {c.next}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Confirmation ───────────────────────────────────────────────────── */

function Confirmation({ locale, confirmation, onAnother }: { locale: Locale; confirmation: BookingConfirmation; onAnother: () => void }) {
  const c = bookingCopy[locale];
  const b = confirmation.booking;
  const svc = bookableService(b.service)!;
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={s.flow}>
      {confirmation.demo && <p className={s.demo}>{c.demo}</p>}
      <svg className={s.checkMark} viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r="25" />
        <path d="M17 29l7 7 15-16" />
      </svg>
      <h1 ref={titleRef} tabIndex={-1} className={s.title} style={{ marginTop: "1rem" }}>
        {c.doneTitle(b.firstName)}
      </h1>
      <p className={s.sub} role="status">
        {confirmation.emailSent ? c.doneEmail(b.email) : c.doneNoEmail}
      </p>

      <dl className={s.card}>
        <div className={s.cardRow}>
          <dt>{c.service}</dt>
          <dd>{nameFor(svc, locale)}</dd>
        </div>
        <div className={s.cardRow}>
          <dt>{c.date}</dt>
          <dd className={s.cap}>{longDate(b.date, locale)}</dd>
        </div>
        <div className={s.cardRow}>
          <dt>{c.time}</dt>
          <dd>{timeLabel(b.time, locale)}</dd>
        </div>
        <div className={s.cardRow}>
          <dt>{c.total}</dt>
          <dd>{price(b.price, locale)}</dd>
        </div>
        <div className={s.cardRow}>
          <dt>{locale === "fr" ? "Adresse" : "Address"}</dt>
          <dd>
            <a href={business.maps} target="_blank" rel="noopener noreferrer" className={s.mapLink}>
              {business.address.street}
              <br />
              {business.address.city} ({business.address.region})
            </a>
          </dd>
        </div>
      </dl>
      <p className={s.fieldHint} style={{ marginTop: "0.6rem" }}>
        {c.payAtShop}
      </p>

      <div className={s.actions}>
        <a className={s.primary} href={locale === "fr" ? "/" : "/en"}>
          {c.home}
        </a>
      </div>

      <div className={s.doneLinks}>
        <button type="button" className={s.linkBtn} onClick={onAnother}>
          {c.another}
        </button>
        <a className={`${s.linkBtn} ${s.cancelLink}`} href={`${cancelPaths[locale]}?t=${encodeURIComponent(confirmation.cancelToken)}`}>
          {c.cancelLink}
        </a>
      </div>
    </div>
  );
}

/* ── Icônes ─────────────────────────────────────────────────────────── */

function ChevronLeft() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}
