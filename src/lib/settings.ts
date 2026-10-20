import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { SETTING_KEYS, type SettingKey } from "@/lib/settings-fields";
import { about, contact, site, social, TODO } from "@content/site";

/**
 * Paramètres du site : valeurs par défaut du code, surchargées par la base.
 *
 * Le client peut renseigner ses coordonnées depuis /admin/parametres, sans
 * redéploiement et sans toucher au code ; content/site.ts reste la référence
 * des valeurs initiales.
 *
 * La DESCRIPTION des champs vit dans lib/settings-fields.ts, volontairement
 * séparé : ce module-ci est serveur uniquement (Prisma), et le formulaire
 * d'administration est un composant client.
 *
 * `cache()` déduplique la lecture sur la durée d'un rendu : l'en-tête, le pied
 * de page et le corps de la page partagent une seule requête SQL.
 */

export { SETTING_KEYS };
export type { SettingKey };

export type SiteSettings = {
  legalName: string;
  heroTitle: string;
  heroSubtitle: string;
  shortDescription: string;
  metaDescription: string;
  foundedYear: string;
  phone: string;
  phoneSecondary: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  hours: string[];
  mapEmbedUrl: string;
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
  deliveryArea: string;
  aboutHistory: string;
  aboutVision: string;
  aboutMission: string;
};

/**
 * Lecture brute des surcharges.
 *
 * En cas d'indisponibilité de la base, on retourne une map vide plutôt que de
 * faire échouer le rendu : le site doit rester consultable avec ses valeurs par
 * défaut même si PostgreSQL est momentanément injoignable — et ces valeurs
 * s'affichent dans l'en-tête et le pied de page de TOUTES les pages.
 */
const readOverrides = cache(async (): Promise<Map<string, string>> => {
  try {
    const rows = await prisma.siteSetting.findMany();
    return new Map(rows.map((row) => [row.key, row.value]));
  } catch (cause) {
    console.error("[settings] lecture impossible, valeurs par défaut utilisées", cause);
    return new Map();
  }
});

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const overrides = await readOverrides();

  /** Surcharge si elle existe et n'est pas vide, sinon valeur par défaut. */
  const pick = (key: SettingKey, fallback: string): string => {
    const value = overrides.get(key);
    return value !== undefined && value.trim() !== "" ? value : fallback;
  };

  const hoursRaw = pick("contact.hours", contact.hours.join("\n"));

  return {
    legalName: pick("site.legalName", site.legalName),
    heroTitle: pick("site.heroTitle", site.heroTitle),
    heroSubtitle: pick("site.heroSubtitle", site.heroSubtitle),
    shortDescription: pick("site.shortDescription", site.shortDescription),
    metaDescription: pick("site.metaDescription", site.metaDescription),
    foundedYear: pick("site.foundedYear", site.foundedYear),
    phone: pick("contact.phone", contact.phone),
    phoneSecondary: pick("contact.phoneSecondary", contact.phoneSecondary),
    whatsapp: pick("contact.whatsapp", contact.whatsapp),
    email: pick("contact.email", contact.email),
    address: pick("contact.address", contact.address),
    city: pick("contact.city", contact.city),
    country: pick("contact.country", contact.country),
    hours: hoursRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    mapEmbedUrl: pick("contact.mapEmbedUrl", contact.mapEmbedUrl),
    social: {
      facebook: pick("social.facebook", social.facebook),
      instagram: pick("social.instagram", social.instagram),
      linkedin: pick("social.linkedin", social.linkedin),
      youtube: pick("social.youtube", social.youtube),
      tiktok: pick("social.tiktok", social.tiktok),
    },
    deliveryArea: pick("commerce.deliveryArea", TODO),
    aboutHistory: pick("about.history", about.history),
    aboutVision: pick("about.vision", about.vision),
    aboutMission: pick("about.mission", about.mission),
  };
});

/** Valeurs actuellement en base, pour pré-remplir le formulaire d'administration. */
export async function getRawSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}
