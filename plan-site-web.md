# Plan de construction — Site web Barbier RoyalMK

Document de référence pour la construction. Aucun code ici.
Compagnon de [mots-cles.md](mots-cles.md) (campagne Google Ads).

---

## 0. Ce que le site doit faire

Ce n'est pas une vitrine. C'est la **page d'atterrissage d'une campagne Google Ads payante** : environ 1 570 recherches/mois visées, à 1,50–2,50 $ CAD le clic. Chaque visiteur coûte de l'argent.

Le visiteur type : un homme à Gatineau, sur son téléphone, qui vient de taper « barbier gatineau ». Il donne au site **environ 3 secondes** pour répondre à quatre questions :

| Question | Réponse qui doit être visible sans défiler |
|---|---|
| C'est bien un barbier pour hommes ? | Oui — le mot « Barbier », une photo d'homme |
| Combien ça coûte ? | Coupe 25 $ |
| C'est ouvert ? | 7 j/7, dimanche inclus, jusqu'à 19 h |
| Comment je réserve ? | Un bouton, et un numéro cliquable |

Tout le reste du plan, animations comprises, est au service de ces quatre réponses. Une animation qui retarde l'une d'elles est une animation à couper.

---

## 1. Contraintes non négociables

**Mobile d'abord.** Les recherches « barbier + ville » et « near me » sont massivement mobiles, souvent faites à quelques rues du salon. Le design se dessine à 390 px de large en premier, le desktop ensuite.

**Performance : LCP sous 2,5 s en 4G.** Ce n'est pas du perfectionnisme. Google Ads note l'**expérience de la page de destination**, et cette note influence le coût par clic et le classement de l'annonce. Une page lente se paie deux fois : en visiteurs perdus et en CPC plus cher.

**Budget média du hero : 1,5 Mo maximum**, image d'affiche comprise.

**`prefers-reduced-motion` respecté partout.** Une animation qui ne sait pas s'éteindre est un bug d'accessibilité.

**Bilingue FR / EN.** La campagne anglaise existe (≈ 220 recherches/mois) ; sans page anglaise, ce budget est gaspillé.

---

## 2. Réservation : Squire

L'ancien site pointe vers **Squire** (`getsquire.com`), une plateforme spécialisée barbershop. Slug du salon : `royalmk-gatineau`.

### ⚠️ Un problème à corriger

Tous les boutons de l'ancien site mènent à `tinyurl.com/6vjrhm9t`, qui redirige vers la page d'**un seul barbier** : `.../book/royalmk-gatineau/barber/khadija-ayad`.

Trois conséquences :
1. Si ce barbier est complet ou absent, **chaque clic de réservation meurt**.
2. Le visiteur ne voit pas les autres barbiers, donc moins de créneaux, donc moins de réservations.
3. Le raccourci TinyURL ajoute une redirection inutile et empêche tout suivi propre.

**À faire :** pointer vers la page du salon, pas celle d'un barbier, et retirer le raccourci TinyURL.

✅ **URL confirmée (testée dans un navigateur) :**
```
https://getsquire.com/booking/book/royalmk-gatineau
```
C'est la destination de **tous** les boutons « Réserver » du site, sans exception. Les liens par barbier (`.../barber/<nom>`) ne sont plus utilisés.

### Intégration

**Ne pas mettre Squire dans un iframe.** Les widgets de réservation en iframe cassent souvent sur mobile, bloquent le défilement et coûtent 1 à 2 secondes de chargement.

Faire un **lien sortant** depuis chaque bouton.

❌ **Squire ne permet pas de présélectionner un service par l'URL** (vérifié : l'URL ne change pas selon le service). Tous les boutons mènent donc à la même page, et **le visiteur doit retrouver son service lui-même** dans la liste Squire.

Deux conséquences directes :

1. **Les libellés doivent être identiques au caractère près** entre le site et Squire. C'est le point de la section 4.4, et il devient le plus important du projet : quelqu'un qui a cliqué « Taillage de Barbe » cherche ces mots exacts à l'écran suivant. S'il lit autre chose, il hésite.
2. **Le bouton nomme le service** : « Réserver — Taillage de Barbe », pas « Réserver ». Le visiteur garde le mot en tête et le retrouve dans la liste.

### Le point délicat : mesurer les réservations

