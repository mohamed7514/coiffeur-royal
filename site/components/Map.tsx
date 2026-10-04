"use client";

import Image from "next/image";
import { useState } from "react";
import { business } from "@/lib/business";
import { content, type Locale } from "@/lib/content";

/**
 * La carte, en deux temps.
 *
 * Au chargement, c'est une image servie par le site : `public/carte.jpg`,
 * assemblée une fois depuis OpenStreetMap par `scripts/carte.mjs`. Aucune
 * requête vers un tiers, aucun cookie, aucun coût de chargement — Google
 * Maps embarqué pèse plusieurs centaines de kilo-octets et dégrade le LCP,
 * qui entre dans la note d'expérience de page de Google Ads, donc dans le
 * coût par clic. Et il dépose des cookies, ce que la Loi 25 encadre.
 *
 * Au clic, la vraie carte Google prend la place : le visiteur qui veut
 * déplacer et zoomer l'a, et lui seul paie le chargement.
 *
 * L'image est désaturée pour tenir dans la page : une carte en couleurs
 * d'origine est le seul endroit du site où du vert et du bleu
 * apparaîtraient.
 */
export function Map({ locale }: { locale: Locale }) {
  const c = content[locale].visit;
  const [live, setLive] = useState(false);

  const embed = `https://maps.google.com/maps?q=${business.geo.lat},${business.geo.lng}&z=17&output=embed`;

  if (live) {
    return (
      <div className="relative aspect-[4/3] w-full border border-rule md:aspect-[21/9]">
        <iframe
          src={embed}
          title={c.mapAlt}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLive(true)}
      aria-label={c.mapOpen}
      className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden border border-rule bg-rule p-0 md:aspect-[21/9]"
    >
      <Image
        src="/carte.jpg"
        alt={c.mapAlt}
        fill
        sizes="(max-width: 64rem) 100vw, 90vw"
        className="object-cover grayscale-[0.85] contrast-[1.05] transition-[filter] duration-500 group-hover:grayscale-[0.35]"
      />

      {/* Le point est au centre exact de l'image : elle est cadrée sur les
          coordonnées du salon. */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal ring-4 ring-paper"
      />

      <span className="btn absolute bottom-4 left-1/2 -translate-x-1/2 text-[0.8rem] md:bottom-6">
        {c.mapOpen}
      </span>

      <span className="absolute bottom-1 right-1.5 bg-paper/80 px-1 text-[0.62rem] text-mute">
        © OpenStreetMap
      </span>
    </button>
  );
}
