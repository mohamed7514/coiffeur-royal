"use client";

import { useEffect, useRef, useState } from "react";
import { business, nameFor } from "@/lib/business";
import { duration, price, type Locale } from "@/lib/content";
import { bookableService } from "@/lib/booking/config";
import { bookingCopy, bookingPaths, cancelCopy } from "@/lib/booking/copy";
import { longDate, timeLabel } from "@/lib/booking/format";
import type { Booking, BookingErrorCode } from "@/lib/booking/types";
import s from "./Booking.module.css";

type View =
  | { kind: "loading" }
  | { kind: "ready"; booking: Booking; canCancel: boolean; past: boolean }
  | { kind: "cancelling"; booking: Booking }
  | { kind: "cancelled"; booking?: Booking }
  | { kind: "error"; code: BookingErrorCode | "network" };

export function CancelBooking({ locale, token }: { locale: Locale; token: string }) {
  const c = cancelCopy[locale];
  const b = bookingCopy[locale];
  const [view, setView] = useState<View>({ kind: "loading" });
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!token) return setView({ kind: "error", code: "not_found" });
    let alive = true;
    fetch(`/api/reservation/annulation?t=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!alive) return;
        if (res.ok) setView({ kind: "ready", booking: body.booking, canCancel: body.canCancel, past: body.past });
        else if (body?.error === "already_cancelled") setView({ kind: "cancelled" });
        else setView({ kind: "error", code: body?.error ?? "unavailable" });
      })
      .catch(() => alive && setView({ kind: "error", code: "network" }));
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    if (view.kind === "cancelled") titleRef.current?.focus({ preventScroll: true });
  }, [view.kind]);

  const confirm = async () => {
    if (view.kind !== "ready") return;
    const booking = view.booking;
    setView({ kind: "cancelling", booking });
    try {
      const res = await fetch("/api/reservation/annulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok || body?.error === "already_cancelled") {
        setView({ kind: "cancelled", booking });
        try {
          sessionStorage.removeItem("royalmk-last-booking");
        } catch {}
      } else if (body?.error === "too_late") setView({ kind: "ready", booking, canCancel: false, past: false });
      else setView({ kind: "error", code: body?.error ?? "unavailable" });
    } catch {
      setView({ kind: "error", code: "network" });
    }
  };

  const booking = "booking" in view ? view.booking : undefined;
  const svc = booking && bookableService(booking.service);
  const call = (
    <a href={`tel:${business.phone}`} className={s.primary} style={{ marginTop: "1.25rem", width: "100%" }}>
      {b.callUs} · {business.phoneDisplay}
    </a>
  );

  return (
    <div className={s.flow} aria-live="polite">
      {view.kind === "loading" && <p className={s.sub}>{c.loading}</p>}

      {view.kind === "error" && (
        <>
          <h1 className={s.title} style={{ marginTop: 0 }}>{c.label}</h1>
          <div className={s.banner} role="alert">
            <span>{view.code === "not_found" ? c.notFound : c.unavailable}</span>
          </div>
          {call}
        </>
      )}

      {view.kind === "cancelled" && (
        <>
          <h1 ref={titleRef} tabIndex={-1} className={s.title} style={{ marginTop: 0, outline: "none" }}>
            {c.doneTitle}
          </h1>
          <p className={s.sub}>{booking ? c.doneLead : c.alreadyCancelled}</p>
          <div className={s.cancelActions}>
            <a href={bookingPaths[locale]} className={s.primary}>
              {c.bookAgain}
            </a>
          </div>
        </>
      )}

      {(view.kind === "ready" || view.kind === "cancelling") && booking && svc && (
        <>
          <h1 className={s.title} style={{ marginTop: 0 }}>{c.title}</h1>
          <dl className={s.card}>
            <div className={s.cardRow}>
              <dt>{b.service}</dt>
              <dd>{nameFor(svc, locale)}</dd>
            </div>
            <div className={s.cardRow}>
              <dt>{b.date}</dt>
              <dd className={s.cap}>{longDate(booking.date, locale)}</dd>
            </div>
            <div className={s.cardRow}>
              <dt>{b.time}</dt>
              <dd>{timeLabel(booking.time, locale)}</dd>
            </div>
            <div className={s.cardRow}>
              <dt>{b.duration}</dt>
              <dd>{duration(booking.minutes, locale)}</dd>
            </div>
            <div className={s.cardRow}>
              <dt>{b.total}</dt>
              <dd>{price(booking.price, locale)}</dd>
            </div>
          </dl>

          {view.kind === "ready" && view.past ? (
            <p className={s.sub} style={{ marginTop: "1.25rem" }}>{c.past}</p>
          ) : view.kind === "ready" && !view.canCancel ? (
            <>
              <div className={s.banner} role="alert">
                <span>{c.tooLate}</span>
              </div>
              {call}
            </>
          ) : (
            <>
              <p className={s.sub} style={{ marginTop: "1.25rem" }}>{c.lead}</p>
              <div className={s.cancelActions}>
                <button type="button" className={`${s.primary} ${view.kind === "cancelling" ? s.busy : ""}`} onClick={confirm} disabled={view.kind === "cancelling"}>
                  {view.kind === "cancelling" && <span className={s.spinner} aria-hidden />}
                  {view.kind === "cancelling" ? c.cancelling : c.confirm}
                </button>
                <a href={locale === "fr" ? "/" : "/en"} className={s.secondary}>
                  {c.keep}
                </a>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