La confirmation se passe **sur le domaine de Squire**, pas sur le nôtre. On ne peut donc pas y déclencher notre balise de conversion. Deux niveaux :

- **Ce qu'on peut mesurer sans rien demander** : le clic sur « Réserver » (conversion indirecte), le clic sur le numéro, le clic sur « Itinéraire ».
- Comme l'URL Squire ne porte aucun paramètre de service, l'événement `clic_service` sur notre site est **la seule source** qui dira quel service attire le trafic. À ne pas négliger : c'est lui qui guidera les groupes d'annonces de la phase 2.
- **Ce qui serait mieux** : vérifier si Squire permet d'ajouter une balise Google Ads ou un webhook sur la confirmation. À demander à leur support. Sans ça, on optimise sur le clic, ce qui est acceptable mais moins précis.

À noter dans la section 9.

---

## 3. Arborescence

### Phase 1 — le lancement
```
/              Accueil FR
/en            Accueil EN (miroir complet)
```

Deux pages, c'est tout. Un salon avec 8 services n'a pas besoin de 12 pages pour commencer, et chaque page en plus est une page à maintenir en deux langues.

### ✅ Phase 2 — faite (01/10/2026)

Le client a demandé les pages de service tout de suite, avant les données Ads.
**Huit services, seize pages**, plus deux index — toutes statiques :

