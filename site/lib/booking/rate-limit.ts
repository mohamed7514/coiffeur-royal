/**
 * Limite de débit en mémoire, par adresse IP. Elle vit dans chaque
 * instance du serveur : elle freine un robot qui insiste, sans prétendre
 * être une barrière absolue. La vraie limite anti-abus est celle du
 * nombre de rendez-vous à venir par téléphone, vérifiée dans l'agenda.
 */

const g = globalThis as unknown as { __royalmkHits?: Map<string, number[]> };
const hits: Map<string, number[]> = (g.__royalmkHits ??= new Map<string, number[]>());

export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return false;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
