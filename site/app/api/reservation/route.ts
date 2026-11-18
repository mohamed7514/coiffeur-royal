import { fail, failure, json } from "@/lib/booking/http";
import { clientIp, rateLimited } from "@/lib/booking/rate-limit";
import { book } from "@/lib/booking/service";
import { validateBooking } from "@/lib/booking/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/reservation → crée le rendez-vous dans Google Agenda. */
export async function POST(request: Request) {
  if (rateLimited(`book:${clientIp(request)}`, 6, 10 * 60_000)) return fail("rate_limited");

  const body = await request.json().catch(() => null);
  const checked = validateBooking(body);
  if (!checked.ok) return fail("invalid", checked.field);

  // Un robot remplit le champ piège ou envoie le formulaire en un éclair.
  // On lui répond comme à un humain refusé, sans rien écrire.
  if (checked.value.website || checked.value.elapsed < 2500) return fail("invalid", "form");

  try {
    return json(await book(checked.value), 201);
  } catch (err) {
    return failure(err);
  }
}
