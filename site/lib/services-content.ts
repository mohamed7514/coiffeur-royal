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
  /** Résumé court près du prix ; le détail reste disponible dans la page. */
  summary?: string;
  heading?: string;
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
      heading: "Coupe homme",
      summary: "Coupe aux ciseaux ou à la tondeuse, contours et nuque finis, puis coiffage. Apportez une photo pour discuter du résultat souhaité.",
      lead: "Avant de commencer, discutez de la longueur et de la finition souhaitées avec le barbier. La coupe se fait aux ciseaux, à la tondeuse ou avec les deux, puis les contours, la nuque et les pattes sont repris. Le coiffage est inclus.",
      includes: [
        "Discussion de la coupe voulue avant de commencer",
        "Coupe aux ciseaux, à la tondeuse, ou les deux",
        "Finition des contours, de la nuque et des pattes",
        "Coiffage en fin de séance",
      ],
      forWho:
        "Pour entretenir votre coupe ou changer de longueur. Vous pouvez montrer une photo au barbier pour préciser ce que vous souhaitez garder ou modifier.",
    },
    en: {
      tagline: "Haircut with edges and neckline finished",
      heading: "Men’s haircut",
      summary: "Scissors or clippers, with your edges and neckline finished and your hair styled. Bring a photo to discuss the cut you want.",
      lead: "Discuss the length and finish you want with your barber before the cut starts. Your haircut uses scissors, clippers or both, with the edges, neckline and sideburns finished. Styling is included.",
      includes: [
        "Discuss your haircut before we start",
        "Scissor work, clipper work, or both",
        "Edges, neckline and sideburns finished",
        "Styled before you leave",
      ],
      forWho:
        "For a regular trim or a change in length. Show your barber a reference photo to explain what you would like to keep or change.",
    },
  },

  enfant: {
    fr: {
      tagline: "Une coupe au rythme de votre enfant",
      heading: "Coupe enfant",
      summary: "Une coupe adaptée à votre enfant, avec finition des contours et de la nuque. Des pauses au besoin et un parent bienvenu près du fauteuil.",
      lead: "Le barbier adapte la coupe à votre enfant, avec des pauses si nécessaire. Les contours et la nuque sont finis pendant la séance. Un parent peut rester à côté du fauteuil.",
      includes: [
        "Coupe adaptée à l'âge et à la texture des cheveux",
        "Finition des contours et de la nuque",
        "Pauses si nécessaire",
      ],
      forWho:
        "Pour entretenir la coupe de votre enfant ou préparer sa première visite chez le barbier. Vous pouvez apporter une photo de la coupe souhaitée.",
    },
    en: {
      tagline: "A haircut at your child’s pace",
      heading: "Kids’ haircut",
      summary: "A haircut suited to your child, with edges and neckline finished. Breaks when needed, and a parent is welcome beside the chair.",
      lead: "Your barber adapts the haircut to your child, with breaks when needed. The service includes finishing the edges and neckline. A parent is welcome to stay beside the chair.",
      includes: [
        "Cut suited to the child's age and hair texture",
        "Edges and neckline finished",
        "Breaks when needed",
      ],
      forWho:
        "For a regular trim or your child’s first visit to the barber. Bring a reference photo if you have a particular cut in mind.",
    },
  },

  "coupe-barbe": {
    fr: {
      tagline: "Coupe et barbe ensemble : économisez 8 $",
      heading: "Coupe + barbe",
      summary: "Votre coupe et votre barbe dans la même séance, avec les contours et les finitions. Économisez 8 $ sur les deux services pris séparément.",
      lead: "La coupe de cheveux et la taille de barbe sont réunies dans un seul rendez-vous. Le barbier travaille la longueur, la forme de la barbe et les contours. À 36 $, la formule coûte 8 $ de moins que la coupe à 25 $ et la barbe à 19 $ prises séparément.",
      includes: [
        "Coupe complète, contours et nuque finis",
        "Barbe mise en forme et longueur égalisée",
        "Contours des joues et du cou retracés",
        "Coiffage en fin de séance",
      ],
      forWho:
        "Pour faire entretenir votre coupe et votre barbe au même rendez-vous. Choisissez cette formule si vous avez besoin des deux services.",
    },
    en: {
      tagline: "Haircut and beard together: save $8",
      heading: "Haircut + beard",
      summary: "A haircut and beard trim in one visit, with the edges and neckline finished. Save $8 compared with booking the two services separately.",
      lead: "Get your haircut and beard trim in the same appointment. Your barber works on the length, beard shape and edges. At $36, the package saves you $8 compared with a $25 haircut and a $19 beard trim booked separately.",
      includes: [
        "Full haircut, edges and neckline finished",
        "Beard shaped and evened out",
        "Cheek and neck lines defined",
        "Styled before you leave",
      ],
      forWho:
        "For maintaining your haircut and beard in the same appointment. Choose this package when you need both services.",
    },
  },

  barbe: {
    fr: {
      tagline: "Mise en forme, lignes et longueur",
      heading: "Taille de barbe",
      summary: "Longueur égalisée, contours des joues et du cou redessinés, moustache reprise. Pour entretenir votre barbe en gardant la forme souhaitée.",
      lead: "Discutez de la longueur à conserver avec le barbier avant la taille. La barbe est égalisée et mise en forme, les contours des joues et du cou sont retracés, puis la moustache est reprise.",
      includes: [
        "Longueur égalisée sur l'ensemble",
        "Mise en forme de la barbe",
        "Lignes de joues et de cou retracées",
        "Moustache reprise",
      ],
      forWho:
        "Pour entretenir une barbe existante. Vous souhaitez aussi une coupe de cheveux ? La formule coupe + barbe réunit les deux services à 36 $.",
    },
    en: {
      tagline: "Shape, lines and length",
      heading: "Beard trim",
      summary: "Even length, defined cheek and neck lines, and a tidy moustache. Maintain the beard you already have and discuss the shape you want.",
      lead: "Tell your barber how much length you want to keep before the trim. Your beard is evened out and shaped, the cheek and neck lines are defined, and your moustache is tidied.",
      includes: [
        "Length evened out across the beard",
        "Beard shaped",
        "Cheek and neck lines defined",
        "Moustache tidied",
      ],
      forWho:
        "For maintaining an existing beard. Need a haircut too? The haircut and beard package includes both services for $36.",
    },
  },

  rasage: {
    fr: {
      tagline: "Rasage complet au rasoir",
      heading: "Rasage au rasoir",
      summary: "Un rasage complet du visage au rasoir, avec le travail des contours. Choisissez ce service si vous souhaitez un visage entièrement rasé.",
      lead: "Le barbier réalise le rasage complet du visage au rasoir et travaille les contours. Ce service convient si vous souhaitez retirer votre barbe plutôt que la tailler.",
      includes: [
        "Rasage complet du visage au rasoir",
        "Travail des contours du visage",
      ],
      forWho:
        "Pour un visage rasé de près. Si vous souhaitez conserver votre barbe et en entretenir la forme, choisissez plutôt la taille de barbe.",
    },
    en: {
      tagline: "A full face shave with a razor",
      heading: "Razor shave",
      summary: "A full face shave with a razor, with the edges finished. Choose this service when you want a clean-shaven face rather than a beard trim.",
      lead: "Your barber shaves your face with a razor and finishes the edges. Choose this service if you want to remove your beard rather than trim it.",
      includes: ["Full face shave with a razor", "Facial edges finished"],
      forWho:
        "For a clean-shaven look. If you want to keep your beard and maintain its shape, choose a beard trim instead.",
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
        "Usually added to a haircut rather than taken on its own. Mention it when you arrive and your barber will work it in.",
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
      heading: "Forfait VIP",
      summary: "Coupe, barbe, shampooing et soins dans un rendez-vous d’une heure. Appelez le salon pour connaître le détail des soins inclus.",
      lead: "Le forfait VIP réunit la coupe de cheveux, la taille de barbe, le shampooing et des soins dans un rendez-vous de 60 minutes, à 55 $ taxes en sus.",
      includes: [
        "Coupe complète, contours et nuque finis",
        "Barbe mise en forme, lignes retracées",
        "Shampooing au bac",
        "Soins complémentaires du forfait",
      ],
      forWho:
        "Pour regrouper votre coupe, votre barbe, votre shampooing et les soins dans la même visite. Pour connaître les soins inclus dans ce forfait, appelez le salon avant de réserver.",
    },
    en: {
      tagline: "Haircut, beard trim, shampoo and care in one hour",
      heading: "VIP package",
      summary: "Haircut, beard trim, shampoo and care in a one-hour appointment. Call the shop for details about the care included.",
      lead: "The VIP package includes a haircut, beard trim, shampoo and care in a 60-minute appointment for $55, taxes extra.",
      includes: [
        "Full haircut, edges and neckline finished",
        "Beard shaped, cheek and neck lines defined",
        "Wash at the basin",
        "Additional care included in the package",
      ],
      forWho:
        "For a haircut, beard trim, shampoo and care in the same visit. Call the shop before booking to find out which care services are included.",
    },
  },
};