```
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

Le risque de cette phase était la **page mince** : une page par service qui ne
dit rien de plus que son prix ne sert ni le visiteur ni le référencement.
Chaque page porte donc un texte d'introduction, ce que la séance comprend, un
« bon à savoir », le prix et la durée, les suggestions de services et le bloc
d'adresse — assez pour tenir debout seule.

Trois pages restent sobres en attendant des réponses : rasage à l'ancienne,
épilation faciale et forfait VIP. Voir les questions ouvertes.

### Correspondance annonce → page

Le visiteur doit retrouver dans la page les mots exacts de l'annonce sur laquelle il a cliqué. C'est ce que Google appelle la pertinence, et ça fait baisser le CPC.

| Groupe | Mots-clés | Page de destination |
|---|---|---|
| GA1 Barbier | barbier gatineau, barbershop gatineau | `/` |
| GA2 Coupe homme | coupe cheveux homme, coiffeur homme gatineau | `/services/coupe-de-cheveux` |
| GA3 Barbe | taillage de barbe, rasage à l'ancienne | `/services/taillage-de-barbe` · `/services/rasage-a-l-ancienne` |
| GA4 Enfant | coupe enfant gatineau | `/services/coupe-pour-enfant` |
| GA5 VIP | forfait barbier gatineau | `/services/forfait-vip` |
| GA6 Anglais | barber gatineau, walk in barber | `/en` et les `/en/services/…` |
| GA7 Marque | barbier royalmk | `/` |

Les mots-clés « sans rendez-vous » et « barbier ouvert dimanche » restent sur
`/` : ce sont des recherches sur le salon, pas sur un service.

---

## 4. Structure de la page d'accueil

Dix blocs, dans cet ordre. Pour chacun : le contenu, l'animation, le rôle.

### 4.1 Barre de navigation (fixe)
Logo · Services · Galerie · Nous trouver · FR/EN · **Réserver** (bouton plein)
Le numéro de téléphone visible dès le desktop.
*Animation :* fond transparent au départ, devient opaque avec un flou au défilement. Discret, standard, efficace.

### 4.2 Hero — le moment visuel
C'est ici que va l'effort d'animation. Contenu :
- Titre : **« Barbier à Gatineau — ouvert 7 jours sur 7 »** (le mot-clé n°1 dans le H1, pas par SEO mécanique mais parce que c'est exactement ce que le visiteur a tapé)
- Sous-titre : coupe 25 $ · sans rendez-vous · boul. Saint-Joseph, secteur Hull
- Deux actions : **Réserver** (principale) et **(819) 318-0861** (secondaire)
- **★ 4,9 · 103 avis Google**, juste sous les boutons — la preuve sociale au moment du clic
- Reprise du slogan existant : « Adoptez le style que vous méritez »

*Hauteur :* ne pas prendre tout l'écran. Laisser apparaître le haut du bloc suivant, pour signaler qu'il y a une suite.

### 4.3 Bandeau de réassurance
Quatre éléments sur une ligne, juste sous le hero :

**★ 4,9 · 103 avis Google** · **Ouvert 7 j/7** · **Sans rendez-vous** · **Coupe 25 $**

*Animation :* apparition décalée, 60 ms entre chaque. Rien de plus.

### 4.4 Services et prix
Le bloc le plus consulté de la page. Les 8 services, prix visibles, **sans avoir à cliquer**.

✅ **Relevé dans Squire — source de vérité. Reprendre ces noms exactement.**

| Service (nom officiel Squire) | Durée | Prix |
|---|---|---|
| Coupe de Cheveux | 30 min | 25 $ |
| Coupe pour Enfant | 30 min | 20 $ |
| Coupe + Barbe | 30 min | 36 $ |
| Taillage de Barbe | 30 min | 19 $ |
| Rasage à l'ancienne | 30 min | 25 $ |
| Épilation Faciale | 30 min | 10 $ |
| Shampooing | 15 min | 4 $ |
| **Forfait VIP** | **1 h** | **55 $** |

**Les prix de l'ancien site sont tous exacts, Forfait VIP compris.** Rien à corriger côté tarifs.

**Afficher les durées à côté des prix.** Elles lèvent une objection muette : « est-ce que j'ai le temps ? ». Tout est à 30 minutes, sauf le shampooing (15 min) et le VIP (1 h) — c'est simple à montrer.

#### Forfait VIP — 55 $ confirmé

Le site affiche **55 $**, et montre l'économie : 55 $ au lieu de 65 $ à la pièce (25 + 19 + 4 + soins).

⏳ **Un point à vérifier :** la page Squire affichait la durée sans le prix. Si c'est toujours le cas, le client voit 55 $ sur le site puis aucun prix au moment de réserver — un doute juste avant de confirmer. Le prix doit apparaître **aux deux endroits**.

#### Le nom des services doit être identique partout

Le visiteur qui clique « Taillage de Barbe » sur le site doit retrouver **ces mots-là** dans Squire. Un libellé qui change entre les deux étapes donne l'impression de s'être trompé de page.

Trois écarts à corriger dans mes documents, où Squire a raison :
- **Taillage** de Barbe, pas « taille de barbe »
- **Épilation Faciale**, pas « épilation visage »
- **Shampooing**, pas « shampoing »

Chaque ligne est cliquable et mène à Squire.
*Animation :* le prix compte de 0 à sa valeur quand la ligne entre à l'écran. Court, 400 ms, et seulement une fois.

### 4.5 Forfait VIP
Un bloc à part, traité comme l'offre vedette. 55 $ pour coupe + barbe + shampoing + soins, contre 65 $ à la pièce : montrer l'écart.
*Animation :* une légère élévation au survol. Pas plus — c'est un bloc de vente, pas une démo.

### 4.6 Galerie
Les vraies coupes du salon. Voir section 6 sur les visuels.
*Animation :* grille en maçonnerie, apparition au défilement, agrandissement au clic.

> ❌ **Pas de bloc équipe** (décision du 01/10/2026). Les barbiers ne sont pas présentés nominativement sur le site.
> Conséquence : la confiance doit venir d'ailleurs. Les deux blocs qui la portent deviennent donc **la galerie (4.6) et les avis (4.7)**. Soigner ces deux-là en priorité.

### 4.7 Avis — ⭐ l'atout principal du site

**4,9 sur 103 avis.** C'est beaucoup pour un barbier de quartier, et c'est le meilleur argument du dossier : ni le prix ni les heures ne convainquent aussi bien que cent clients satisfaits.

Donc on ne le traite pas comme un bloc de bas de page :
- **La note monte dans le hero**, à côté du bouton Réserver. La preuve sociale au moment de la décision.
- **Le chiffre complet** : « 4,9 ★ sur 103 avis Google ». Le nombre compte autant que la note — 4,9 sur 5 avis ne vaut rien, 4,9 sur 103 est un verdict.
- **Cinq à six avis** repris mot pour mot, avec le prénom et la date, choisis pour couvrir des services différents (coupe, barbe, enfant) et mentionner le travail concret, pas juste « super service ».
- **Lien vers la fiche complète** : `https://maps.google.com/?cid=9676733797717479798`

*Animation :* carrousel sur mobile, grille fixe sur desktop. **Pas de défilement automatique** — ça empêche de lire et ça agace.

#### ⚠️ Un piège technique à éviter

