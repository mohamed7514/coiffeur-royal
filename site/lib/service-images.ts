import type { StaticImageData } from "next/image";
import type { ServiceId } from "./business";
import photo0 from "@/public/services/coupe-hd.webp";
import photo1 from "@/public/services/enfant-hd.webp";
import photo2 from "@/public/services/coupe-barbe-hd.webp";
import photo3 from "@/public/services/barbe-hd.webp";
import photo4 from "@/public/services/rasage-hd.webp";
import photo5 from "@/public/services/epilation-faciale.webp";
import photo6 from "@/public/services/shampooing-hd.webp";
import photo7 from "@/public/services/vip-hd.webp";
import homeHaircut from "@/public/services/coupe-accueil-hd.webp";

// Photos de services restaurées en haute définition avec imagegen à partir des originales.
// L’épilation est un visuel original généré. Les fichiers de référence sont conservés.
// Les descriptions portent sur ce qui est visible.
export const serviceImages: Record<ServiceId, {
  src: StaticImageData;
  alt: { fr: string; en: string };
  caption?: { fr: string; en: string };
}> = {
  "coupe": {
    src: photo0,
    alt: {
      "fr": "Coupe courte avec dégradé, vue de profil et de la nuque",
      "en": "Short haircut with a fade, seen from the side and neckline"
    },
  },
  "enfant": {
    src: photo1,
    alt: {
      "fr": "Jeune client avec un dégradé et des cheveux texturés sur le dessus",
      "en": "Young client with a fade and textured hair on top"
    },
  },
  "coupe-barbe": {
    src: photo2,
    alt: {
      "fr": "Barbier travaillant les contours d’une barbe à la tondeuse",
      "en": "Barber defining beard edges with clippers"
    },
  },
  "barbe": {
    src: photo3,
    alt: {
      "fr": "Taille d’une barbe avec un peigne et une tondeuse",
      "en": "Beard being trimmed with a comb and clippers"
    },
  },
  "rasage": {
    src: photo4,
    alt: {
      "fr": "Préparation d’un rasage avec de la mousse sur le visage",
      "en": "Shave preparation with lather on the face"
    },
  },
  "epilation": {
    src: photo5,
    alt: {
      "fr": "Application de cire sur la joue d’un homme, au-dessus de la ligne de barbe",
      "en": "Wax being applied to a man’s cheek above the beard line"
    },
    caption: {
      "fr": "Visuel d’illustration généré.",
      "en": "Generated illustrative image."
    },
  },
  "shampooing": {
    src: photo6,
    alt: {
      "fr": "Lavage des cheveux au bac du salon",
      "en": "Hair being washed at a salon basin"
    },
  },
  "vip": {
    src: photo7,
    alt: {
      "fr": "Homme avec les cheveux coiffés et une barbe grise entretenue",
      "en": "Man with styled hair and a groomed grey beard"
    },
  },
};

/** Le hero présente déjà la coupe de photo0. L’accueil utilise une autre réalisation.
 * La galerie est réunie avec les services pour afficher chaque sujet une seule fois. */
export const homeServiceImages: typeof serviceImages = {
  ...serviceImages,
  coupe: {
    src: homeHaircut,
    alt: {
      fr: "Dégradé haut, dessus relevé en pompadour et barbe courte aux contours nets",
      en: "High fade with a pompadour on top and a short, neatly lined beard",
    },
  },
};
