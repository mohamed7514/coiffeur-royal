import { after } from "next/server";
import { alertSalon } from "@/lib/booking/alert";
import { calendar } from "@/lib/booking/calendar";
import { json } from "@/lib/booking/http";
import { clientIp, rateLimited } from "@/lib/booking/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/reservation/sante : 200 si l'agenda répond, 503 sinon.
 * À brancher sur un service de surveillance (voir RESERVATION.md) : il
 * appelle cette adresse toutes les 5 minutes et prévient le salon.
 * Ne révèle rien du réglage, seulement « ok » ou « en panne ».
 */
export async function GET(request: Request) {
  if (rateLimited(`health:${clientIp(request)}`, 30, 60_000)) return json({ ok: false }, 429);
  try {
    const cal = calendar();
    const now = new Date();
    await cal.list(now, new Date(now.getTime() + 60 * 60_000));
    return json({ ok: true });
  } catch (err) {
    console.error("[reservation] sante : agenda en panne", err);
    after(() => alertSalon(`Contrôle de santé : ${err instanceof Error ? err.message : err}`));
    return json({ ok: false }, 503);
  }
}
