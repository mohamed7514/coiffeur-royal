import { isServiceId } from "@/lib/booking/config";
import { fail, failure, json } from "@/lib/booking/http";
import { clientIp, rateLimited } from "@/lib/booking/rate-limit";
import { availability } from "@/lib/booking/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/reservation/disponibilites?service=coupe → créneaux des 30 prochains jours. */
export async function GET(request: Request) {
  const service = new URL(request.url).searchParams.get("service") ?? "";
  if (!isServiceId(service)) return fail("invalid", "service");
  if (rateLimited(`avail:${clientIp(request)}`, 60, 60_000)) return fail("rate_limited");

  try {
    return json(await availability(service));
  } catch (err) {
    return failure(err);
  }
}
