import Image from "next/image";
import { type Locale } from "@/lib/content";
import { gallery } from "@/lib/gallery";

/** Existing shop photos, without a carousel or an extra client bundle. */
export function HaircutWork({ locale }: { locale: Locale }) {
  return (
    <section id="travaux" className="section shell">
      <span className="mini">{locale === "fr" ? "Réalisations du salon" : "Haircuts done at the shop"}</span>
      <h2 className="display h3 mt-3">{locale === "fr" ? "Votre coupe, vos repères." : "Your cut, your reference."}</h2>
      <p className="mt-4 max-w-[58ch] text-mute">
        {locale === "fr"
          ? "Dégradé sur les côtés, dessus texturé ou coiffé sur le côté : voici des réalisations du salon. Apportez une photo pour discuter du résultat souhaité avant la coupe."
          : "Faded sides, a textured top or a side-parted style: these cuts were done at the shop. Bring a photo to discuss the look you want before the haircut."}
      </p>
      <div className="landing-work-grid">
        {gallery.map((shot) => (
          <figure key={shot.src} className="m-0">
            <Image src={shot.src} alt={locale === "fr" ? shot.alt : shot.altEn}
              width={510} height={510} sizes="(min-width: 1024px) 25vw, 50vw" quality={75} />
            <figcaption className="mt-3 text-xs leading-relaxed text-mute">
              {locale === "fr" ? shot.alt : shot.altEn}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
