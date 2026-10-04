# Site — Barbier RoyalMK

Next.js 16 · React 19 · Tailwind v4 · TypeScript · GSAP (ScrollTrigger, pour le
seul hero)

**Garder Next à jour n'est pas optionnel** : Vercel refuse de compiler une
version portant une faille connue, avec le message « Vulnerable version of
Next.js detected ». `npm audit` doit rester à zéro.
Plan de référence : [../plan-site-web.md](../plan-site-web.md)

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Capture du rendu pour relire la mise en page :

```bash
node scripts/shot.mjs http://localhost:3000 ./.shots
```

---

## Où se trouve quoi

| Fichier | Rôle |
|---|---|
| `lib/business.ts` | **Source unique** : adresse, téléphone, heures, services, prix, adresses de page, lien Squire, fiche Google |
| `lib/content.ts` | Tous les textes d'interface, français et anglais |
| `lib/services-content.ts` | Textes longs des pages de service, français et anglais |
| `lib/hours.ts` | Calcul « ouvert / fermé » à l'heure de Gatineau |
| `lib/gallery.ts` | Photos du travail |
| `lib/reviews.ts` | Avis clients relevés sur Google, avec le lien de chacun |
| `app/(fr)/` | Pages françaises |
| `app/(en)/en/` | Pages anglaises |
| `app/globals.css` | Palette, typographie, lignes de tarif, grille de filets |
| `scripts/carte.mjs` | Fabrique `public/carte.jpg` depuis OpenStreetMap |
| `scripts/icones.mjs` | Fabrique l'icône et l'image de partage |
| `lib/site.ts` | L'adresse publique du site, à un seul endroit |
| `app/sitemap.ts`, `app/robots.ts` | Plan de site bilingue et robots.txt |

### Les 18 pages

```
/                               /en
/services                       /en/services
/services/coupe-de-cheveux      /en/services/haircut
/services/coupe-pour-enfant     /en/services/kids-haircut
/services/coupe-et-barbe        /en/services/haircut-and-beard
/services/taillage-de-barbe     /en/services/beard-trim
/services/rasage-a-l-ancienne   /en/services/traditional-shave
/services/epilation-faciale     /en/services/facial-waxing
/services/shampooing            /en/services/shampoo
/services/forfait-vip           /en/services/vip-package
```

Toutes statiques. Les adresses sont traduites : un mot-clé dans l'URL aide le
référencement, et `hreflang` relie chaque paire. Ajouter un service, c'est une
entrée dans `lib/business.ts` plus son texte dans `lib/services-content.ts` —
les deux pages se génèrent ensuite d'elles-mêmes.

### Correspondance avec les groupes d'annonces

C'est à ça que servent ces pages : envoyer chaque annonce sur une page qui
parle de ce que la personne a cherché. Voir la section 3 de
[../plan-site-web.md](../plan-site-web.md).

| Groupe | Page de destination |
|---|---|
| GA2 Coupe homme | `/services/coupe-de-cheveux` |
| GA3 Barbe | `/services/taillage-de-barbe`, `/services/rasage-a-l-ancienne` |
| GA4 Enfant | `/services/coupe-pour-enfant` |
| GA5 Forfait | `/services/forfait-vip` |
| GA6 Anglais | les pages `/en/services/…` correspondantes |

Un changement de prix, d'heure ou de téléphone se fait **uniquement** dans
`lib/business.ts`. Le nom, l'adresse et le téléphone doivent rester identiques
au caractère près entre le site, la fiche Google et Squire.

---

## Décisions inscrites dans le code

**Tous les boutons mènent à la page du salon dans Squire**, jamais à celle d'un
barbier : un lien vers un seul barbier meurt dès qu'il est complet ou absent.

**Les noms de services sont ceux de Squire, mot pour mot.** Squire ne permet pas
de présélectionner un service par l'URL, donc le visiteur doit retrouver ce nom
exact dans la liste après son clic. Au survol d'une ligne de tarif, la durée
cède la place à « Réserver » pour qu'il garde le mot en tête.

