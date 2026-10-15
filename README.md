# La Dernière Trompette — site web

Site officiel de la coopérative **La Dernière Trompette** : vitrine institutionnelle,
catalogue de produits, prise de commande, formations, actualités et espace
d'administration.

---

## Sommaire

1. [Ce que fait le site](#1-ce-que-fait-le-site)
2. [Technologies](#2-technologies)
3. [Installation](#3-installation)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Base de données](#5-base-de-données)
6. [Créer le compte administrateur](#6-créer-le-compte-administrateur)
7. [Lancer le projet](#7-lancer-le-projet)
8. [Guide d'utilisation de l'administration](#8-guide-dutilisation-de-ladministration)
9. [Gestion des images](#9-gestion-des-images)
10. [Déploiement](#10-déploiement)
11. [Sauvegardes](#11-sauvegardes)
12. [Tests](#12-tests)
13. [Structure du projet](#13-structure-du-projet)
14. [Décisions techniques](#14-décisions-techniques)
15. [Ajouter un moyen de paiement](#15-ajouter-un-moyen-de-paiement)
16. [Informations restant à fournir par le client](#16-informations-restant-à-fournir-par-le-client)

---

## 1. Ce que fait le site

| Espace | Adresse | Rôle |
| --- | --- | --- |
| Site public | `/` | Présentation, catalogue, formations, actualités, contact |
| Boutique | `/produits`, `/panier`, `/commande` | Catalogue, panier, prise de commande |
| Administration | `/admin` | Produits, commandes, actualités, formations, messages, paramètres |

**Le contenu se gère entièrement depuis `/admin`.** Ajouter un produit, publier une
actualité, changer un prix ou corriger un numéro de téléphone ne demande
aucune modification du code ni redéploiement.

---

## 2. Technologies

| Couche | Choix | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16 |
| Langage | TypeScript (mode strict) | 5 |
| Interface | Tailwind CSS | 4 |
| Base de données | PostgreSQL | 17 |
| Accès aux données | Prisma + adaptateur `pg` | 7 |
| Authentification | Session maison (JWT `jose` + `bcryptjs`) | — |
| Validation | Zod | 4 |
| Icônes | lucide-react | — |
| Images (production) | Cloudinary *(optionnel)* | — |
| Emails | Resend *(optionnel)* | — |

---

## 3. Installation

**Prérequis :** Node.js 20 ou supérieur, et un accès à une base PostgreSQL 14+.

```bash
git clone <url-du-depot>
cd dernieretrompette
npm install
cp .env.example .env      # puis renseigner les valeurs (section 4)
```

`npm install` déclenche automatiquement `prisma generate`, qui produit le client
d'accès à la base dans `src/generated/`. Ce dossier n'est pas versionné : il est
régénéré à chaque installation.

---

## 4. Variables d'environnement

Toutes les variables sont décrites dans **`.env.example`**. Résumé :

### Obligatoires

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL |
| `SESSION_SECRET` | Clé de signature des sessions admin — **32 caractères minimum** |

Générer un secret solide :

```bash
openssl rand -base64 48
```

> Changer `SESSION_SECRET` déconnecte instantanément tous les administrateurs.
> C'est d'ailleurs la procédure à appliquer en cas de compromission.

### Recommandées

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publique canonique, sans slash final. Utilisée par le sitemap, l'Open Graph et les données structurées. Déduite automatiquement sur Vercel. |

### Optionnelles

| Variable | Sans elle |
| --- | --- |
| `CLOUDINARY_*` | Les images sont écrites dans `public/uploads`. **Ne fonctionne pas en production** : voir section 9. |
| `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFY_EMAIL` | Aucune notification email n'est envoyée. Commandes et messages restent consultables dans `/admin`. |

Le site **démarre et fonctionne sans aucun compte tiers** : c'est volontaire, pour
qu'un développement local ne demande aucune inscription.

---

## 5. Base de données

### Première installation

```bash
npm run db:migrate      # crée les tables
npm run db:seed         # compte admin + catégories
```

Pour obtenir en plus des contenus de démonstration (utile pour montrer le site
avant que les vrais contenus n'existent) :

```bash
npm run db:seed -- --demo
```

> ⚠️ Le contenu de démonstration est clairement identifié : chaque champ à
> remplir porte la mention `[À COMPLÉTER]`. **Supprimez-le avant la mise en
> ligne**, ou n'utilisez jamais `--demo` en production.

### Commandes utiles

| Commande | Effet |
| --- | --- |
| `npm run db:migrate` | Crée une migration à partir du schéma et l'applique (développement) |
| `npm run db:deploy` | Applique les migrations existantes (production) |
| `npm run db:studio` | Ouvre Prisma Studio : interface graphique sur la base |
| `npm run db:reset` | **Efface tout** et rejoue les migrations (développement uniquement) |

### Modifier le schéma

1. Éditer `prisma/schema.prisma`
2. `npm run db:migrate` (un nom de migration est demandé)
3. Vérifier le SQL généré dans `prisma/migrations/`
4. Commiter le schéma **et** la migration

---

## 6. Créer le compte administrateur

Renseigner dans `.env` :

```env
SEED_ADMIN_EMAIL="votre.email@exemple.com"
SEED_ADMIN_PASSWORD="un-mot-de-passe-long-et-unique"
SEED_ADMIN_NAME="Votre nom"
```

Puis :

```bash
npm run db:seed
```

Le script est **idempotent** : relancé, il ne recrée ni n'écrase un compte
existant. Le mot de passe n'est jamais stocké en clair (bcrypt, coût 12).

Une fois le compte créé, **videz ces trois variables** du `.env`.

### Rôles

| Rôle | Droits |
| --- | --- |
| `ADMIN` | Tout, y compris les paramètres du site |
| `EDITOR` | Contenu uniquement : produits, actualités, formations, commandes |

Le rôle se change depuis Prisma Studio (`npm run db:studio` → table `users`).

---

## 7. Lancer le projet

```bash
npm run dev        # développement, http://localhost:3000
npm run build      # build de production
npm start          # sert le build de production
npm run typecheck  # vérification TypeScript
npm run lint       # ESLint
npm test           # typecheck + lint
```

---

## 8. Guide d'utilisation de l'administration

Connexion : **`/admin`** (ou le lien « Administration » en bas de chaque page).

### Tableau de bord

Affiche les commandes à traiter, les messages non lus, et surtout la liste
**« À compléter »** : coordonnées manquantes, catalogue vide, stockage d'images
non configuré. Cette liste disparaît d'elle-même au fur et à mesure des saisies.

### Produits

**Créer :** Produits → *Nouveau produit*. Seul le nom est obligatoire.

- **Prix laissé vide** → le produit s'affiche en « Prix sur demande ». C'est un
  état parfaitement valable : le visiteur peut toujours le mettre au panier ou
  commander par WhatsApp, et le montant sera confirmé par la coopérative.
- **Photos et formats de vente** s'ajoutent après la création, en bas de la
  fiche.
- **Formats de vente** (« Sachet 500 g », « Sac 25 kg ») : un format sans prix
  propre reprend automatiquement celui du produit.

**Publier / dépublier / signaler une rupture :** directement depuis la liste, en
cliquant sur les pastilles d'état. Aucun besoin d'ouvrir la fiche.

**Supprimer :** en bas de la fiche. Les commandes passées ne sont pas affectées —
elles conservent le nom et le prix du produit tels qu'ils étaient au moment de
l'achat.

### Commandes

Chaque commande possède **deux statuts indépendants** :

| Statut de commande | Statut de paiement |
| --- | --- |
| Nouvelle, Confirmée, En préparation, Expédiée, Livrée, Annulée | En attente, Payée, Remboursée, Échec |

Ils sont séparés parce qu'une commande peut très bien être livrée et encore
impayée — ou payée d'avance et pas encore expédiée.

Le détail d'une commande donne accès au téléphone du client, avec un bouton
**« Contacter le client sur WhatsApp »** pré-rempli avec la référence et la liste
des articles.

La **note interne** n'est jamais visible par le client.

### Actualités et formations

Créer → rédiger → cocher « Publier ». Tant que la case n'est pas cochée, le
contenu reste un brouillon invisible du public.

Le texte se saisit en **texte simple** : une ligne vide sépare deux paragraphes.
Il n'y a pas d'éditeur riche, volontairement (voir section 14).

Les demandes d'inscription à une formation apparaissent en bas de sa fiche.

### Messages

Les messages du formulaire de contact. Les non-lus sont mis en évidence. Le
bouton « Répondre par email » ouvre votre logiciel de messagerie avec le sujet
pré-rempli.

### Paramètres *(réservé au rôle ADMIN)*

Téléphone, WhatsApp, email, adresse, réseaux sociaux, textes d'accueil et de la
page « À propos ».

**Effet immédiat, sans redéploiement.** Deux points importants :

- Un champ **laissé vide** reprend la valeur par défaut du code.
- Les coordonnées non renseignées s'affichent en « À renseigner » sur le site,
  et les boutons correspondants (appel, WhatsApp) restent **masqués** tant
  qu'aucune valeur n'est saisie. Aucun numéro n'est jamais inventé.

Le **numéro WhatsApp** se saisit en chiffres uniquement, indicatif compris, sans
« + » ni espaces — par exemple `22901234567`.

---

## 9. Gestion des images

### Deux modes

| Contexte | Stockage |
| --- | --- |
| Développement local | `public/uploads/` (aucun compte requis) |
| **Production** | **Cloudinary — obligatoire** |

En production, le système de fichiers est en lecture seule et éphémère : les
images écrites sur disque disparaîtraient au premier redéploiement. Sans les
variables `CLOUDINARY_*`, l'envoi d'image échoue avec un message explicite, et
le tableau de bord affiche une alerte.

### Configurer Cloudinary

1. Créer un compte gratuit sur [cloudinary.com](https://cloudinary.com)
2. Copier *Cloud name*, *API Key* et *API Secret* depuis le tableau de bord
3. Les renseigner dans les variables d'environnement de production

### Contraintes appliquées

- Formats acceptés : **JPEG, PNG, WebP, AVIF**
- Taille maximale : **5 Mo**
- Le type réel du fichier est vérifié par sa **signature binaire**, pas par son
  extension ni par le type déclaré par le navigateur — un script renommé `.png`
  est rejeté.
- Le **texte alternatif est obligatoire** : c'est ce qui rend le catalogue
  utilisable par les lecteurs d'écran et correctement indexé.

Les images sont ensuite servies par l'optimiseur de Next.js : conversion en AVIF
ou WebP selon le navigateur, redimensionnement automatique, chargement différé.

### Photographies du site

Tant qu'aucune photo n'est fournie, le site affiche un **substitut graphique
assumé** (dégradé végétal et trame) plutôt qu'une image générée : on ne fait
jamais passer une illustration pour une photo authentique de la coopérative.

Dès qu'une photo est ajoutée, elle prend automatiquement sa place. Pour les
visuels non gérés par l'administration (hero, page « À propos »), déposer les
fichiers dans `public/images/` et renseigner le chemin dans le composant
concerné — chacun porte un commentaire indiquant précisément où.

---

## 10. Déploiement

### Solution recommandée : Vercel + Neon

Choisie pour trois raisons : offre gratuite suffisante pour démarrer, HTTPS et
CDN automatiques, aucun serveur à administrer.

#### Étape 1 — La base de données

1. Créer un projet sur [neon.tech](https://neon.tech)
2. Copier la chaîne **« Pooled connection »**
3. La conserver pour `DATABASE_URL`

#### Étape 2 — L'application

1. Pousser le dépôt sur GitHub
2. Sur [vercel.com](https://vercel.com) : *New Project* → importer le dépôt
3. Renseigner les variables d'environnement (section 4)
4. Déployer

#### Étape 3 — Initialiser la base de production

Depuis votre machine, avec le `DATABASE_URL` de production :

```bash
DATABASE_URL="<url-neon>" npm run db:deploy
DATABASE_URL="<url-neon>" npm run db:seed
```

> `db:deploy` (et non `db:migrate`) : il applique les migrations existantes sans
> jamais en générer ni proposer de réinitialisation.

#### Étape 4 — Le domaine

Vercel → *Settings* → *Domains*. Le certificat HTTPS est émis automatiquement.
Pensez à mettre à jour `NEXT_PUBLIC_SITE_URL` avec le domaine définitif, puis à
redéployer : le sitemap et les balises de partage en dépendent.

### Checklist avant mise en ligne

- [ ] `SESSION_SECRET` différent de celui de développement, 32 caractères minimum
- [ ] Variables `CLOUDINARY_*` renseignées
- [ ] Compte administrateur créé, variables `SEED_ADMIN_*` vidées
- [ ] `NEXT_PUBLIC_SITE_URL` pointe sur le domaine définitif
- [ ] Contenu de démonstration supprimé (aucun `[À COMPLÉTER]` visible)
- [ ] Coordonnées renseignées dans `/admin/parametres`
- [ ] Mentions légales et politique de confidentialité complétées et **validées**
- [ ] `/sitemap.xml` et `/robots.txt` accessibles et pointant sur le bon domaine

### Autre hébergement

Le projet est un Next.js standard : il tourne sur toute plateforme Node.js
(Railway, Render, VPS avec PM2, conteneur Docker). Deux exigences seulement :
Node 20+, et un stockage d'images externe (le disque local ne suffit que si la
plateforme offre un volume persistant).

---

## 11. Sauvegardes

| Donnée | Où | Sauvegarde |
| --- | --- | --- |
| Base de données | Neon | Restauration dans le temps incluse (*point-in-time recovery*). Vérifier la fenêtre offerte par le plan souscrit. |
| Images | Cloudinary | Conservées par le service |
| Code | GitHub | Le dépôt fait foi |

Export manuel de la base, recommandé avant toute opération sensible :

```bash
pg_dump "<DATABASE_URL>" > sauvegarde-$(date +%F).sql
```

Un export mensuel conservé hors ligne est une précaution raisonnable : il protège
contre ce qu'aucun hébergeur ne couvre — une suppression accidentelle de contenu.

---

## 12. Tests

```bash
npm test             # typecheck + lint (aucun service requis)

# Les suivants exigent que le site tourne et écrivent en base :
npm run test:e2e     # parcours visiteur complet
npm run test:admin   # parcours administrateur complet
npm run test:a11y    # audit d'accessibilité WCAG 2.1 AA
```

Les tests de bout en bout pilotent le **Chrome déjà installé sur la machine**
(via `puppeteer-core`), ce qui évite d'embarquer un navigateur de 150 Mo dans les
dépendances. Si l'exécutable n'est pas trouvé automatiquement, renseigner
`CHROME_PATH`.

Le port se règle avec `BASE_URL` :

```bash
BASE_URL=http://localhost:3001 npm run test:e2e
```

> ⚠️ `test:e2e` et `test:admin` **créent des données** (commandes, produits,
> actualités). À exécuter sur une base de développement, jamais en production.

Ce que les tests couvrent :

- **Visiteur** : navigation, recherche, panier persistant, commande complète,
  formulaire de contact, validation serveur, page 404, absence de débordement
  horizontal de 375 px à 1920 px.
- **Administrateur** : connexion et rejet d'un mot de passe erroné, cycle complet
  de création → modification → publication → dépublication d'un produit avec
  vérification sur le site public, actualités, formations, suivi de commande,
  paramètres, déconnexion.
- **Accessibilité** : 25 pages analysées avec axe-core, sur les critères
  WCAG 2.1 niveau AA, administration comprise.

---

## 13. Structure du projet

```
├── content/site.ts          Identité, coordonnées, textes par défaut
├── prisma/
│   ├── schema.prisma        Modèle de données
│   ├── migrations/          Historique des migrations
│   └── seed.ts              Initialisation de la base
├── src/
│   ├── app/
│   │   ├── (public)/        Pages publiques
│   │   ├── admin/           Espace d'administration
│   │   ├── sitemap.ts       Plan du site
│   │   └── robots.ts        Directives d'exploration
│   ├── components/
│   │   ├── ui/              Design system (boutons, champs, badges…)
│   │   ├── layout/          En-tête, pied de page, logo
│   │   ├── home/            Sections de la page d'accueil
│   │   ├── product/         Catalogue et fiche produit
│   │   ├── cart/            Panier et tunnel de commande
│   │   ├── admin/           Composants d'administration
│   │   └── shared/          Composants partagés
│   ├── lib/                 Base, auth, sessions, stockage, SEO, validation
│   ├── server/
│   │   ├── queries.ts       Lectures publiques
│   │   └── actions/         Écritures (Server Actions)
│   ├── context/cart.tsx     État du panier
│   └── proxy.ts             Protection de /admin (ex-middleware)
└── tests/                   Tests de bout en bout et accessibilité
```

**Où modifier quoi :**

| Pour changer… | Fichier |
| --- | --- |
| Les couleurs, la typographie, les espacements | `src/app/globals.css` |
| Les textes par défaut, les valeurs de repli | `content/site.ts` |
| La devise, les frais de livraison, les paiements | `content/site.ts` → `commerce` |
| Le menu de navigation | `content/site.ts` → `mainNav` |
| Le modèle de données | `prisma/schema.prisma` |
| Les champs éditables dans l'admin | `src/lib/settings-fields.ts` |

---

## 14. Décisions techniques

Les choix non évidents sont commentés dans le code, à l'endroit où ils
s'appliquent. Les principaux :

**Authentification maison plutôt qu'une bibliothèque.** Il y a un seul rôle
administrateur et aucune connexion par réseau social. Auth.js apporterait une
quinzaine de fichiers de configuration et une dépendance en version bêta pour
résoudre un problème que 120 lignes typées traitent mieux : bcrypt, un JWT signé
et un cookie `httpOnly`. Plus auditable, et sans mise à jour cassante.

**Les prix ne viennent jamais du navigateur.** Le panier vit dans
`localStorage`, mais au moment de la commande le client n'envoie que des
identifiants de produits et des quantités. Tous les prix sont relus en base côté
serveur. Un panier modifié dans les outils de développement ne peut donc pas
imposer son montant.

**Les commandes conservent un instantané.** `OrderItem` duplique volontairement
le nom et le prix du produit. C'est la seule duplication du schéma, et elle est
délibérée : une commande doit rester lisible à l'identique même si le produit
est ensuite renommé, re-tarifé ou supprimé.

**Un prix `null` n'est pas une erreur.** C'est l'état « prix sur demande », tout
à fait légitime tant que la tarification n'est pas arrêtée. Toute la chaîne le
gère explicitement, jusqu'aux données structurées où l'offre est alors omise
plutôt que publiée avec un prix nul.

**Texte simple plutôt qu'éditeur riche.** Le contenu éditorial est saisi en
texte brut ; une ligne vide sépare deux paragraphes. Un éditeur riche ajouterait
une dépendance lourde et une surface d'injection HTML, pour un besoin qui se
limite à des annonces de quelques paragraphes.

**Dégradation contrôlée en lecture.** Si PostgreSQL est momentanément
injoignable, les pages publiques affichent un état vide et l'incident est tracé,
plutôt que de renvoyer une erreur 500. Les écritures, elles, échouent
franchement : une commande qui ne s'enregistre pas doit le dire.

**Double barrière sur `/admin`.** `src/proxy.ts` bloque au bord du réseau, et
chaque page comme chaque Server Action revérifie la session. Les Server Actions
sont des points d'entrée HTTP autonomes : ne protéger que le routage laisserait
la porte ouverte.

### Note sur `npm audit`

`npm audit` signale des vulnérabilités dans la **CLI Prisma**, qui est une
dépendance de développement. Elles proviennent de `mysql2` (un pilote que ce
projet n'utilise pas — il tourne sur PostgreSQL) et de `deepmerge-ts` (analyse
de configuration). **Aucune n'atteint le code exécuté en production.** Elles
disparaîtront avec une mise à jour de Prisma.

---

## 15. Ajouter un moyen de paiement

Le paiement en ligne n'est **volontairement pas activé** : les informations
commerciales n'étaient pas arrêtées au moment du développement. L'architecture
est prête à l'accueillir sans refonte.

Une commande est enregistrée avec deux champs distincts : `paymentMethod` (le
moyen choisi) et `paymentStatus` (où en est le règlement).

### Activer un moyen déjà prévu

Dans `content/site.ts` → `commerce.paymentMethods`, passer `enabled` à `true`.
Le moyen apparaît alors dans le tunnel de commande. Le serveur revérifie cette
liste : un `<select>` falsifié ne permet pas de sélectionner un moyen désactivé.

### Brancher un paiement en ligne (Mobile Money, carte…)

1. Ajouter la valeur à l'énumération `PaymentMethod` dans `prisma/schema.prisma`,
   puis `npm run db:migrate` — ajouter une valeur d'énumération n'est pas une
   migration destructive.
2. L'activer dans `content/site.ts`.
3. Après la création de la commande dans `src/server/actions/orders.ts`,
   rediriger vers la page de paiement du prestataire au lieu de la confirmation.
4. Créer une route de rappel (*webhook*) qui bascule `paymentStatus` à `PAID`.

Rien d'autre à modifier : la commande, ses lignes et son suivi existent déjà.

---

## 16. Informations restant à fournir par le client

Chacune dispose d'un placeholder et se renseigne depuis `/admin/parametres` —
aucune ne bloque le fonctionnement du site, mais toutes sont attendues avant la
mise en ligne.

### Bloquant pour la mise en ligne

- [ ] Téléphone et **numéro WhatsApp** (format international)
- [ ] Email de contact officiel
- [ ] Adresse / localité d'implantation
- [ ] **Logo** (SVG ou PNG haute résolution) → `public/images/logo.svg`, puis
      remplacer le bloc indiqué dans `src/components/layout/logo.tsx`

### Bloquant pour la boutique

- [ ] Prix et unités de vente — sinon tous les produits restent « sur demande »
- [ ] Zone de livraison et frais éventuels
- [ ] Moyens de paiement réellement acceptés

### Nécessaire pour la crédibilité

- [ ] **Photographies réelles** de la coopérative, des produits, des ateliers
- [ ] Histoire de la coopérative, année de création, statut juridique
- [ ] Liste réelle des formations dispensées
- [ ] Comptes de réseaux sociaux
- [ ] Mentions légales : raison sociale, immatriculation, directeur de
      publication, hébergeur

> **Règle appliquée dans tout le projet :** aucune information concernant la
> coopérative n'a été inventée. Ni chiffre, ni date, ni certification, ni
> partenaire, ni capacité de production. Ce qui n'était pas fourni est marqué
> `[À RENSEIGNER]` et reste visible jusqu'à ce qu'il soit complété.
