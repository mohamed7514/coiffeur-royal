/**
 * Photos du travail du salon.
 *
 * ⚠️ Uniquement des coupes faites par le barbier. Pas d'images trouvées
 * en ligne : elles montreraient le travail de quelqu'un d'autre, et le
 * salon n'en détiendrait pas les droits.
 *
 * Pour ajouter une photo :
 *   1. la déposer dans site/public/travaux/, nommée d'après la coupe
 *   2. ajouter une entrée ici, avec un alt qui décrit la coupe
 *
 * Les tuiles sont carrées et recadrées au centre. La grille fait deux
 * colonnes sur mobile et quatre sur grand écran : **4 ou 8 photos**
 * remplissent les rangées sans laisser d'image seule en fin de ligne.
 *
 * Résolution des fichiers actuels : 510 px de côté. C'est juste assez
 * pour la grille, mais les prochaines photos gagneraient à faire au
 * moins 1200 px — un écran haute densité réclame le double de pixels.
 */

export type Shot = {
  src: string;
  /** Décrit la coupe, pas l'ambiance : c'est ce qu'un lecteur d'écran lira. */
  alt: string;
  altEn: string;
};

export const gallery: Shot[] = [
  {
    src: "/travaux/degrade-texture.webp",
    alt: "Dégradé sur les côtés et dessus texturé.",
    altEn: "Faded sides and a textured top.",
  },
  {
    src: "/travaux/pompadour-degrade.webp",
    alt: "Dessus relevé, côtés dégradés et barbe dessinée.",
    altEn: "Lifted top, faded sides and a defined beard.",
  },
  {
    src: "/travaux/raie-cote-barbe.webp",
    alt: "Cheveux coiffés vers l’arrière, dégradé et barbe taillée.",
    altEn: "Hair swept back, faded sides and a trimmed beard.",
  },
  {
    src: "/travaux/gris-barbe-pleine.webp",
    alt: "Cheveux gris coiffés vers l’arrière et barbe blanche taillée.",
    altEn: "Grey hair swept back and a trimmed white beard.",
  },
];