**La note 4,9 s'affiche mais n'est pas balisée en `aggregateRating`.** Google
interdit de marquer ses propres avis sur son propre site. Les étoiles des
résultats de recherche viennent de la fiche d'établissement, pas d'ici.

**Le badge d'appel flottant n'apparaît que sur grand écran.** Sur mobile, la
barre d'action en bas fait le même travail en mieux : elle tombe sous le pouce
et ne recouvre pas le texte. Son point suit l'état réel du salon — quand c'est
fermé, l'étiquette dit quand ça rouvre et la pulsation s'arrête, au lieu
d'inviter à appeler dans le vide.

**Le sélecteur de langue montre les deux langues**, l'active en pastille pleine.
Un bouton unique affichant seulement l'autre langue laisse deviner lequel des
deux sens il désigne.

**Aucun angle arrondi, nulle part.** Boutons, images, encadrés : tout est à
angle vif, comme chez les salons dont la direction est tirée.

**Une seule séquence animée, dans le hero.** Des blocs qui apparaissent un par
un au défilement sont la signature des pages générées, et chaque animation coûte
du temps de chargement sur du trafic payant. Le hero épingle la page sur 180 %
de sa hauteur ; au-delà, la liste des prix est trop loin. La jauge verticale dit
où on en est et qu'il y a une fin — sans elle, un hero épinglé est pénible.

**Le `h1` reste le titre de référencement.** Le hero affiche deux textes au fil
du défilement : le premier est le `h1` et porte « barbier à Gatineau », le second
parle métier. L'ordre n'est pas interchangeable.

**La carte en deux temps.** Au chargement, c'est `public/carte.jpg` — une image
assemblée une fois depuis OpenStreetMap par `node scripts/carte.mjs`, servie par
le site, désaturée pour tenir dans la palette. Au clic, la vraie carte Google
prend la place. Google Maps embarqué d'office dégrade le LCP, qui entre dans la
note d'expérience de page de Google Ads donc dans le coût par clic, et dépose
des cookies que la Loi 25 encadre : seul le visiteur qui veut déplacer et zoomer
paie ce prix. Relancer le script si l'adresse change.

**Thème clair unique** — fond beige `#f5f4f1`, encre `#0a090c`. La direction
(« D — Crisp ») est relevée dans la feuille de style de crispmtl.com : titres en
grotesque large et lourde, étiquette serif au-dessus de chaque section, boutons
noirs carrés, près de 200 px entre les sections, grille de six colonnes laissée
visible en filets. Archivo réglé à 125 % de largeur remplace leur Helvetica Neue
Bold Extended, qui n'existe pas en licence libre.

**Le rouge du salon ne sert plus qu'à deux choses** : dire que c'est ouvert, et
les étoiles des avis. Partout ailleurs, c'est du noir sur du beige.

---

## Mise en ligne

Hébergeur retenu : **Vercel**. Rien de particulier à configurer, Next.js y
fonctionne tel quel.

```bash
npm i -g vercel     # une seule fois
vercel login
vercel              # aperçu, sur une adresse temporaire
vercel --prod       # mise en ligne
```

Le domaine est centralisé dans `lib/site.ts`. Tant qu'il n'est pas branché, le
site utilise l'adresse fournie par Vercel ; une fois le domaine en place, poser
`NEXT_PUBLIC_SITE_URL=https://ledomaine.ca` dans les variables d'environnement
du projet et redéployer. Rien d'autre à changer : métadonnées, plan de site et
robots.txt la lisent tous.

Après la première mise en ligne :

1. déclarer le site dans la Google Search Console et y soumettre
   `/sitemap.xml` ;
2. vérifier que `/robots.txt` refuse bien `/design/` ;
3. relancer `node scripts/shot.mjs https://ledomaine.ca ./.shots` pour relire
   la mise en page telle qu'elle est servie.

---

## À faire avant la mise en ligne

- [x] **Photos du travail** — 4 coupes en ligne dans `public/travaux/`.
      Quatre de plus rempliraient une deuxième rangée complète, et des
      fichiers d'au moins 1200 px seraient plus nets sur écran haute densité.
