import { failure, fail, json } from "@/lib/booking/http";
import { clientIp, rateLimited } from "@/lib/booking/rate-limit";
import { cancel, previewCancel } from "@/lib/booking/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  ?t=jeton → le rendez-vous, pour l'afficher avant d'annuler.
 * POST { t }    → l'annulation elle-même.
 *
 * Deux temps exprès : les aperçus de liens (messageries, antivirus des
 * courriels) ouvrent les adresses en GET. Ils ne doivent rien annuler.
 */

export async function GET(request: Request) {
  if (rateLimited(`cancel:${clientIp(request)}`, 30, 10 * 60_000)) return fail("rate_limited");
  try {
    const p = await previewCancel(new URL(request.url).searchParams.get("t"));
    return json({ booking: publicBooking(p.booking), canCancel: p.canCancel, past: p.past });
  } catch (err) {
    return failure(err);
  }
}

export async function POST(request: Request) {
  if (rateLimited(`cancel:${clientIp(request)}`, 30, 10 * 60_000)) return fail("rate_limited");
  const body = (await request.json().catch(() => null)) as { t?: unknown } | null;
  try {
    const booking = await cancel(typeof body?.t === "string" ? body.t : null);
    return json({ booking: publicBooking(booking) });
  } catch (err) {
    return failure(err);
  }
}

/** Ce que la page d'annulation a besoin d'afficher, sans le reste. */
function publicBooking(b: Awaited<ReturnType<typeof cancel>>) {
  return { id: b.id, service: b.service, date: b.date, time: b.time, minutes: b.minutes, price: b.price, start: b.start, end: b.end, firstName: b.firstName, locale: b.locale };
}