Ne **pas** baliser cette note en `aggregateRating` dans les données structurées. Les règles de Google interdisent de marquer ses propres avis sur son propre site, et plus encore des avis récupérés d'une autre plateforme — Google en l'occurrence. Ça ne produit aucune étoile dans les résultats, et ça expose à une pénalité manuelle.

**Afficher la note à l'écran : oui, sans réserve. La baliser : non.** Les étoiles dans les résultats de recherche viennent de la fiche d'établissement, pas du code du site.

### 4.8 Nous trouver
- Adresse : 331 boul. Saint-Joseph, Gatineau (QC) — **secteur Hull**
- Tableau des heures, **avec la ligne du jour mise en évidence** et un état « ouvert / fermé » calculé à l'affichage
- Bouton **Itinéraire** vers Google Maps
- Repères de quartier : « à cinq minutes du centre-ville de Hull »

⚠️ **Pas de carte en iframe.** Google Maps en iframe pèse lourd et dégrade le LCP. Mettre une **image statique** de la carte, cliquable, qui ouvre Maps.

### 4.9 Pied de page
Adresse, téléphone, heures, lien Squire, mentions. Les coordonnées écrites **en texte sélectionnable**, pas en image.

### 4.10 Barre d'action fixe (mobile uniquement)
Collée en bas, visible en permanence après le hero : **Appeler** | **Réserver**.
C'est, de loin, l'élément qui rapporte le plus sur un site de commerce local. À prévoir dès le premier jour.

---

## 5. Animations — trois niveaux

### Niveau 1 — indispensables, quasi gratuites
À faire dans tous les cas. Coût en performance : négligeable.
- Barre de navigation qui se solidifie au défilement
- Apparitions au défilement (décalage de 60–80 ms, translation de 20 px, une seule fois)
- États de survol sur tout ce qui est cliquable
- Défilement fluide vers les ancres
- Transitions d'ouverture du menu mobile

### Niveau 2 — le « wow », à budget maîtrisé
Choisir **deux ou trois** de cette liste, pas toutes. Une page qui bouge partout ne met rien en valeur.

- **Boucle vidéo dans le hero** — 4 à 6 secondes, muette, en lecture automatique. Image d'affiche affichée d'abord, vidéo chargée après. **Sur mobile : image fixe seulement**, pas de vidéo.
- **Le dégradé comme motif** — le « fade » est à la fois la coupe emblématique et un dégradé visuel. En faire le langage graphique du site : séparateurs en dégradé, titres qui se fondent, passages de section. C'est un lien que seul un barbier peut revendiquer, et ça évite le décor interchangeable.
- **Révélation au défilement de la galerie** — les images arrivent en décalé, légèrement agrandies qui se posent.
- **Compteur de prix** — voir 4.4.
- **Trait de rasoir** — un filet fin qui traverse l'écran entre deux sections, comme un coup de tondeuse. Un seul, une seule fois, sinon ça devient un gadget.
- **Enseigne de barbier** — l'hélice rouge et blanche en spirale lente, comme élément de décor dans un coin. Le symbole le plus reconnaissable du métier.

### Niveau 3 — à éviter, ou desktop seulement
- Défilement détourné (le site qui prend le contrôle du défilement) — **non.** Ça casse la lecture sur mobile et fait fuir.
- WebGL, scènes 3D, particules — coût de chargement sans rapport avec le gain.
- Curseur personnalisé — invisible sur mobile, donc 75 % du trafic ne le voit pas.
- Animation d'entrée bloquante (« splash screen ») — **non.** Sur du trafic payant, c'est une seconde achetée et jetée.

### Garde-fous
| Mesure | Limite |
|---|---|
| LCP (mobile, 4G) | < 2,5 s |
| Hero complet | < 1,5 Mo |
| Vidéo hero | < 1,2 Mo, muette, `preload="none"` |
| JavaScript d'animation | < 40 Ko compressé |
| Décalage de mise en page (CLS) | < 0,1 |

Toute animation déclenchée au défilement utilise l'observation d'intersection, pas l'écoute du défilement. Et chaque bloc est **lisible à l'arrêt** : rien ne reste invisible en attendant une animation. Un visiteur qui arrive avec JavaScript lent doit voir une page complète, pas une page vide.

---

## 6. Visuels — ce qui est vrai, ce qui est généré

Tu as **quelques photos existantes**. Voici comment les faire suffire.

