import type { MetadataRoute } from "next";
import { allServices } from "@/lib/business";
import { SITE_URL } from "@/lib/site";

/**
 * Les 18 pages réelles, dans les deux langues.
 *
 * Chaque entrée déclare sa jumelle dans l'autre langue : c'est ce que
 * Google attend pour comprendre qu'une page française et sa version
 * anglaise sont le même contenu, et non deux pages concurrentes.
 *
 * Les pages `/design/…` n'y figurent pas — ce sont des essais, déjà
 * marqués en `noindex` et refusés dans robots.ts.
 */
const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pair = (fr: string, en: string, priority: number) => [
    {
      url: `${BASE}${fr}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages: { "fr-CA": `${BASE}${fr}`, "en-CA": `${BASE}${en}` } },
    },
    {
      url: `${BASE}${en}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages: { "fr-CA": `${BASE}${fr}`, "en-CA": `${BASE}${en}` } },
    },
  ];

  return [
    ...pair("/", "/en", 1),
    ...pair("/services", "/en/services", 0.8),
    ...allServices.flatMap((s) =>
      pair(`/services/${s.slug}`, `/en/services/${s.slugEn}`, 0.7),
    ),
  ];
}
