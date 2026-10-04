import Image from "next/image";
import { gallery } from "@/lib/gallery";
import { content, type Locale } from "@/lib/content";

/**
 * Tuiles carrées : les fichiers le sont déjà, donc le recadrage reste
 * minime et la grille garde une ligne de base régulière.
 * Deux colonnes sur mobile, quatre sur grand écran — 4 photos tiennent
 * en une rangée nette, sans image orpheline en fin de ligne. À cette
 * largeur, les fichiers de 510 px restent à leur résolution native.
 */
export function Work({ locale }: { locale: Locale }) {
  const c = content[locale];

  return (
    <section id="travaux" className="section shell">
      <div className="flex flex-col gap-3">
        <span className="mini">{c.gallery.label}</span>
        <h2 className="display h2">{c.gallery.title}</h2>
      </div>

      {gallery.length === 0 ? (
        <div className="mt-14 border border-dashed border-rule p-10 text-center md:p-16">
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-mute">{c.gallery.empty}</p>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {gallery.map((shot) => (
            <figure key={shot.src} className="relative m-0 aspect-square overflow-hidden bg-rule">
              <Image
                src={shot.src}
                alt={locale === "fr" ? shot.alt : shot.altEn}
                fill
                sizes="(max-width: 64rem) 50vw, 25vw"
                className="object-cover transition-transform duration-[600ms] ease-out hover:scale-[1.04]"
              />
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
