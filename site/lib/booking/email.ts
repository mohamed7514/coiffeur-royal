import { business, nameFor } from "@/lib/business";
import { price, duration } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { icsFile } from "./calendar-links";
import { bookableService } from "./config";
import { whenLabel } from "./format";
import { displayPhone } from "./validate";
import type { Booking } from "./types";

/**
 * Courriels de confirmation et d'annulation, par l'API de Resend.
 *
 * Facultatif : sans `RESEND_API_KEY`, rien ne part et la réservation
 * fonctionne quand même — l'écran de confirmation donne déjà le lien
 * d'agenda et le lien d'annulation. Un courriel qui échoue n'annule
 * jamais un rendez-vous.
 */

const cancelPath = (l: Booking["locale"]) => (l === "fr" ? "/reserver/annuler" : "/en/book/cancel");

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(heading: string, rows: [string, string][], action?: { label: string; href: string }, foot?: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f4f1;font-family:Helvetica,Arial,sans-serif;color:#0a090c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f1;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e0dfda">
<tr><td style="background:#0a090c;color:#f5f4f1;padding:20px 28px;font-weight:800;letter-spacing:.04em;font-size:18px">ROYALMK</td></tr>
<tr><td style="padding:32px 28px 8px"><h1 style="margin:0;font-size:26px;line-height:1.1;text-transform:uppercase;letter-spacing:-.01em">${esc(heading)}</h1></td></tr>
<tr><td style="padding:16px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:12px 0;border-bottom:1px solid #e0dfda;color:#6f6e69;font-size:14px">${esc(k)}</td><td align="right" style="padding:12px 0;border-bottom:1px solid #e0dfda;font-weight:700;font-size:14px">${esc(v)}</td></tr>`,
    )
    .join("")}</table></td></tr>
${action ? `<tr><td style="padding:16px 28px 8px"><a href="${esc(action.href)}" style="display:inline-block;border:1px solid #0a090c;color:#0a090c;padding:12px 18px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;text-decoration:none">${esc(action.label)}</a></td></tr>` : ""}
<tr><td style="padding:16px 28px 28px;color:#6f6e69;font-size:13px;line-height:1.6">${foot ? esc(foot) + "<br><br>" : ""}${esc(business.name)} · ${esc(business.address.street)}, ${esc(business.address.city)} · ${esc(business.phoneDisplay)}</td></tr>
</table></td></tr></table></body></html>`;
}

function rowsFor(b: Booking): [string, string][] {
  const s = bookableService(b.service)!;
  const fr = b.locale === "fr";
  return [
    [fr ? "Service" : "Service", nameFor(s, b.locale)],
    [fr ? "Quand" : "When", whenLabel(b.date, b.time, b.locale)],
    [fr ? "Durée" : "Duration", duration(b.minutes, b.locale)],
    [fr ? "Prix" : "Price", `${price(b.price, b.locale)}${fr ? ", payé au salon" : ", paid at the shop"}`],
    [fr ? "Adresse" : "Address", `${business.address.street}, ${business.address.city}`],
  ];
}

async function send(payload: Record<string, unknown>): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, ...payload }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) console.error("[reservation] courriel refusé", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[reservation] courriel non envoyé", err);
    return false;
  }
}

const attachment = (b: Booking, method: "PUBLISH" | "CANCEL") => ({
  filename: b.locale === "fr" ? "rendez-vous-royalmk.ics" : "royalmk-appointment.ics",
  content: Buffer.from(icsFile({ ...b }, method)).toString("base64"),
});

export async function sendConfirmation(b: Booking, cancelToken: string): Promise<boolean> {
  const fr = b.locale === "fr";
  const s = bookableService(b.service)!;
  const cancelUrl = `${SITE_URL}${cancelPath(b.locale)}?t=${encodeURIComponent(cancelToken)}`;
  const heading = fr ? `C'est confirmé, ${b.firstName}.` : `You're booked, ${b.firstName}.`;
  const foot = fr
    ? "Un empêchement ? Annulez avec le bouton ci-dessus jusqu'à 2 h avant, ou appelez le salon."
    : "Can't make it? Cancel with the button above up to 2 hours before, or call the shop.";

  const client = send({
    to: [b.email],
    reply_to: process.env.SALON_NOTIFY_EMAIL || undefined,
    subject: fr
      ? `Rendez-vous confirmé — ${whenLabel(b.date, b.time, "fr")}`
      : `Appointment confirmed — ${whenLabel(b.date, b.time, "en")}`,
    html: layout(heading, rowsFor(b), { label: fr ? "Annuler le rendez-vous" : "Cancel appointment", href: cancelUrl }, foot),
    text: `${heading}\n\n${rowsFor(b).map(([k, v]) => `${k} : ${v}`).join("\n")}\n\n${foot}\n${cancelUrl}`,
    attachments: [attachment(b, "PUBLISH")],
  });

  const salonTo = process.env.SALON_NOTIFY_EMAIL;
  const salon = salonTo
    ? send({
        to: [salonTo],
        reply_to: b.email,
        subject: `Nouveau rendez-vous : ${b.firstName} ${b.lastName} — ${nameFor(s, "fr")}, ${whenLabel(b.date, b.time, "fr")}`,
        text: [
          `${b.firstName} ${b.lastName}`.trim(),
          `${nameFor(s, "fr")} — ${whenLabel(b.date, b.time, "fr")}`,
          `Téléphone : ${displayPhone(b.phone)}`,
          `Courriel : ${b.email}`,
          b.note ? `Note : ${b.note}` : "",
        ].filter(Boolean).join("\n"),
      })
    : Promise.resolve(true);

  const [sent] = await Promise.all([client, salon]);
  return sent;
}

/** Message au salon quand la réservation ne fonctionne plus. */
export async function sendAlert(subject: string, text: string): Promise<boolean> {
  const to = process.env.SALON_NOTIFY_EMAIL;
  return to ? send({ to: [to], subject, text }) : false;
}

export async function sendCancellation(b: Booking): Promise<void> {
  const fr = b.locale === "fr";
  const heading = fr ? "Rendez-vous annulé." : "Appointment cancelled.";
  const again = `${SITE_URL}${fr ? "/reserver" : "/en/book"}`;
  await Promise.all([
    send({
      to: [b.email],
      subject: fr ? "Votre rendez-vous est annulé" : "Your appointment is cancelled",
      html: layout(heading, rowsFor(b), { label: fr ? "Reprendre un rendez-vous" : "Book again", href: again }),
      text: `${heading}\n\n${rowsFor(b).map(([k, v]) => `${k} : ${v}`).join("\n")}\n\n${again}`,
      attachments: [attachment(b, "CANCEL")],
    }),
    process.env.SALON_NOTIFY_EMAIL
      ? send({
          to: [process.env.SALON_NOTIFY_EMAIL],
          subject: `Annulation : ${b.firstName} ${b.lastName} — ${whenLabel(b.date, b.time, "fr")}`,
          text: `${b.firstName} ${b.lastName} a annulé en ligne.\nLe créneau est de nouveau libre sur le site.`,
        })
      : Promise.resolve(),
  ]);
}
