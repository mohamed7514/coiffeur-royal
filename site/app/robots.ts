import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Tout est ouvert sauf les pages d'essai de design, qui ne doivent
 * jamais apparaître dans une recherche — elles portent le même contenu
 * que l'accueil et feraient du doublon.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/design/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
