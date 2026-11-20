"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { business, nameFor, type ServiceId } from "@/lib/business";
import { duration, price, type Locale } from "@/lib/content";
import { bookableService, bookableServices } from "@/lib/booking/config";
import { bookingCopy, cancelPaths, type BookingCopy } from "@/lib/booking/copy";
import {
  caretAfterDigits,
  checkEmail,
  checkPhone,
  digitsBefore,
  formatPhoneTyping,
  isInternational,
  suggestEmail,
} from "@/lib/booking/fields";
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

const FIELD_ORDER: FieldName[] = ["firstName", "phone", "email"];
/** Ordre de passage d'un champ à l'autre avec la touche « suivant » du clavier. */
const NEXT_FIELD: Partial<Record<keyof Fields, keyof Fields>> = { firstName: "lastName", lastName: "phone", phone: "email" };
/** Un humain met plus que ça à remplir le formulaire ; en deçà, le serveur
 *  croit à un robot. Le navigateur attend donc la différence avant d'envoyer. */
const MIN_FILL_MS = 2600;

/** Le message précis pour un champ, ou undefined s'il est bon. */
function fieldError(c: BookingCopy, name: FieldName, value: string): string | undefined {
  if (name === "firstName") return value.trim() ? undefined : c.errors.firstName;
  if (name === "phone") {
    const r = checkPhone(value);
    if (r.ok) return undefined;
    return r.problem === "short" ? c.phoneErrors.short(r.missing ?? 1) : c.phoneErrors[r.problem];
  }
  const problem = checkEmail(value);
  return problem ? c.emailErrors[problem] : undefined;
}

/** Matin avant midi, soir à partir de 17 h. */
const periodOf = (hhmm: string): "morning" | "afternoon" | "evening" =>
  hhmm < "12:00" ? "morning" : hhmm < "17:00" ? "afternoon" : "evening";