### La règle
> Les photos de l'IA servent à l'**ambiance** : textures, fonds, matières, abstractions.
> Elles ne servent **jamais** à montrer le salon, l'équipe ou les coupes.

Ce n'est pas un scrupule technique. Montrer un intérieur de salon ou un résultat de coupe qui n'existe pas, c'est promettre autre chose que ce que le client va trouver sur place. Pour un commerce de quartier qui vit de sa réputation et de ses avis Google, c'est un très mauvais calcul. Et un visiteur repère presque toujours une photo trop parfaite.

### Usage légitime de l'IA (Higgsfield, ou `creative.generate` de Porter)
- Fonds texturés : cuir, laiton brossé, carrelage, bois sombre
- Motifs de dégradé pour les séparateurs
- Éléments décoratifs abstraits
- Plans d'ambiance très serrés et non identifiables : lame, mousse, serviette chaude, peigne
- Animation de photos fixes existantes (image → vidéo) pour un léger mouvement de caméra dans le hero — à partir d'**une vraie photo du salon**

### À photographier avec un téléphone (une heure suffit)
Un téléphone récent près d'une fenêtre donne un bon résultat. Par ordre d'importance :

1. **La façade**, avec l'enseigne lisible — c'est ce qui aide le client à reconnaître l'endroit en arrivant
2. **La salle**, en large, à un moment propre et rangé
3. **Un fauteuil** de trois quarts, avec la lumière de côté
4. **6 à 8 coupes terminées**, de dos et de profil, même cadrage et même fond pour chaque — c'est la galerie, et **le bloc le plus convaincant du site**
5. **Les mains au travail** : la tondeuse dans un dégradé, le rasoir, la serviette chaude
6. **Deux ou trois clips de 5 secondes** : la tondeuse qui passe, la chaise qui pivote, la porte qui s'ouvre

> Pas de portraits de barbiers : il n'y a pas de bloc équipe (voir 4.6).
> Et sans compte Instagram à brancher, **cette séance est la seule source d'images réelles du site**. C'est pourquoi la galerie passe de 4-6 à 6-8 photos : elle doit porter seule la preuve du travail.

### Réseaux sociaux
❌ **Rien pour le moment** (décision du 01/10/2026).

L'ancien site n'avait que des icônes vides dans le pied de page : **les retirer** plutôt que de les laisser pointer dans le vide. Des icônes mortes donnent une impression d'abandon.

À garder pour plus tard : Instagram est l'endroit où ce métier montre son travail, et un compte alimenterait la galerie sans nouvelle séance photo. Concevoir le pied de page pour qu'un lien puisse s'y ajouter sans refonte.

---

## 7. Textes

### Les trois arguments, par ordre de force
1. **Ouvert 7 jours sur 7**, dimanche de 11 h à 19 h — rare, et c'est une recherche réelle
2. **Sans rendez-vous accepté** — la demande immédiate
3. **Coupe à 25 $, prix affichés** — une recherche anglophone entière tourne autour du prix abordable

### Principes
- Dire « **barbier** », pas « salon de coiffure ». C'est le mot que les clients tapent, et ça écarte d'emblée la clientèle féminine que la campagne ne cible pas.
- Français du Québec, pas de France.
- Les prix en chiffres, pas « à partir de ».
- La version anglaise est une **vraie traduction**, relue par quelqu'un de bilingue. Pas de traduction automatique : Gatineau est bilingue, et un anglais approximatif se voit immédiatement.
- Chaque bouton dit ce qu'il fait : « Réserver en ligne », pas « En savoir plus ».

### Titres principaux
- FR : « Barbier à Gatineau — ouvert 7 jours sur 7 »
- EN : « Barber in Gatineau — open 7 days a week »

---

## 8. Référencement local

Le site payant et le référencement gratuit se renforcent. À faire :

### ✅ La fiche Google existe

Confirmée le 01/10/2026. Données techniques tirées du lien Maps, à réutiliser dans le code :

| Donnée | Valeur |
|---|---|
| Nom sur la fiche | Barbier RoyalMK |
| Coordonnées GPS | `45.4412233, -75.7332243` |
| Identifiant de lieu (hex) | `0x6cdcc4a9acff30e5:0x864aaa1e96f79176` |
| CID | `9676733797717479798` |
| **Lien canonique de la fiche** | `https://maps.google.com/?cid=9676733797717479798` |

