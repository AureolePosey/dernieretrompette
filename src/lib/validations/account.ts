import { z } from "zod";
import { requiredText, trimmed } from "./shared";

/**
 * Changement de mot de passe administrateur.
 *
 * Le mot de passe actuel est exigé : sans lui, un poste laissé déverrouillé
 * quelques minutes suffirait à prendre définitivement la main sur le compte.
 *
 * La longueur minimale est fixée à 12 caractères plutôt qu'à 8, et aucune
 * règle de composition n'est imposée. C'est la recommandation actuelle de
 * l'ANSSI comme du NIST : exiger majuscules, chiffres et symboles pousse à des
 * mots de passe courts et prévisibles (« Motdepasse1! »), là où une phrase
 * longue résiste bien mieux.
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: requiredText("Le mot de passe actuel", 200),
    newPassword: trimmed
      .min(12, "Le nouveau mot de passe doit contenir au moins 12 caractères.")
      .max(200, "Le mot de passe est trop long."),
    confirmPassword: requiredText("La confirmation", 200),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien.",
    path: ["newPassword"],
  });

/** Modification du nom affiché dans l'administration. */
export const profileSchema = z.object({
  name: requiredText("Le nom", 120),
});
