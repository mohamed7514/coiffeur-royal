/**
 * L'adresse publique du site, à un seul endroit.
 *
 * Elle sert aux métadonnées, au plan de site, au robots.txt et aux liens
 * absolus des partages. Le domaine public sert de valeur par défaut ;
 * pour en utiliser un autre, poser la variable
 * `NEXT_PUBLIC_SITE_URL` dans l'hébergeur — rien à recompiler à la main.
 *
 * Sur Vercel, l'adresse de la mise en ligne est fournie automatiquement
 * dans `VERCEL_PROJECT_PRODUCTION_URL` : elle sert de secours tant qu'un
 * domaine n'est pas branché, pour que les aperçus de partage ne pointent
 * pas vers un domaine qui n'existe pas encore.
 */
const fallback = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://www.royalmk.ca";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? fallback).replace(/\/$/, "");