**Utiliser le lien CID partout**, et pas l'URL Maps longue. Celle qu'on m'a transmise pointe sur `google.fr`, contient des paramètres de session et change d'une visite à l'autre. Le lien CID est court, stable et sans domaine national.

Les coordonnées GPS servent à deux choses : le champ `geo` des données structurées, et l'image statique de la carte du bloc 4.8.

### À faire sur la fiche

- **Vérifier la catégorie principale** : « Barbier » (*Barber shop*), pas « Salon de coiffure ». C'est la catégorie qui décide dans quelles recherches locales le salon apparaît.
- **Heures exactes**, dimanche 11 h – 19 h compris. Une fiche qui dit « fermé » quand c'est ouvert fait perdre des clients.
- **Lien du site** à mettre à jour au lancement.
- **Bouton de réservation** : la fiche Google accepte un lien de rendez-vous. Y mettre l'URL Squire du salon.
- **Photos**, les mêmes que celles de la séance de la section 6.
- **Lien pour demander un avis** : dans l'interface Google Business Profile, la fonction « Demander des avis » fournit un lien court (`g.page/r/…`). À récupérer là plutôt que de le fabriquer — c'est le lien à envoyer aux clients après leur passage.

### Lier la fiche à Google Ads

Associer la fiche au compte Ads active les **extensions de lieu** : l'annonce affiche alors l'adresse, la distance et un bouton d'itinéraire. Sur des recherches comme « barbier near me » (170/mois), c'est ce qui fait la différence entre une annonce et une annonce qu'on suit.

**Données structurées** `HairSalon` (sous-type de `LocalBusiness`) : nom, adresse, téléphone, `geo` avec les coordonnées ci-dessus, heures, fourchette de prix (4–55 $), liste des services avec leurs prix, zone desservie, et `sameAs` vers le lien CID.

**Cohérence des coordonnées** — nom, adresse et téléphone écrits **à l'identique** sur le site, la fiche Google, Squire et les annuaires. Le nom de référence est celui de la fiche : **Barbier RoyalMK**. Toute variante (« Royal MK », « Barbier Royal ») affaiblit le signal local.

**Balises par page** — titre et description reprenant les mots-clés validés de la section 2 de [mots-cles.md](mots-cles.md).

**`hreflang`** entre `/` et `/en`, pour que Google serve la bonne langue.

**Le domaine.** `barbierroyalmk.ca` a de l'historique et contient les deux mots-clés de marque. **À conserver.** Si le nouveau site passe sur un autre domaine, faire des redirections permanentes page par page.

---

## 9. Suivi des conversions — à ne pas remettre à plus tard

Sans ça, la campagne dépense sans savoir ce qui marche. À installer **avant** le premier clic payant.

### Les événements à mesurer
| Événement | Déclencheur | Valeur |
|---|---|---|
| `clic_reservation` | Clic vers Squire | **Conversion principale** |
| `clic_telephone` | Clic sur un lien `tel:` | **Conversion principale** |
| `clic_itineraire` | Clic vers Google Maps | Secondaire |
| `vue_services` | Bloc des prix atteint | Mesure d'intérêt |
| `clic_service` | Clic sur une ligne de service | Dit quel service attire |

### Mise en place
- Google Analytics 4 avec un identifiant de mesure distinct par environnement
- Marquage automatique des liens entre le site et Squire, pour ne pas perdre la source du visiteur
- **Importer les événements comme conversions dans Google Ads** — une conversion dans GA4 n'est pas automatiquement utilisable par Ads
- Consentement aux cookies : le Québec applique la **Loi 25**. Un bandeau de consentement est requis, et le mode consentement de Google doit être configuré.

### À vérifier auprès de Squire
Est-ce qu'ils permettent d'ajouter une balise de conversion ou un webhook sur la page de confirmation ? Si oui, on mesure les **vraies réservations**, pas seulement les clics. Ça change la qualité de l'optimisation. Question à poser à leur support avant le lancement.

---

## 10. Direction artistique

Une piste, à valider.

**L'idée :** le **dégradé** comme système graphique. C'est la coupe signature du métier et un outil visuel en même temps — un lien que seul un barbier peut revendiquer. Les séparateurs, les passages de section et les titres l'utilisent.

