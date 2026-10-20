/**
 * SOURCE DE VÉRITÉ DU CONTENU — LA DERNIÈRE TROMPETTE
 * ---------------------------------------------------
 * Ce fichier contient les VALEURS PAR DÉFAUT du site.
 *
 * Chaque valeur marquée `TODO` est un placeholder : elle s'affiche sur le site
 * sous la forme « [À RENSEIGNER] » et peut être remplacée de deux façons :
 *   1. en modifiant ce fichier (redéploiement nécessaire) ;
 *   2. depuis l'espace d'administration → /admin/parametres (effet immédiat,
 *      la valeur est alors stockée en base dans la table SiteSetting et
 *      prend le pas sur celle-ci).
 *
 * RÈGLE : ne jamais inventer une information réelle sur la coopérative.
 */

/** Marqueur des informations que le client doit encore fournir. */
export const TODO = "[À RENSEIGNER]" as const;

/** Vrai si une valeur est encore un placeholder non renseigné. */
export function isTodo(value: string | null | undefined): boolean {
  return !value || value.trim() === "" || value.trim() === TODO;
}

export const site = {
  name: "La Dernière Trompette",
  legalName: "Société coopérative des transformateurs du manioc et ses dérivés « La Dernière Trompette »", // relevé sur le logo officiel fourni
  tagline: "Coopérative agricole et agroalimentaire",
  /** Phrase d'accroche du hero — à ajuster avec le client. */
  heroTitle: "Du savoir-faire local, des produits authentiques",
  heroSubtitle:
    "La Dernière Trompette transforme et valorise les productions agricoles de nos terres : gari, tapioca, fonio et dérivés du manioc, préparés avec le soin d'une coopérative qui connaît chacun de ses producteurs.",
  shortDescription:
    "Coopérative de production, de transformation et de commercialisation de produits agricoles et agroalimentaires.",
  /** Description utilisée pour le SEO (150–160 caractères idéalement). */
  metaDescription:
    "La Dernière Trompette, coopérative agricole : gari, tapioca, fonio et dérivés du manioc transformés localement. Découvrez nos produits, nos formations et nos actualités.",
  foundedYear: TODO,
} as const;

export const contact = {
  phone: "+229 01 96 08 93 17", // fourni par le client
  phoneSecondary: "+229 01 95 45 80 77", // fourni par le client
  whatsapp: "2290196089317", // numéro principal, confirmé par le client (format wa.me : chiffres seuls)
  // Adresse figurant sur les emballages de la coopérative, confirmée par le
  // client. À remplacer par l'adresse du domaine une fois celui-ci en service.
  email: "scoopsdernieretrompette@gmail.com",
  /**
   * La coopérative a DEUX implantations. Elles sont séparées par une ligne
   * vide : l'affichage conserve les sauts de ligne et les présente comme deux
   * adresses distinctes, jamais collées l'une à l'autre.
   */
  address: `Siège et usine — Ouidah, Gbena
Rue après la rue face au PADME Ouidah, à 200 m de la voie inter-États

Cotonou — Fifadji Yenawa
C/1868, maison ADJANOHOUN`, // fourni par le client
  city: "Cotonou", // fourni par le client
  country: "Bénin",
  /** Horaires d'ouverture, une ligne par jour ou plage de jours. */
  hours: ["Du lundi au samedi : 08h — 20h"] as string[], // fourni par le client
  /** Lien Google Maps (embed) — laisser vide pour masquer la carte. */
  mapEmbedUrl: "",
} as const;

export const social = {
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  tiktok: "",
} as const;

/** Navigation principale, partagée par le header et le footer. */
export const mainNav = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/produits", label: "Nos produits" },
  { href: "/formations", label: "Formations" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
] as const;

export const legalNav = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
] as const;

/**
 * Missions et valeurs affichées sur l'accueil et la page « À propos ».
 * Formulées à partir du domaine d'activité déclaré de la coopérative,
 * sans affirmer de fait non vérifié (certification, chiffre, partenariat).
 */
export const missions = [
  {
    icon: "sprout",
    title: "Produire",
    text: "Accompagner les membres de la coopérative dans la culture du manioc, du fonio et des autres productions agricoles.",
  },
  {
    icon: "mill",
    title: "Transformer",
    text: "Transformer la récolte en produits finis — gari, tapioca, dérivés du manioc — dans le respect des méthodes locales.",
  },
  {
    icon: "basket",
    title: "Commercialiser",
    text: "Ouvrir des débouchés justes et réguliers aux producteurs, et rendre nos produits accessibles au plus grand nombre.",
  },
  {
    icon: "graduation",
    title: "Former",
    text: "Partager le savoir-faire de la coopérative à travers des formations pratiques ouvertes aux producteurs et transformateurs.",
  },
] as const;

