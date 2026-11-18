import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Tout est ouvert sauf les pages d'essai de design, qui ne doivent
 * jamais apparaître dans une recherche — elles portent le même contenu
 * que l'accueil et feraient du doublon — l'API de réservation, et les
 * pages d'annulation, privées à chaque client.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/design/", "/api/", "/reserver/annuler", "/en/book/cancel"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
