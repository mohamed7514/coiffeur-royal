/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Les 72 images du hero pèsent 1,7 Mo et ne changent jamais entre
        // deux mises en ligne. Sans cette règle, un visiteur qui revient
        // les retélécharge : Next ne met pas `public/` en cache longue
        // durée par défaut, puisqu'il ne peut pas savoir si le contenu a
        // bougé. Un mois de cache, avec revalidation en arrière-plan.
        source: "/frames/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Même raisonnement pour les photos et la carte.
        source: "/:file*(jpg|webp|png)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