/** Service mis en avant dans la grille avec le badge « Le plus demandé ». */
const POPULAR: ServiceId = "vip";

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
  const [showSummary, setShowSummary] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const phoneCaret = useRef<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const datesRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const service = bookableService(serviceId);
  const current = serviceId ? avail[serviceId] : undefined;
  const days = current?.status === "ready" ? current.data.days : [];
  const demo = current?.status === "ready" && current.data.demo;
  const day = days.find((d) => d.date === date);
  const firstFree = days.find((d) => d.slots.length);
  const stepIndex = STEPS.indexOf(step);

  /* ── Reprise : coordonnées mémorisées, rendez-vous qui vient d'être pris ── */
  useEffect(() => {
    const saved = store.get<Fields>(STORE_CLIENT);
    if (saved) setFields((f) => ({ ...f, ...saved, phone: formatPhoneTyping(saved.phone ?? ""), note: "" }));
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

  /** Un toucher sur un service suffit : on passe directement à la date. */
  const chooseService = (id: ServiceId) => {
    const svc = bookableService(id);
    if (!svc) return;
    setServiceId(id);
    trackStep("booking_service_selected", { service_id: svc.id, service_name: nameFor(svc, "fr"), value: svc.price, currency: "CAD" });
    setBanner(null);
    setStep("when");
    try {
      history.pushState({ ...history.state, bkStep: "when" }, "");
    } catch {}
  };

  /** La prochaine place libre, prise en un toucher. */
  const takeSlot = (d: string, t: string) => {
    setDate(d);
    setTime(t);
    trackStep("booking_slot_selected", { service_id: serviceId, booking_date: d, booking_time: t });
    go("details");
  };

  /* ── Envoi ────────────────────────────────────────────────────────── */
  const validate = (): Partial<Record<FieldName, string>> => {
    const e: Partial<Record<FieldName, string>> = {};
    for (const name of FIELD_ORDER) {
      const err = fieldError(c, name, fields[name]);
      if (err) e[name] = err;
    }
    return e;
  };

  const focusField = (name: string) => document.getElementById(`bk-${name}`)?.focus();

  // Le curseur reste là où le client tapait, même quand la mise en forme
  // ajoute une parenthèse ou un tiret avant lui.
  useLayoutEffect(() => {
    const el = phoneRef.current;
    const pos = phoneCaret.current;
    phoneCaret.current = null;
    if (el && pos !== null && document.activeElement === el) el.setSelectionRange(pos, pos);
  }, [fields.phone]);

  const onPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const caret = e.target.selectionStart ?? raw.length;
    const formatted = formatPhoneTyping(raw);
    phoneCaret.current = caret >= raw.length ? formatted.length : caretAfterDigits(formatted, digitsBefore(raw, caret));
    setFields((f) => ({ ...f, phone: formatted }));
    // Une erreur déjà affichée se met à jour pendant la frappe et disparaît
    // dès que le numéro est bon ; une nouvelle erreur attend la sortie du champ.
    if (errors.phone) setErrors((x) => ({ ...x, phone: fieldError(c, "phone", formatted) }));
  };

  const onFieldKey = (name: keyof Fields) => (e: KeyboardEvent<HTMLInputElement>) => {
    const next = NEXT_FIELD[name];
    if (e.key === "Enter" && next) {
      e.preventDefault();
      focusField(next);
    }
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (submitting || !serviceId || !date || !time) return;
    const found = validate();
    setErrors(found);
    const firstBad = FIELD_ORDER.find((k) => found[k]);
    setShowSummary(Boolean(firstBad));
    if (firstBad) return focusField(firstBad);

    setSubmitting(true);
    setBanner(null);
    // Client rapide (coordonnées mémorisées, service déjà choisi) : on attend
    // le temps minimal au lieu de se faire refuser comme un robot.
    const wait = MIN_FILL_MS - (Date.now() - startedAt.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
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
    if (res.code === "invalid") {
      const f = res.field;
      if (f === "firstName" || f === "phone" || f === "email") {
        setErrors({ [f]: c.errors[f] });
        setShowSummary(true);
        return focusField(f);
      }
      if (f === "date" || f === "time") {
        setTime(null);
        await load(serviceId, true);
        setStep("when");
        setBanner({ step: "when", text: c.errors.slot_invalid });
        return;
      }
      if (f === "service") {
        setServiceId(null);
        setStep("service");
        setBanner({ step: "service", text: c.errors.service_invalid });
        return;
      }
      setBanner({ step: "details", text: c.errors.form });
      return;
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

  /** Vérifie un champ quand le client le quitte, s'il y a écrit quelque chose. */
  const checkOnBlur = (name: keyof Fields) => {
    if (name === "email") setEmailTouched(true);
    if (name === "lastName" || name === "note") return;
    const value = fields[name];
    if (!value.trim() && !errors[name]) return;
    setErrors((x) => ({ ...x, [name]: fieldError(c, name, value) }));
  };

  const field = (
    name: keyof Fields,
    label: string,
    opts: {
      type?: string;
      autoComplete?: string;
      hint?: string;
      optional?: boolean;
      inputMode?: "tel" | "email" | "text";
      placeholder?: string;
      autoCapitalize?: string;
      prefix?: string;
      valid?: boolean;
      after?: ReactNode;
    } = {},
  ) => {
    const err = errors[name as FieldName];
    const hintId = opts.hint ? `bk-${name}-hint` : undefined;
    const errId = err ? `bk-${name}-err` : undefined;
    const isPhone = name === "phone";
    return (
      <div className={s.field}>
        <label className={s.label} htmlFor={`bk-${name}`}>
          {label} {opts.optional && <em>({c.optional})</em>}
        </label>
        <div className={s.inputWrap} data-prefix={opts.prefix ? true : undefined} data-valid={opts.valid ? true : undefined}>
          {opts.prefix && (
            <span className={s.prefix} aria-hidden>
              {opts.prefix}
            </span>
          )}
          <input
            id={`bk-${name}`}
            ref={isPhone ? phoneRef : undefined}
            name={name}
            className={s.input}
            type={opts.type ?? "text"}
            inputMode={opts.inputMode}
            autoComplete={opts.autoComplete}
            autoCapitalize={opts.autoCapitalize}
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint={NEXT_FIELD[name] ? "next" : "done"}
            required={!opts.optional}
            placeholder={opts.placeholder}
            aria-invalid={err ? true : undefined}
            aria-describedby={[errId, hintId].filter(Boolean).join(" ") || undefined}
            value={fields[name]}
            maxLength={name === "email" ? 254 : isPhone ? 22 : 60}
            onChange={
              isPhone
                ? onPhoneChange
                : (e) => {
                    const v = e.target.value;
                    setFields((f) => ({ ...f, [name]: v }));
                    if (err) setErrors((x) => ({ ...x, [name]: fieldError(c, name as FieldName, v) }));
                  }
            }
            onBlur={() => checkOnBlur(name)}
            onKeyDown={onFieldKey(name)}
          />
          {opts.valid && !err && (
            <span className={s.validMark} role="img" aria-label={c.phoneOk}>
              <svg viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 8.5l3 3 6-7" />
              </svg>
            </span>
          )}
        </div>
        {err ? (
          <p id={errId} className={s.fieldError} aria-live="polite">
            {err}
          </p>
        ) : opts.hint ? (
          <p id={hintId} className={s.fieldHint}>
            {opts.hint}
          </p>
        ) : null}
        {opts.after}
      </div>
    );
  };

  const emailSuggestion = emailTouched ? suggestEmail(fields.email) : null;
  const errorList = FIELD_ORDER.filter((k) => errors[k]);

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

        {/* ── Étape 1 : service, en grille ── */}
        {step === "service" && banner?.step === "service" && (
          <div className={s.banner} role="alert">
            <span>{banner.text}</span>
          </div>
        )}
        {step === "service" && (
          <ul className={s.grid}>
            {bookableServices.map((svc) => {
              const includes = svc.includes && (locale === "fr" ? svc.includes : svc.includesEn ?? svc.includes);
              const saved = svc.partsTotal ? svc.partsTotal - svc.price : 0;
              return (
                <li key={svc.id} className={includes ? s.wide : undefined}>
                  <button type="button" className={s.card2} aria-pressed={svc.id === serviceId} onClick={() => chooseService(svc.id)}>
                    <span className={s.cardTop}>
                      <span className={s.cardName}>{nameFor(svc, locale)}</span>
                      <span className={s.tick} aria-hidden>
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3.5 8.5l3 3 6-7" />
                        </svg>
                      </span>
                    </span>
                    {(svc.id === POPULAR || includes || saved > 0) && (
                      <span className={s.badges}>
                        {svc.id === POPULAR && <span className={`${s.tag} ${s.tagStrong}`}>{c.popular}</span>}
                        {includes && <span className={s.tag}>{c.package}</span>}
                        {saved > 0 && <span className={s.tag}>{c.savings(saved)}</span>}
                      </span>
                    )}
                    {includes && <span className={s.cardIncl}>{includes.join(" + ")}</span>}
                    <span className={s.cardFoot}>
                      <span className={s.cardPrice}>{price(svc.price, locale)}</span>
                      <span className={s.cardDur}>{duration(svc.minutes, locale)}</span>
                    </span>
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
                {firstFree && !(date === firstFree.date && time === firstFree.slots[0]) && (
                  <div className={s.nextFree}>
                    <div>
                      <span className={s.nextLabel}>{c.nextSlot}</span>
                      <strong className={s.cap}>
                        {firstFree.date === days[0]?.date
                          ? c.today
                          : firstFree.date === days[1]?.date
                            ? c.tomorrow
                            : longDate(firstFree.date, locale)}{" "}
                        {c.at} {timeLabel(firstFree.slots[0], locale)}
                      </strong>
                    </div>
                    <button type="button" className={s.secondary} onClick={() => takeSlot(firstFree.date, firstFree.slots[0])}>
                      {c.take}
                    </button>
                  </div>
                )}

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
                    {(["morning", "afternoon", "evening"] as const).map((period) => {
                      const list = day.slots.filter((t) => periodOf(t) === period);
                      if (!list.length) return null;
                      return (
                        <div key={period} className={s.period} role="group" aria-label={c.periods[period]}>
                          <p className={s.periodLabel}>{c.periods[period]}</p>
                          <div className={s.slots}>
                            {list.map((t) => (
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
                      );
                    })}
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
              {showSummary && errorList.length > 0 && (
                <div className={s.summary} role="alert">
                  <p>{c.errorSummary(errorList.length)}</p>
                  <ul>
                    {errorList.map((k) => (
                      <li key={k}>
                        <button type="button" className={s.linkBtn} onClick={() => focusField(k)}>
                          {c.fieldNames[k]}
                        </button>
                        {locale === "fr" ? " : " : ": "}
                        {errors[k]}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={s.row2}>
                {field("firstName", c.firstName, { autoComplete: "given-name", autoCapitalize: "words" })}
                {field("lastName", c.lastName, { autoComplete: "family-name", optional: true, autoCapitalize: "words" })}
              </div>
              {field("phone", c.phone, {
                type: "tel",
                inputMode: "tel",
                autoComplete: "tel",
                placeholder: isInternational(fields.phone) ? "+33 6 12 34 56 78" : "(819) 555-1234",
                prefix: isInternational(fields.phone) ? undefined : "+1",
                valid: checkPhone(fields.phone).ok,
                hint: c.phoneIntlHint,
              })}
              {field("email", c.email, {
                type: "email",
                inputMode: "email",
                autoComplete: "email",
                autoCapitalize: "none",
                hint: c.emailHint,
                placeholder: locale === "fr" ? "nom@exemple.com" : "name@example.com",
                after: emailSuggestion && (
                  <p className={s.suggest} aria-live="polite">
                    {c.emailSuggest} <strong>{emailSuggestion}</strong>
                    {locale === "fr" ? " ? " : "? "}
                    <button
                      type="button"
                      className={s.linkBtn}
                      onClick={() => {
                        setFields((f) => ({ ...f, email: emailSuggestion }));
                        setErrors((x) => ({ ...x, email: undefined }));
                      }}
                    >
                      {c.emailFix}
                    </button>
                  </p>
                ),
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
                  Leave this field empty
                  <input ref={honeypot} type="text" name="hp-bot-trap" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
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
