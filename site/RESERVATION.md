# Réservation en ligne

La réservation par créneaux se fait sur le site et s'écrit directement dans
le Google Agenda du salon. Il n'y a ni paiement en ligne ni base de données :
l'agenda est la seule source de vérité.

- `/reserver` et `/en/book` : choix du service, du jour et de l'heure, puis des coordonnées.
- `/reserver/annuler` et `/en/book/cancel` : annulation par le lien reçu, jusqu'à 2 h avant le rendez-vous.
- `?service=` préchoisit un service, par son identifiant ou par l'adresse de sa page :
  `/reserver?service=coupe-et-barbe`, `/en/book?service=vip-package`.

## Essayer sans rien configurer

```bash
npm run dev            # http://localhost:3000/reserver
```

Sans identifiants Google, et hors production, le site utilise un **agenda de
démonstration** : il est prérempli et réinitialisé à chaque redémarrage. Un
bandeau le signale, et aucun courriel n'est envoyé.

Une fois les identifiants Google dans `.env.local`, le site écrit dans le
**vrai** agenda. Pour essayer ou tester sans y toucher, ajouter
`BOOKING_CALENDAR=demo` : cela force l'agenda de démonstration.

## Mise en place (une seule fois)

### 1. Google Agenda

1. Dans [Google Cloud Console](https://console.cloud.google.com/), créer un projet, puis activer **Google Calendar API**.
2. Aller dans **IAM et administration → Comptes de service** et créer un compte de service. Aucun rôle n'est nécessaire.
3. Ouvrir ce compte, aller dans **Clés → Ajouter une clé → JSON**. Le fichier téléchargé contient `client_email` et `private_key`.
4. Dans Google Agenda, ouvrir **Paramètres** de l'agenda du salon, puis **Partager avec des personnes en particulier**. Ajouter l'adresse `client_email` avec le droit **Apporter des modifications aux événements**.
5. Dans les mêmes paramètres, copier l'**ID de l'agenda** (section « Intégrer l'agenda »).

### 2. Variables d'environnement

Les poser dans Vercel. Le modèle est dans `.env.example`.

| Variable | Rôle |
| --- | --- |
| `GOOGLE_CALENDAR_ID` | ID de l'agenda du salon |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` du fichier JSON |
| `GOOGLE_PRIVATE_KEY` | `private_key` du fichier JSON, avec ses `\n` |
| `BOOKING_SECRET` | Signe les liens d'annulation (32 caractères au moins) |
| `RESEND_API_KEY`, `BOOKING_FROM_EMAIL` | Courriels de confirmation (facultatif) |
| `SALON_NOTIFY_EMAIL` | Copie de chaque réservation au salon, et alertes de panne (facultatif, recommandé) |
En production, si une variable Google ou `BOOKING_SECRET` manque, la page
affiche « réservation momentanément indisponible » avec le numéro du salon.
Elle ne plante pas.

### 3. Courriels (facultatif, recommandé)

Créer un compte [Resend](https://resend.com), vérifier le domaine `royalmk.ca`
(trois enregistrements DNS), puis créer une clé d'API. Le client reçoit :
- la confirmation, avec le fichier d'agenda (.ics) et le bouton d'annulation ;
- un courriel quand il annule.

Sans Resend, l'écran de confirmation donne déjà le lien d'agenda et le lien
d'annulation.

### 4. Surveillance

**Alerte de panne.** Si Google Agenda ne répond plus, le salon reçoit un
courriel à `SALON_NOTIFY_EMAIL` (un au plus par 30 minutes). Pour être prévenu même sans visiteur, brancher un service de
surveillance gratuit (par exemple UptimeRobot) sur
`https://VOTRE-DOMAINE/api/reservation/sante`, toutes les 5 minutes. Elle
répond 200 si l'agenda fonctionne, 503 sinon.

### 5. Mesure dans Google Tag Manager

Le site envoie ces événements dans le `dataLayer` :

| Événement | Quand | Données |
| --- | --- | --- |
| `booking_service_selected` | service choisi | `service_id`, `value` |
| `booking_slot_selected` | heure choisie | `booking_date`, `booking_time` |
| **`booking_confirmed`** | **rendez-vous écrit dans l'agenda** | `transaction_id`, `value`, `currency` (CAD), `service_id`, `service_name`, `days_ahead`, `user_data` |

`booking_confirmed` est **la** conversion. Il part une seule fois par rendez-vous, même si la page est rechargée.

Réglages dans GTM :
1. **Déclencheur** : Événement personnalisé, nom `booking_confirmed`.
2. **Variables de couche de données** : `value`, `transaction_id`, `service_id`, `user_data.email`, `user_data.phone_number`.
3. **Balise d'événement GA4** `booking_confirmed`, avec `value`, `currency`, `transaction_id`. Dans GA4, la marquer comme **événement clé**.
4. **Balise de conversion Google Ads** : valeur `{{value}}`, devise CAD, ID de transaction `{{transaction_id}}`. Activer les **conversions améliorées** avec une variable « Données fournies par l'utilisateur » qui lit `user_data.email` et `user_data.phone_number`. GTM les chiffre avant l'envoi.
5. Dans Google Ads, mettre cette conversion en **principale**. Passer `booking_click` et `phone_call_click` en **secondaires**.

## Au quotidien, pour le salon

Tout se gère dans Google Agenda, comme d'habitude :

- **Bloquer un moment** (pause, rendez-vous perso) : créer un événement normal. Tout événement « Occupé » ferme les créneaux qu'il couvre.
- **Laisser une note sans bloquer** : régler l'événement sur **Disponible**.
- **Fermer une journée** : créer un événement **Toute la journée** intitulé *Fermé*, *Fermeture*, *Congé*, *Vacances* ou *Férié* (ou *Closed*, *Day off*, *Holiday*). Un événement « toute la journée » avec un autre titre ne bloque rien, sauf s'il est réglé sur *Occupé*.
- **Rendez-vous du site** : titre `Prénom Nom — Service`, avec le téléphone, le courriel et la note du client dans la description.
- **Annuler à la place du client** : supprimer l'événement et **prévenir le client**. Google ne l'avertit pas.

## Règles réglables

Elles sont dans `lib/booking/config.ts`. Les heures d'ouverture, les services, les prix et les durées restent dans `lib/business.ts`.

| Règle | Valeur |
| --- | --- |
| Pas entre deux créneaux | 30 min |
| Délai minimal avant un rendez-vous | 60 min |
| Horizon de réservation | 30 jours |
| Temps libre après chaque rendez-vous | 0 min |
| Rendez-vous à venir par téléphone | 2 au plus |
| Annulation en ligne | jusqu'à 2 h avant |

## Robustesse

- **Double réservation** : le créneau est revérifié dans l'agenda juste avant l'écriture. Après l'écriture, l'agenda est relu : si deux clients ont validé la même place à la même seconde, seul le premier enregistré garde le rendez-vous. Testé avec 5 clients simultanés sur le même créneau : 1 réservé, 4 refusés.
- **Changements d'heure** : toutes les heures sont calculées dans le fuseau `America/Toronto`.
- **Abus** : champ piège invisible, envoi trop rapide refusé, limite par adresse IP, 2 rendez-vous à venir au plus par numéro.
- **Annulation** : lien signé, impossible à deviner. L'annulation demande un clic de confirmation, pour que les aperçus de liens des messageries n'annulent rien.
- **Panne** : si Google Agenda ne répond pas, le client voit le numéro du salon, jamais une page d'erreur, et le salon est prévenu par courriel.

## Limites connues

- Pas de rappel envoyé par le site. Le client a un rappel 2 h avant grâce au fichier .ics, s'il l'ajoute à son agenda.
- La limite par adresse IP vit dans chaque instance du serveur. C'est un frein, pas une barrière. La vraie limite est celle par numéro, vérifiée dans l'agenda.
