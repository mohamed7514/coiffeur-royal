import Image from "next/image";
import { business } from "@/lib/business";
import { gallery } from "@/lib/gallery";
import { content, type Locale } from "@/lib/content";

/**
 * Le salon en une phrase, une photo et la note Google.
 *
 * La photo ne tient qu'un tiers de la largeur : à cette taille, les
 * fichiers de 510 px sont nets, là où un plein écran les étirerait.
 * Les ancres sous le texte remplacent un menu que la page n'a pas.
 */
export function Story({ locale }: { locale: Locale }) {
  const c = content[locale];
  const home = locale === "fr" ? "/" : "/en";
  const score =
    locale === "fr"
      ? business.rating.score.toFixed(1).replace(".", ",")
      : business.rating.score.toFixed(1);
  const shot = gallery[2];

  return (
    <section className="section shell flex flex-col gap-8 lg:h-[66vh] lg:min-h-[32rem] lg:flex-row">
      <div className="relative h-[50vh] w-full overflow-hidden lg:h-full lg:w-1/3">
        {shot && (
          <Image
            src={shot.src}
            alt={locale === "fr" ? shot.alt : shot.altEn}
            fill
            sizes="(max-width: 64rem) 100vw, 33vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-col justify-between gap-10 lg:w-[65%]">
        <div className="flex flex-col gap-3">
          <span className="mini">{c.story.label}</span>
          <h2 className="display h2">{c.story.title}</h2>
        </div>

        <p className="max-w-[44ch] text-[1.05rem] text-mute">{c.story.body}</p>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.82rem] uppercase tracking-[0.06em] text-mute">
            <a href={home + "#services"} className="transition-colors hover:text-ink">
              {c.nav.services}
            </a>
            <a href={home + "#travaux"} className="transition-colors hover:text-ink">
              {c.nav.gallery}
            </a>
            <a href={home + "#visiter"} className="transition-colors hover:text-ink">
              {c.nav.visit}
            </a>
          </nav>

          <a
            href={business.maps}
            target="_blank"
            rel="noopener"
            className="flex items-baseline gap-2.5"
          >
            <b className="display text-[2.6rem] leading-[0.9]">{score}</b>
            <span className="text-[0.85rem] leading-tight text-mute">
              {c.proof.ratingCount(business.rating.count)}
              <br />
              {c.proof.ratingLabel}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
