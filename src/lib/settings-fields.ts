/**
 * Description des paramètres éditables — PARTAGÉE CLIENT / SERVEUR.
 *
 * Ce module ne doit JAMAIS importer Prisma, `server-only`, ni quoi que ce soit
 * qui touche la base. Le formulaire d'administration est un composant client :
 * s'il importait le module serveur, le bundler tenterait d'embarquer le driver
 * PostgreSQL dans le JavaScript du navigateur — et échouerait sur `tls`,
 * cassant toute l'application côté client.
 *
 * La liste sert deux rôles à la fois :
 *   - elle décrit les champs à afficher dans le formulaire ;
 *   - elle fait office de LISTE BLANCHE côté serveur : une clé absente d'ici
 *     est ignorée à l'enregistrement.
 */

export const SETTING_KEYS = [
  "site.legalName",
  "site.heroTitle",
  "site.heroSubtitle",
  "site.shortDescription",
  "site.metaDescription",
  "site.foundedYear",
  "contact.phone",
  "contact.phoneSecondary",
  "contact.whatsapp",
  "contact.email",
  "contact.address",
  "contact.city",
  "contact.country",
  "contact.hours",
  "contact.mapEmbedUrl",
  "social.facebook",
  "social.instagram",
  "social.linkedin",
  "social.youtube",
  "social.tiktok",
  "commerce.deliveryArea",
  "about.history",
  "about.vision",
  "about.mission",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export type SettingField = {
  key: SettingKey;
  label: string;
  group: string;
  hint?: string;
  multiline?: boolean;
};

/** Ordre d'apparition dans le formulaire, groupe par groupe. */
export const SETTING_FIELDS: ReadonlyArray<SettingField> = [
  {
    key: "contact.phone",
    label: "Téléphone principal",
    group: "Coordonnées",
    hint: "Format international, ex. +229 01 23 45 67",
  },
  { key: "contact.phoneSecondary", label: "Téléphone secondaire", group: "Coordonnées" },
  {
    key: "contact.whatsapp",
    label: "Numéro WhatsApp",
    group: "Coordonnées",
    hint: "Chiffres uniquement, indicatif compris, sans « + » ni espaces. Ex. 22901234567. Tant qu'il est vide, les boutons WhatsApp restent masqués.",
  },
  { key: "contact.email", label: "Email de contact", group: "Coordonnées" },
  { key: "contact.address", label: "Adresse", group: "Coordonnées", multiline: true },
  { key: "contact.city", label: "Ville", group: "Coordonnées" },
  { key: "contact.country", label: "Pays", group: "Coordonnées" },
  {
    key: "contact.hours",
    label: "Horaires",
    group: "Coordonnées",
    multiline: true,
    hint: "Une ligne par jour ou plage de jours.",
  },
  {
    key: "contact.mapEmbedUrl",
    label: "Lien de carte (Google Maps, format « embed »)",
    group: "Coordonnées",
    hint: "Laisser vide pour masquer la carte sur la page Contact.",
  },

  { key: "social.facebook", label: "Facebook", group: "Réseaux sociaux" },
  { key: "social.instagram", label: "Instagram", group: "Réseaux sociaux" },
  { key: "social.linkedin", label: "LinkedIn", group: "Réseaux sociaux" },
  { key: "social.youtube", label: "YouTube", group: "Réseaux sociaux" },
  { key: "social.tiktok", label: "TikTok", group: "Réseaux sociaux" },

  { key: "site.heroTitle", label: "Titre de la page d'accueil", group: "Page d'accueil" },
  {
    key: "site.heroSubtitle",
    label: "Texte d'accroche",
    group: "Page d'accueil",
    multiline: true,
  },
  {
    key: "site.shortDescription",
    label: "Description courte",
    group: "Page d'accueil",
    multiline: true,
    hint: "Reprise dans le pied de page et sur la page À propos.",
  },

  { key: "about.history", label: "Notre histoire", group: "Page À propos", multiline: true },
  { key: "about.vision", label: "Notre vision", group: "Page À propos", multiline: true },
  { key: "about.mission", label: "Notre mission", group: "Page À propos", multiline: true },

  { key: "site.legalName", label: "Raison sociale", group: "Informations légales" },
  { key: "site.foundedYear", label: "Année de création", group: "Informations légales" },
  {
    key: "site.metaDescription",
    label: "Description SEO du site",
    group: "Informations légales",
    multiline: true,
    hint: "150 à 160 caractères idéalement.",
  },
  {
    key: "commerce.deliveryArea",
    label: "Zone de livraison",
    group: "Informations légales",
    multiline: true,
  },
];
