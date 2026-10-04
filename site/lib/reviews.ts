/**
 * Avis clients repris de la fiche Google.
 *
 * ⚠️ Rien d'inventé ici, jamais. Un avis fabriqué sur le site d'un vrai
 * commerce est un faux témoignage : c'est interdit par la Loi sur la
 * concurrence au Canada, et ça détruirait la crédibilité d'une note
 * 4,9 obtenue honnêtement sur 103 avis.
 *
 * Pour en ajouter : ouvrir https://maps.google.com/?cid=9676733797717479798
 * et copier l'avis mot pour mot, en variant les services (coupe, barbe,
 * enfant) et en choisissant ceux qui parlent du travail concret plutôt
 * que « super service ».
 *
 * Trois des six avis ci-dessous sont écrits en anglais sur Google, trois
 * en français. `text` garde toujours l'original mot pour mot, et
 * `textFr` / `textEn` portent la traduction vers l'autre langue — pour
 * les anglais, celle de Google, relue (la sienne met « ravie » au
 * féminin pour un auteur dont l'anglais ne dit rien du genre). La page
 * annonce toujours une traduction comme telle au lieu de la faire passer
 * pour les mots du client.
 *
 * Aucune date n'est exacte : Google n'affiche qu'un écart (« il y a
 * 3 semaines », « il y a un an »). D'où `approx`, et un affichage réduit
 * à l'année — la seule chose qui soit sûre.
 *
 * La note globale (4,9 sur 103) est affichée séparément : elle est
 * vérifiée, et elle ne dépend pas de cette liste.
 */

export type Review = {
  /** Le nom tel qu'il apparaît sur Google, sans retouche. */
  author: string;
  /** Format ISO. Google ne donne qu'un écart (« il y a 3 semaines ») :
   *  quand la date est reconstituée, `approx` le dit et l'affichage se
   *  limite à ce qui est sûr. */
  date: string;
  approx?: boolean;
  /** Le texte exact de l'avis, dans sa langue d'origine. */
  text: string;
  /** Langue de `text`. */
  lang: "fr" | "en";
  /** Traductions, pour la page de l'autre langue. Jamais présentées
   *  comme les mots d'origine du client : l'affichage le dit. */
  textFr?: string;
  textEn?: string;
  /** Note donnée par ce client, de 1 à 5. */
  stars: number;
  /** Lien direct vers l'avis, pour pouvoir le revérifier. */
  source: string;
};

export const reviews: Review[] = [
  {
    author: "bob joe",
    date: "2026-09-27",
    approx: true, // « il y a 5 jours », relevé le 2 octobre 2026
    lang: "en",
    text: "This man cuts hair like it’s nobody’s business. Went in for a buzz cut, he faded the sides so beautifully as if Micheal Angelo had come back from the grave just to sculpt this scalp of mine. Next thing I knew he was trimming my beard, lining up my brows, all while charging me $25. You better believe I left him a good tip at the end. 10/10 would recommend.",
    textFr:
      "Ce coiffeur est un vrai pro. Je suis allé me faire une coupe très courte, et il a fait un dégradé impeccable sur les côtés, comme si Michel-Ange était revenu d’entre les morts pour sculpter mon crâne. Et puis, sans prévenir, il me taillait la barbe, me redessinait les sourcils, le tout pour 25 dollars. Inutile de préciser que je lui ai laissé un bon pourboire. Je le recommande à 100 %.",
    stars: 5,
    source: "https://maps.app.goo.gl/6Zozd4Xb9DwMBdAx5",
  },
  {
    author: "Anika Montgrain",
    date: "2026-09-02",
    approx: true, // « il y a un mois »
    lang: "fr",
    text: "Super service. Superbes coupes, les enfants sont très contents!",
    textEn: "Great service. Great haircuts, the kids are very happy!",
    stars: 5,
    source: "https://maps.app.goo.gl/DVqV9piiBJTDNNeR9",
  },
  {
    author: "Dmytro Dmytriyev",
    date: "2026-09-11",
    approx: true, // « il y a 3 semaines »
    lang: "en",
    text: "I’m very happy with my experience here. The service was professional, the atmosphere welcoming, and the attention to detail truly impressive. My haircut turned out exactly how I wanted — clean, sharp, and perfectly styled. Thank you for the great work!",
    textFr:
      "Je suis très content de mon expérience. Le service était professionnel, l’ambiance chaleureuse et le souci du détail vraiment impressionnant. Ma coupe est exactement comme je la voulais : nette, précise et parfaitement coiffée. Merci pour l’excellent travail !",
    stars: 5,
    source: "https://maps.app.goo.gl/hnAt2Ebjkoq5kAEd8",
  },
  {
    author: "Cedrik Levesque",
    date: "2026-03-02",
    approx: true, // « il y a 7 mois »
    lang: "fr",
    text: "Je suis allé deux fois chez RoyalMK et je suis vraiment satisfait. Il prend son temps, travaille proprement et avec beaucoup de précision autant pour la barbe que pour la coupe. Ambiance calme, pas de blabla inutile, juste du travail solide et attentionné. Je recommande à 100% à ceux qui veulent un résultat net et pro.",
    textEn:
      "I’ve been to RoyalMK twice and I’m really satisfied. He takes his time and works cleanly, with a lot of precision on the beard as much as on the cut. Quiet atmosphere, no needless chit-chat, just solid, careful work. I recommend it 100% to anyone who wants a sharp, professional result.",
    stars: 5,
    source: "https://maps.app.goo.gl/6g8FEaRsVedLhkYp9",
  },
  {
    author: "Maxime D",
    date: "2025-10-01",
    approx: true, // « il y a un an »
    lang: "fr",
    text: "Super bel accueil! Des gens chaleureux, ils m’ont fait une place même si je n’avais pas de rendez-vous et la coupe était exactement ce que j’avais demandé. Une nouvelle entreprise que je recommande à tous!",
    textEn:
      "Lovely welcome! Warm people — they made room for me even though I had no appointment, and the cut was exactly what I asked for. A new business I recommend to everyone!",
    stars: 5,
    source: "https://maps.app.goo.gl/iX4oZUp1p6WDURvZ9",
  },
  {
    author: "Adil Damiri",
    date: "2025-10-01",
    approx: true, // « il y a un an » : seule l'année est sûre
    lang: "en",
    text: "Absolutely amazing! His attention to detail and precision cutting skills are top-notch. He truly understands what you want and delivers an exceptional haircut every time. Highly recommend for anyone looking for a skilled barber who can give you the perfect haircut.",
    textFr:
      "Absolument incroyable ! Son souci du détail et sa précision de coupe sont exceptionnels. Il comprend parfaitement vos attentes et vous offre une coupe impeccable à chaque fois. Je le recommande vivement à tous ceux qui cherchent un barbier talentueux, capable de réaliser la coupe parfaite.",
    stars: 5,
    source: "https://maps.app.goo.gl/94gjiAeDVKE6jAxV7",
  },
];
