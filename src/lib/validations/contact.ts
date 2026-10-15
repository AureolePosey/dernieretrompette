import { z } from "zod";
import { honeypot, optionalPhone, requiredText, trimmed } from "./shared";

/**
 * Formulaire de contact.
 *
 * Limites de longueur strictes : elles protègent l'affichage de
 * l'administration autant qu'elles évitent qu'un robot n'insère un pavé de
 * spam de plusieurs mégaoctets en base.
 */
export const contactSchema = z.object({
  name: requiredText("Le nom", 120),
  email: trimmed
    .toLowerCase()
    .pipe(z.email("Adresse email invalide."))
    .pipe(z.string().max(200, "Adresse email trop longue.")),
  phone: optionalPhone,
  subject: requiredText("Le sujet", 150),
  message: trimmed
    .min(10, "Votre message doit contenir au moins 10 caractères.")
    .max(4000, "Votre message ne doit pas dépasser 4000 caractères."),
  website: honeypot,
});

export type ContactInput = z.infer<typeof contactSchema>;
