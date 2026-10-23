import Image from "next/image";
import { type Locale } from "@/lib/content";
import { gallery } from "@/lib/gallery";

/** Existing shop photos, without a carousel or an extra client bundle. */
export function HaircutWork({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const shots = compact ? gallery.slice(1, 3) : gallery;
  return (
    <section id="travaux" className="section shell">
      <span className="mini">RoyalMK</span>
      <h2 className="display h3 mt-3">{locale === "fr" ? "Nos coupes en photos." : "Haircuts at RoyalMK."}</h2>
      <p className="mt-4 max-w-[58ch] text-mute">
        {locale === "fr"
          ? "Une photo vous plaît ? Montrez-la au barbier pour discuter de la longueur et des finitions souhaitées."
          : "See a haircut you like? Show your barber the photo to discuss the length and finish you want."}
      </p>
      <div className={`landing-work-grid${compact ? " landing-work-grid-compact" : ""}`}>
        {shots.map((shot) => (
          <figure key={shot.src} className="m-0">
            <Image src={shot.src} alt={locale === "fr" ? shot.alt : shot.altEn}
              width={510} height={510} sizes={compact ? "(min-width: 1280px) 550px, 50vw" : "(min-width: 1024px) 25vw, 50vw"} quality={75} />
            <figcaption className="mt-3 text-xs leading-relaxed text-mute">
              {locale === "fr" ? shot.alt : shot.altEn}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