**Palette :** encre très sombre en fond, **laiton** en accent (le métal des outils et des enseignes anciennes), blanc os pour le texte. Le rouge de l'enseigne de barbier réservé à un seul élément, en touche.

**Typographie :** un display condensé et lourd pour les titres, dans l'esprit des enseignes peintes à la main. Un caractère neutre pour le texte courant. Et un **monospace pour les prix et les heures**, qui donne l'allure d'un tableau de prix affiché au mur et aligne les chiffres.

**Ce qu'il faut éviter :** le dégradé violet-bleu sur fond blanc, le crème avec serif et accent terracotta, le noir avec un vert acide, les cartes toutes arrondies avec la même ombre, les emojis comme puces de section. Ce sont les tics visuels qui font « site généré ».

---

## 11. Étapes

| Étape | Contenu | Résultat |
|---|---|---|
| **1. Préparation** | ~~URL Squire~~ ✅ · ~~prix et durées~~ ✅ · vérifier l'affichage du prix VIP dans Squire · séance photo · ~~fiche Google~~ ✅ (vérifier sa catégorie) · lier la fiche à Google Ads · décider du domaine | Tout le contenu réel en main |
| **2. Fondations** | ✅ **Fait** — projet Next.js dans [site/](site/), système de design, FR + EN, textes en place | Deux pages statiques, build propre |
| **3. Performance** | ✅ Données structurées, `hreflang`, image optimisée, pas d'iframe · ⏳ mesurer le LCP en ligne | 111 ko de JS au premier chargement |
| **4. Animations** | ✅ Séquence d'ouverture du hero, lignes de tarif réactives, état « ouvert » en direct | Volontairement une seule séquence, pas de fondu par section |
| **5. Mesure** | GA4, événements, import dans Ads, bandeau de consentement | Campagne prête à être suivie |
| **6. Vérification** | Test sur vrai téléphone en 4G · parcours de réservation complet jusqu'à la confirmation Squire · relecture de l'anglais · lecture au clavier | Prêt |
| **7. Lancement** | Mise en ligne, redirections, puis **seulement ensuite** activer la campagne | — |

**L'ordre compte.** Le contenu avant le design, le design avant l'animation, l'animation après la mesure de performance. Et la campagne Ads s'allume **en dernier**, quand le suivi fonctionne — pas avant.

---

## 12. Questions ouvertes

- [x] **URL Squire du salon** — `getsquire.com/booking/book/royalmk-gatineau` ✅ confirmée
- [x] **Prix et durées** — ✅ relevés dans Squire, prix de l'ancien site confirmés
- [x] **Prix du Forfait VIP** — ✅ 55 $
- [ ] **Affichage du prix VIP dans Squire** — visible sur la page de réservation, ou toujours vide ?
- [x] **Liens par service** — ❌ non, Squire ne le permet pas. Tous les boutons mènent à la page du salon
- [ ] **Suivi de conversion Squire** — balise ou webhook possible sur la confirmation ?
- [x] **Bloc équipe** — ❌ écarté
- [x] **Réseaux sociaux** — ❌ rien pour le moment, retirer les icônes vides du pied de page
- [ ] **Domaine** — on garde `barbierroyalmk.ca` ?
- [ ] **Rasage traditionnel** — serviette chaude ? rasage de la tête ? (question restée ouverte côté mots-clés)
- [x] **Fiche Google** — ✅ existe. CID `9676733797717479798`, GPS `45.4412233, -75.7332243`
- [x] **Note et nombre d'avis** — ✅ **4,9 sur 103 avis**. Mis en avant : hero + bandeau + bloc dédié
- [ ] **Catégorie de la fiche** — « Barbier » et non « Salon de coiffure » ?

---

## Annexe — Higgsfield

Higgsfield **n'est pas visible dans cette session**. Les serveurs MCP actifs ici sont Claude Docs, Google Drive, Porter Metrics et Semrush. Un serveur branché après le démarrage n'apparaît qu'au **redémarrage de la session** — à faire avant de vouloir l'utiliser.

En attendant, **Porter Metrics** offre les mêmes usages : `creative.generate` (images haute définition, image → vidéo, clips animés), `creative.inline_asset` (image en `data:` URI, utile pour les pages rendues ici), `audio.text_to_speech` et `audio.sound_effects_url`.

Dans les deux cas, la règle de la section 6 tient : l'IA pour l'ambiance, l'appareil photo pour le salon.
