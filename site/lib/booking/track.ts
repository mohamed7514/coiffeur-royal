import type { Booking } from "./types";

/**
 * Événements envoyés à Google Tag Manager pendant la réservation.
 *
 * `booking_confirmed` est LA conversion : il ne part qu'une fois le
 * rendez-vous réellement écrit dans l'agenda, une seule fois par
 * rendez-vous (garde par identifiant, même si la page est rechargée).
 * `transaction_id` permet aussi à Google Ads d'écarter un doublon.
 *
 * `user_data` sert aux conversions améliorées : GTM chiffre (SHA-256)
 * le courriel et le téléphone avant de les transmettre à Google.
 */

type Payload = Record<string, unknown> & { event: string };

function push(payload: Payload) {
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(payload);
  } catch {
    /* La mesure ne doit jamais gêner la réservation. */
  }
}

export function trackStep(event: "booking_service_selected" | "booking_slot_selected", data: Record<string, unknown>) {
  push({ event, booking_provider: "site", page_path: window.location.pathname, ...data });
}

export function trackConfirmed(b: Booking, serviceName: string) {
  const key = `royalmk-booking-tracked:${b.id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* Stockage bloqué : on envoie quand même, la garde par transaction_id suffit. */
  }

  const daysAhead = Math.max(0, Math.round((Date.parse(b.start) - Date.now()) / 86_400_000));
  push({
    event: "booking_confirmed",
    conversion_type: "rendez_vous",
    booking_provider: "site",
    page_path: window.location.pathname,
    transaction_id: b.id,
    value: b.price,
    currency: "CAD",
    service_id: b.service,
    service_name: serviceName,
    booking_date: b.date,
    booking_time: b.time,
    days_ahead: daysAhead,
    user_data: {
      email: b.email,
      phone_number: b.phone,
      address: { first_name: b.firstName, last_name: b.lastName || undefined, country: "CA" },
    },
  });
}
