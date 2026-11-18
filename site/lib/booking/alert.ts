import { sendAlert } from "./email";

/**
 * Prévient le salon quand la réservation ne fonctionne plus.
 *
 * Un seul message par tranche de 30 minutes et par instance du serveur :
 * une panne de Google Agenda fait échouer chaque visiteur, et le salon ne
 * doit pas recevoir cent courriels. La surveillance externe de
 * `/api/reservation/sante` (voir RESERVATION.md) reste le filet principal,
 * parce qu'elle ne dépend pas d'un visiteur.
 */

const COOLDOWN_MS = 30 * 60_000;
const g = globalThis as unknown as { __royalmkAlertAt?: number };

export async function alertSalon(reason: string): Promise<void> {
  const now = Date.now();
  if (g.__royalmkAlertAt && now - g.__royalmkAlertAt < COOLDOWN_MS) return;
  g.__royalmkAlertAt = now;
  await sendAlert(
    "⚠ Réservation en ligne : problème détecté",
    [
      "La réservation en ligne a rencontré un problème avec Google Agenda.",
      "Les clients voient un message avec le numéro du salon, mais ne peuvent plus réserver en ligne.",
      "",
      `Détail technique : ${reason.slice(0, 300)}`,
      "",
      "À vérifier : l'agenda est toujours partagé avec le compte de service, la clé n'a pas été supprimée, et Google Calendar API est toujours activée.",
    ].join("\n"),
  ).catch(() => undefined);
}
