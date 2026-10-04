import type { ServiceId } from "./business";

/**
 * Textes longs des pages de service.
 *
 * Règle d'écriture : décrire ce qui est vrai de ce service par nature,
 * sans inventer de détail propre au salon. Aucune marque de produit,
 * aucune technique non confirmée, aucune promesse de résultat.
 *
 * ⏳ À enrichir une fois confirmé avec le salon :
 *   — « Rasage à l'ancienne » : serviette chaude ? rasage du crâne ?
 *   — « Épilation Faciale » : à la cire ou au fil ? quelles zones ?
 *   — « Forfait VIP » : ce que recouvrent exactement les « soins complets »
 * Ces trois pages sont volontairement sobres en attendant. Les compléter
 * leur donnera du poids, et du vocabulaire que les clients recherchent.
 */

export type ServiceCopy = {
  /** Une ligne, pour la liste de l'accueil. */
  tagline: string;
  /** Paragraphe d'introduction de la page. */
  lead: string;
  /** Ce que la séance comprend. */
  includes: string[];
  /** À qui ça s'adresse, ou quand y penser. */
  forWho: string;
};

type Pair = { fr: ServiceCopy; en: ServiceCopy };

export const serviceCopy: Record<ServiceId, Pair> = {
  coupe: {
    fr: {
      tagline: "Coupe complète, contours et nuque finis",
      lead: "La coupe du salon, aux ciseaux, à la tondeuse ou les deux selon le résultat visé. Le barbier travaille la longueur, les dégradés et la finition des contours, de la nuque et des pattes. Trente minutes, le temps de faire les choses proprement.",
      includes: [
        "Discussion de la coupe voulue avant de commencer",
        "Coupe aux ciseaux, à la tondeuse, ou les deux",
        "Finition des contours, de la nuque et des pattes",
        "Coiffage en fin de séance",
      ],
      forWho:
        "Pour un entretien régulier comme pour un changement de style. Si vous hésitez sur la longueur, venez avec une photo : c'est le moyen le plus sûr de se comprendre.",
    },
    en: {
      tagline: "Full cut, lines and neckline finished",
      lead: "The shop's haircut — scissors, clippers, or both, depending on the result you want. Your barber works the length, the fade and the finish around the lines, neckline and sideburns. Thirty minutes, enough to do it properly.",
      includes: [
        "A word about the cut you want before anything starts",
        "Scissor work, clipper work, or both",
        "Lines, neckline and sideburns finished",
        "Styled before you leave",
      ],
      forWho:
        "For a regular trim or a change of style. If you are unsure about length, bring a photo — it is the surest way to be understood.",
    },
  },

  enfant: {
    fr: {
      tagline: "Même travail, au rythme de l’enfant",
      lead: "La même coupe que pour un adulte, menée au rythme de l'enfant. Le barbier prend le temps qu'il faut, explique ce qu'il fait, et s'arrête si ça devient trop. Trente minutes réservées, même si la coupe en prend quinze.",
      includes: [
        "Coupe adaptée à l'âge et à la texture des cheveux",
        "Finition des contours et de la nuque",
        "Pauses au besoin, sans précipiter",
      ],
      forWho:
        "Pour les enfants, jusqu'à l'âge où ils passent naturellement à la coupe adulte. Pour une première visite, un parent peut rester à côté du fauteuil.",
    },
    en: {
      tagline: "Same work, at the child’s pace",
      lead: "The same haircut as for an adult, done at the child's pace. Your barber takes the time it needs, explains what he is doing, and stops if it gets to be too much. Thirty minutes are set aside even when the cut takes fifteen.",
      includes: [
        "Cut suited to the child's age and hair texture",
        "Lines and neckline finished",
        "Breaks whenever they help, with nothing rushed",
      ],
      forWho:
        "For children, up to the age where they move on to the adult cut. On a first visit, a parent is welcome beside the chair.",
    },
  },

  "coupe-barbe": {
    fr: {
      tagline: "Les deux en une visite, 8 $ de moins",
      lead: "La coupe et la barbe dans la même séance, pensées ensemble. C'est la différence entre une coupe correcte et une tête qui se tient : la ligne de barbe se décide en fonction de la coupe, pas séparément. Pris à la pièce, les deux coûtent 44 $.",
      includes: [
        "Coupe complète, contours et nuque finis",
        "Barbe mise en forme et longueur égalisée",
        "Lignes de barbe tracées en accord avec la coupe",
        "Coiffage en fin de séance",
      ],
      forWho:
        "Pour qui porte la barbe et veut que l'ensemble se tienne. C'est aussi la formule la plus simple quand on espace les visites.",
    },
    en: {
      tagline: "Both in one visit, $8 less",
      lead: "Haircut and beard in the same sitting, worked as one. That is the difference between a decent cut and a head that holds together: the beard line is decided against the cut, not on its own. Booked separately, the two come to $44.",
      includes: [
        "Full haircut, lines and neckline finished",
        "Beard shaped and evened out",
        "Beard lines drawn to match the cut",
        "Styled before you leave",
      ],
      forWho:
        "For anyone who wears a beard and wants the whole thing to hold together. It is also the simplest option when you space out visits.",
    },
  },

  barbe: {
    fr: {
      tagline: "Mise en forme, lignes et longueur",
      lead: "La barbe reprise en entier : longueur égalisée, épaisseur dégradée là où il faut, et les lignes retracées au niveau des joues et du cou. C'est le tracé du cou qui fait la différence entre une barbe entretenue et une barbe qui a poussé.",
      includes: [
        "Longueur égalisée sur l'ensemble",
        "Dégradé des joues vers le menton",
        "Lignes de joues et de cou retracées",
        "Moustache reprise",
      ],
      forWho:
        "Pour entretenir une barbe existante. Toutes les deux à trois semaines, c'est le rythme qui garde une barbe nette sans la raccourcir.",
    },
    en: {
      tagline: "Shape, lines and length",
      lead: "The whole beard taken in hand: length evened out, bulk faded where it needs to be, and the cheek and neck lines drawn again. The neckline is what separates a kept beard from one that has simply grown.",
      includes: [
        "Length evened out across the beard",
        "Faded from the cheeks down to the chin",
        "Cheek and neck lines redrawn",
        "Moustache tidied",
      ],
      forWho:
        "For keeping an existing beard. Every two to three weeks is the rhythm that holds a beard sharp without shortening it.",
    },
  },

  rasage: {
    fr: {
      tagline: "Rasage complet au rasoir",
      lead: "Un rasage complet au rasoir, mené du début à la fin par le barbier. C'est plus net que ce qu'une tondeuse ou un rasoir électrique permet d'obtenir, et c'est une demi-heure assis sans rien faire.",
      includes: [
        "Rasage complet du visage au rasoir",
        "Travail des contours",
        "Trente minutes réservées",
      ],
      forWho:
        "Pour un visage net, ou avant une occasion. Si vous n'avez jamais essayé le rasoir en salon, dites-le au barbier en arrivant.",
    },
    en: {
      tagline: "A full razor shave",
      lead: "A full shave with the razor, handled start to finish by your barber. It is cleaner than anything clippers or an electric razor will give you, and it is half an hour sitting down doing nothing.",
      includes: ["Full face shave with the razor", "Edges worked", "Thirty minutes set aside"],
      forWho:
        "For a clean face, or ahead of an occasion. If you have never had a shop shave, say so when you arrive.",
    },
  },

  epilation: {
    fr: {
      tagline: "Les zones du visage, en complément",
      lead: "L'épilation des zones du visage, en complément d'une coupe ou seule. Dix dollars, et ça règle ce qu'aucune tondeuse n'atteint proprement.",
      includes: ["Zones du visage au choix", "Peut s'ajouter à une coupe ou à une barbe"],
      forWho:
        "Souvent ajouté à une coupe plutôt que pris seul. Mentionnez-le en arrivant, et le barbier l'intègre à la séance.",
    },
    en: {
      tagline: "Facial areas, as an add-on",
      lead: "Waxing of the facial areas, alongside a haircut or on its own. Ten dollars, and it handles what no trimmer reaches cleanly.",
      includes: ["Facial areas of your choice", "Can be added to a haircut or a beard trim"],
      forWho:
        "Usually added to a haircut rather than booked on its own. Mention it when you arrive and your barber will work it in.",
    },
  },

  shampooing: {
    fr: {
      tagline: "En complément d’une coupe",
      lead: "Un shampooing au bac, en complément d'une coupe. Quinze minutes, quatre dollars : la coupe tombe mieux sur cheveux propres, et les cheveux coupés partent avec.",
      includes: ["Lavage au bac", "Séchage"],
      forWho:
        "À ajouter à une coupe. C'est aussi ce qui est compris dans le Forfait VIP.",
    },
    en: {
      tagline: "Alongside a haircut",
      lead: "A wash at the basin, alongside a haircut. Fifteen minutes, four dollars: a cut sits better on clean hair, and the loose clippings go with it.",
      includes: ["Wash at the basin", "Dried off"],
      forWho: "To add to a haircut. It is also part of the VIP Package.",
    },
  },

  vip: {
    fr: {
      tagline: "Coupe, barbe, shampooing et soins en une heure",
      lead: "Tout en une visite : la coupe, la barbe, le shampooing et les soins complets. Une heure réservée, sans se presser. Pris séparément, l'ensemble revient à 65 $.",
      includes: [
        "Coupe complète, contours et nuque finis",
        "Barbe mise en forme, lignes retracées",
        "Shampooing au bac",
        "Soins complets",
      ],
      forWho:
        "Quand on veut tout régler d'un coup, ou avant une occasion. C'est aussi le créneau le plus long du salon : une heure, l'esprit ailleurs.",
    },
    en: {
      tagline: "Haircut, beard, shampoo and care in an hour",
      lead: "Everything in one visit: the haircut, the beard, the shampoo and full care. A full hour set aside, nothing rushed. Booked separately, the same adds up to $65.",
      includes: [
        "Full haircut, lines and neckline finished",
        "Beard shaped, lines redrawn",
        "Wash at the basin",
        "Full care",
      ],
      forWho:
        "For settling everything at once, or ahead of an occasion. It is also the shop's longest slot: an hour with your mind elsewhere.",
    },
  },
};
