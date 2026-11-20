/**
 * Champs du formulaire de réservation : mise en forme pendant la saisie et
 * diagnostic précis de ce qui manque. Sans dépendance, pour servir aussi
 * bien dans le navigateur que sur le serveur : les deux appliquent la même
 * règle, donc un numéro accepté à l'écran l'est aussi à l'envoi.
 */

/* ── Téléphone ──────────────────────────────────────────────────────── */

/** Saisie internationale : le client a commencé par « + » suivi d'un autre
 *  indicatif que 1. Le préfixe +1 disparaît alors de l'écran. */
export const isInternational = (raw: string) => /^\s*\+/.test(raw) && !/^\s*\+\s*1/.test(raw);

/** Les 10 chiffres d'un numéro nord-américain, sans le 1 initial. */
const nationalDigits = (raw: string) => {
  const d = raw.replace(/\D/g, "");
  // « +1 » tapé ou collé : c'est le préfixe déjà affiché, on le retire.
  if (/^\s*\+\s*1/.test(raw)) return d.slice(1);
  return d.length > 10 && d.startsWith("1") ? d.slice(1) : d;
};

/**
 * Mise en forme au fil de la frappe : « 514 », « (514) 23 », « (514) 235-2094 ».
 * Aucun séparateur n'est ajouté après le dernier chiffre : la touche
 * d'effacement retire donc toujours un chiffre, jamais une parenthèse.
 */
export function formatPhoneTyping(raw: string): string {
  if (isInternational(raw)) {
    // « + », chiffres et espaces seulement, 15 chiffres au plus (norme E.164).
    let digits = 0;
    let out = "+";
    for (const ch of raw.replace(/^\s*\+/, "")) {
      if (/\d/.test(ch) && digits < 15) {
        out += ch;
        digits++;
      } else if (ch === " " && !out.endsWith(" ") && out !== "+") out += " ";
    }
    return out;
  }
  const d = nationalDigits(raw).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Nombre de chiffres avant une position du texte, pour replacer le curseur. */
export const digitsBefore = (text: string, pos: number) => text.slice(0, pos).replace(/\D/g, "").length;

/** Position juste après le n-ième chiffre du texte mis en forme. */
export function caretAfterDigits(text: string, n: number): number {
  if (n <= 0) return text.startsWith("+") ? 1 : 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i]) && ++seen === n) return i + 1;
  }
  return text.length;
}

export type PhoneProblem = "empty" | "short" | "areaCode" | "intlShort" | "intlLong";
export type PhoneCheck = { ok: true; e164: string } | { ok: false; problem: PhoneProblem; missing?: number };

/** Le numéro au format E.164, ou la raison précise du refus. */
export function checkPhone(raw: string): PhoneCheck {
  const t = raw.trim();
  if (!t.replace(/\D/g, "")) return { ok: false, problem: "empty" };

  if (isInternational(t)) {
    const d = t.replace(/\D/g, "");
    if (d.length < 8) return { ok: false, problem: "intlShort" };
    if (d.length > 15) return { ok: false, problem: "intlLong" };
    return { ok: true, e164: `+${d}` };
  }

  const d = nationalDigits(t);
  if (d.length < 10) return { ok: false, problem: "short", missing: 10 - d.length };
  if (d.length > 10) return { ok: false, problem: "intlLong" };
  if (!/^[2-9]/.test(d)) return { ok: false, problem: "areaCode" };
  return { ok: true, e164: `+1${d}` };
}

/* ── Courriel ───────────────────────────────────────────────────────── */

export const isEmail = (s: string) => s.length <= 254 && /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/i.test(s);

export type EmailProblem = "empty" | "spaces" | "noAt" | "twoAt" | "noUser" | "noDomain" | "noDot" | "format";

/** null si l'adresse est valide, sinon ce qui cloche. */
export function checkEmail(raw: string): EmailProblem | null {
  const t = raw.trim();
  if (!t) return "empty";
  if (/\s/.test(t)) return "spaces";
  const at = t.split("@").length - 1;
  if (at === 0) return "noAt";
  if (at > 1) return "twoAt";
  const [user, domain] = t.split("@");
  if (!user) return "noUser";
  if (!domain) return "noDomain";
  if (!/\.[a-z]{2,}$/i.test(domain)) return "noDot";
  return isEmail(t) ? null : "format";
}

/** Fournisseurs les plus courants au Québec, pour repérer les fautes de frappe. */
const DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "hotmail.ca",
  "outlook.com",
  "live.ca",
  "live.com",
  "yahoo.com",
  "yahoo.ca",
  "icloud.com",
  "me.com",
  "msn.com",
  "videotron.ca",
  "bell.net",
  "sympatico.ca",
  "rogers.com",
  "protonmail.com",
  "hotmail.fr",
  "outlook.fr",
  "live.fr",
  "yahoo.fr",
  "orange.fr",
  "uottawa.ca",
];

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/**
 * Adresse corrigée si le domaine ressemble de près à un fournisseur connu
 * (« gmial.com », « hotmail.con », « gmail » sans « .com »), sinon null.
 * Ce n'est qu'une suggestion : le client garde le dernier mot.
 */
export function suggestEmail(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  const at = t.lastIndexOf("@");
  if (at < 1) return null;
  const user = t.slice(0, at);
  const domain = t.slice(at + 1);
  if (!domain || DOMAINS.includes(domain)) return null;

  let best: string | null = null;
  let bestScore = Infinity;
  for (const d of DOMAINS) {
    const score = distance(domain, d);
    if (score < bestScore) {
      best = d;
      bestScore = score;
    }
  }
  // Domaine sans extension (« gmail », « hotmail ») : on propose le .com.
  if (!domain.includes(".")) {
    const named = DOMAINS.find((d) => d.split(".")[0] === domain);
    if (named) return `${user}@${named}`;
  }
  // Un domaine court tolère moins d'écart : « me.ca » n'est pas une faute de « me.com ».
  const tolerance = domain.length >= 9 ? 2 : 1;
  return best && bestScore > 0 && bestScore <= tolerance ? `${user}@${best}` : null;
}