- [x] **Avis** — 6 avis relevés mot pour mot sur Google dans `lib/reviews.ts`,
      avec le lien de chacun. Trois sont écrits en anglais : l'original et la
      traduction sont stockés séparément, et l'affichage annonce la traduction.
- [ ] **Photo de hero d'au moins 2000 px de large** — `public/salon.jpg` fait
      618 × 800 px pour un plein écran. Dernière étape avant la mise en ligne.
- [ ] **Prix du Forfait VIP dans Squire** — 55 $ s'affiche sur le site ; vérifier
      qu'il s'affiche aussi sur la page de réservation.
- [ ] **Relecture de l'anglais** par une personne bilingue.
- [ ] **Suivi des conversions** — GA4, événements `clic_reservation`,
      `clic_telephone`, `clic_itineraire`, `clic_service`, puis import dans
      Google Ads. Voir la section 9 du plan.
- [ ] **Bandeau de consentement** — la Loi 25 s'applique au Québec.
- [ ] **Domaine** `barbierroyalmk.ca` et redirections depuis l'ancien site.
- [ ] **Icône et image de partage** (`app/icon.png`, `app/opengraph-image.png`).

La campagne Google Ads s'allume **en dernier**, quand le suivi fonctionne.

---

## Images

`public/salon.jpg` — la salle, en photo réelle. Elle tient le hero en plein
cadre, sous un voile noir et un grain fin qui masquent l'agrandissement : le
fichier ne fait que 618 × 800 px, et c'est le point faible de la page tant qu'il
n'est pas remplacé.

`public/carte.jpg` — la carte du secteur, assemblée depuis les tuiles
d'OpenStreetMap par `scripts/carte.mjs`. Attribution « © OpenStreetMap »
affichée sur la carte, comme la licence l'exige.

`public/frames/` — 72 images extraites de la vidéo du salon. Elles font le hero
de l'accueil (`components/HeroCanvas.tsx`), piloté au défilement : la tête tourne
du profil à la nuque pendant que la page est épinglée. `/design/hero` garde la
même chose en page d'essai.
Dans Next.js, tout ce qui est dans `public/` est servi tel quel à la racine :
`public/frames/frame_0001.webp` s'appelle `/frames/frame_0001.webp`. Les frames
ne passent **pas** par `next/image` — elles sont chargées en `new Image()` et
dessinées dans un Canvas, donc elles doivent être prêtes à l'emploi.

La commande qui les fabrique, à relancer si la vidéo change :

```bash
ffmpeg -i "ma-video.mp4" \
  -vf "fps=14.3,scale=540:-2" \
  -c:v libwebp -q:v 52 -compression_level 6 -preset picture \
  site/public/frames/frame_%04d.webp
```

`fps=14.3` sur une vidéo de 5 s donne 72 frames ; `scale=540:-2` fixe la largeur
et laisse ffmpeg calculer une hauteur paire. `-q:v 52` tient la moyenne à 21 Ko
par image, soit **1,7 Mo pour la séquence entière** — c'est le vrai coût de ce
hero, et il se paie avant le premier affichage.

Le nombre d'images est le réglage qui décide de la fluidité : à 48 images,
il y avait 34 px de défilement entre deux images et le fondu se voyait comme un
dédoublement ; à 72, il en reste 23. Monter encore alourdirait la mémoire des
images décodées, qui est le vrai plafond de ce procédé.

540 px n'est pas un compromis au rabais : sur grand écran l'image est posée en
panneau vertical d'environ 500 px de large, donc elle est affichée à sa taille
réelle. Monter la largeur n'ajouterait de la netteté que sur mobile.

`public/travaux/` — quatre coupes faites par le barbier, confirmées par le
client le 01/10/2026. Les lumières d'origine diffèrent beaucoup d'une photo à
l'autre : un filtre léger et identique les ramène à une seule série.

Un cinquième fichier (`unnamed (4).webp`, à la racine du projet) est un portrait
en extérieur plutôt qu'un résultat de coupe. Il n'a pas été retenu.