export const values = [
  {
    title: "Authenticité",
    text: "Des produits issus de nos terres, transformés selon des méthodes que nous maîtrisons et assumons.",
  },
  {
    title: "Coopération",
    text: "La force du collectif : ce que chaque membre apporte profite à l'ensemble de la coopérative.",
  },
  {
    title: "Savoir-faire",
    text: "Un métier qui s'apprend, se transmet et se perfectionne à chaque campagne.",
  },
  {
    title: "Proximité",
    text: "Nous connaissons nos producteurs, nos clients et le chemin qui relie les deux.",
  },
] as const;

/** Étapes du savoir-faire, de la parcelle au produit fini. */
export const savoirFaire = [
  {
    step: "01",
    title: "La récolte",
    text: "Les tubercules et céréales sont récoltés à maturité par les producteurs membres de la coopérative.",
  },
  {
    step: "02",
    title: "La préparation",
    text: "Lavage, épluchage et râpage : la matière première est préparée rapidement après récolte pour préserver sa qualité.",
  },
  {
    step: "03",
    title: "La transformation",
    text: "Pressage, fermentation, séchage et torréfaction selon le produit visé — gari, tapioca ou farine.",
  },
  {
    step: "04",
    title: "Le conditionnement",
    text: "Tamisage, contrôle visuel puis mise en sachets ou en sacs, prêts pour la vente.",
  },
] as const;

/** Configuration commerciale — à compléter avec le client. */
export const commerce = {
  /** Code ISO 4217. Change l'affichage des prix sur tout le site. */
  currency: "XOF",
  currencyLabel: "FCFA",
  locale: "fr-FR",
  /** Frais de livraison par défaut, en unité monétaire entière. 0 = gratuit/à définir. */
  defaultDeliveryFee: 0,
  /** Montant minimum de commande. 0 = pas de minimum. */
  minimumOrder: 0,
  /**
   * Moyens de paiement proposés au moment de la commande.
   * Tant que les informations commerciales ne sont pas arrêtées, seuls
   * les modes « hors ligne » sont activés. Voir README → « Ajouter un paiement ».
   */
  paymentMethods: [
    { value: "CASH_ON_DELIVERY", label: "Paiement à la livraison", enabled: true },
    { value: "MOBILE_MONEY", label: "Mobile Money (à la confirmation)", enabled: true },
    { value: "BANK_TRANSFER", label: "Virement bancaire", enabled: false },
    { value: "CARD", label: "Carte bancaire", enabled: false },
  ],
  /** Zone de livraison annoncée au client. */
  deliveryArea: TODO,
} as const;

export type PaymentMethodOption = (typeof commerce.paymentMethods)[number];

/**
 * Textes de la page « À propos ».
 *
 * RÈGLE APPLIQUÉE ICI : ces textes ne s'appuient que sur des éléments
 * vérifiables — la dénomination officielle, les implantations, les produits et
 * leurs emballages, les activités déclarées par la coopérative.
 *
 * Aucune date de création, aucun effectif, aucun volume de production, aucune
 * certification ni aucun partenariat n'y figure : ces informations n'ont pas
 * été communiquées, et les inventer exposerait la coopérative à démentir son
 * propre site.
 *
 * Les passages restant à compléter sont marqués [À RENSEIGNER] et visibles sur
 * le site tant qu'ils ne sont pas remplis. Ils se modifient depuis
 * /admin/parametres, sans toucher au code.
 */
export const about = {
  history: `La Dernière Trompette réunit des transformatrices et des transformateurs du manioc au sein d'une société coopérative. Leur métier commence là où s'arrête celui du planteur : c'est après la récolte, dans le lavage, le pressage, la fermentation, la torréfaction et le séchage, que le tubercule devient gari, tapioca ou farine.

La coopérative est installée à Gbéna-Nord, à Ouidah, où se trouvent son siège et son unité de transformation. Une seconde adresse, à Cotonou, assure la liaison avec les points de vente.

[À RENSEIGNER] L'année de création de la coopérative et les circonstances de sa fondation : qui en a pris l'initiative, et pour répondre à quel besoin.`,

  vision: `Que le manioc cultivé ici soit transformé ici, et qu'il nourrisse ici.

Le Bénin importe une part importante de la farine qu'il consomme. La farine panifiable issue du manioc peut remplacer la farine de blé à quantité égale, dans le pain comme dans la pâtisserie. Chaque sachet vendu est un peu de valeur qui reste au pays, et un revenu de plus pour les membres de la coopérative.`,

  // Texte BRUT : le rendu respecte les sauts de ligne mais n'interprète aucune
  // mise en forme. Des astérisques de gras s'afficheraient tels quels.
  mission: `Nous intervenons sur toute la chaîne, de la parcelle au point de vente.

Produire : accompagner les membres dans la culture du manioc et des autres productions agricoles.

Transformer : conduire chaque étape dans notre unité, pour maîtriser la qualité du produit fini plutôt que la subir.

Commercialiser : conditionner, étiqueter et distribuer nos produits sous notre propre marque, afin que la valeur revienne à ceux qui l'ont créée.

Former : transmettre ce savoir-faire aux producteurs et transformateurs qui souhaitent se perfectionner.`,
} as const;
