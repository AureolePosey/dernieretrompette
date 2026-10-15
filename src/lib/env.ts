import "server-only";

/**
 * Validation des variables d'environnement.
 *
 * On échoue au démarrage plutôt qu'au premier appel : une variable manquante
 * doit casser le build, pas une commande client à 2h du matin.
 *
 * Les variables OPTIONNELLES sont volontairement tolérées : le site doit
 * fonctionner sans Cloudinary (stockage local) et sans Resend (pas d'email),
 * afin qu'un développement local ne nécessite aucun compte tiers.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Variable d'environnement manquante : ${name}. ` +
        `Copiez .env.example vers .env et renseignez-la.`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

/**
 * Le secret de session doit être long : un JWT signé HS256 avec un secret
 * court est brute-forçable hors ligne.
 */
function requiredSecret(name: string, minLength = 32): string {
  const value = required(name);
  if (value.length < minLength) {
    throw new Error(
      `${name} doit contenir au moins ${minLength} caractères. ` +
        `Générez-en un avec : openssl rand -base64 48`,
    );
  }
  return value;
}

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  SESSION_SECRET: isBuildPhase
    ? (process.env.SESSION_SECRET ?? "build-time-placeholder-not-used-at-runtime")
    : requiredSecret("SESSION_SECRET"),

  NODE_ENV: process.env.NODE_ENV ?? "development",
  /** URL publique canonique, utilisée par le SEO (sitemap, Open Graph). */
  SITE_URL:
    optional("NEXT_PUBLIC_SITE_URL") ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),

  // --- Stockage des images (optionnel : disque local si absent) -------------
  CLOUDINARY_CLOUD_NAME: optional("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: optional("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: optional("CLOUDINARY_API_SECRET"),

  // --- Email (optionnel : notifications désactivées si absent) --------------
  RESEND_API_KEY: optional("RESEND_API_KEY"),
  EMAIL_FROM: optional("EMAIL_FROM"),
  /** Destinataire des notifications de commande et de contact. */
  NOTIFY_EMAIL: optional("NOTIFY_EMAIL"),
} as const;

export const isProduction = env.NODE_ENV === "production";

/** Vrai si un stockage d'images distant est configuré. */
export const hasCloudinary = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

/** Vrai si les notifications par email peuvent être envoyées. */
export const hasMailer = Boolean(env.RESEND_API_KEY && env.EMAIL_FROM && env.NOTIFY_EMAIL);
