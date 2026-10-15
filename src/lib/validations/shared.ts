import { z } from "zod";

/**
 * Briques de validation partagées.
 *
 * Les mêmes schémas servent au navigateur et au serveur. La validation côté
 * client n'est qu'un confort : celle qui compte est exécutée dans la Server
 * Action, car une requête peut arriver sans jamais passer par notre formulaire.
 */

/** Nettoie les espaces parasites avant toute vérification de longueur. */
export const trimmed = z.string().trim();

export const requiredText = (label: string, max = 255) =>
  trimmed
    .min(1, `${label} est obligatoire.`)
    .max(max, `${label} ne doit pas dépasser ${max} caractères.`);

/**
 * Champ texte facultatif.
 *
 * Normalise une saisie vide en `undefined`, afin que l'appelant l'enregistre
 * en `null` plutôt qu'en chaîne vide. Sans cela, la base contiendrait deux
 * représentations de « pas de valeur » — `null` et `""` — et chaque test
 * d'affichage devrait vérifier les deux.
 */
export const optionalText = (max = 255) =>
  trimmed
    .max(max, `Ce champ ne doit pas dépasser ${max} caractères.`)
    .optional()
    .transform((value) => (value === undefined || value === "" ? undefined : value));

export const emailSchema = trimmed
  .toLowerCase()
  .pipe(z.email("Adresse email invalide."))
  .pipe(z.string().max(200, "Adresse email trop longue."));

export const optionalEmail = emailSchema.optional().or(z.literal("").transform(() => undefined));

/**
 * Téléphone : volontairement permissif.
 * Les formats varient d'un pays à l'autre et un contrôle trop strict rejette
 * des numéros valides. On vérifie seulement qu'il y a assez de chiffres pour
 * qu'un rappel soit possible.
 */
export const phoneSchema = trimmed
  .min(6, "Numéro de téléphone trop court.")
  .max(30, "Numéro de téléphone trop long.")
  .refine((value) => (value.match(/\d/g) ?? []).length >= 6, {
    message: "Le numéro doit contenir au moins 6 chiffres.",
  });

export const optionalPhone = phoneSchema.optional().or(z.literal("").transform(() => undefined));

/**
 * Montant monétaire saisi dans l'administration.
 * Accepte la virgule décimale française et les espaces de milliers, et rejette
 * les valeurs négatives ou absurdes.
 */
export const priceSchema = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "number") return value;
    const cleaned = value.replace(/\s/g, "").replace(",", ".");
    return cleaned === "" ? null : Number(cleaned);
  })
  .refine((value) => value === null || (Number.isFinite(value) && value >= 0), {
    message: "Le prix doit être un nombre positif.",
  })
  .refine((value) => value === null || value <= 100_000_000, {
    message: "Le prix saisi est anormalement élevé.",
  })
  .transform((value) => (value === null ? null : Math.round(value)));

export const optionalPrice = priceSchema.nullable().optional();

/**
 * Case à cocher d'un formulaire HTML.
 *
 * Point subtil : une case DÉCOCHÉE n'est pas envoyée du tout par le navigateur
 * — la clé est absente du FormData, elle ne vaut pas "off". Le schéma doit donc
 * être `.optional()` : une union qui contient seulement `z.undefined()` accepte
 * la valeur `undefined` mais continue d'exiger que la CLÉ soit présente, et
 * rejetterait donc toute case laissée décochée.
 */
export const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
  .optional()
  .transform((value) => value === "on" || value === "true" || value === true);

export const positiveInt = (label: string) =>
  z.coerce
    .number({ message: `${label} doit être un nombre.` })
    .int(`${label} doit être un nombre entier.`)
    .min(0, `${label} ne peut pas être négatif.`);

export const optionalPositiveInt = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "number") return value;
    return value.trim() === "" ? null : Number(value);
  })
  .refine((value) => value === null || (Number.isInteger(value) && value >= 0), {
    message: "Valeur invalide : un nombre entier positif est attendu.",
  });

/**
 * Champ piège anti-spam : doit rester vide.
 * Le message est neutre — inutile d'expliquer le mécanisme à un robot.
 */
export const honeypot = z
  .string()
  .max(0, "Requête invalide.")
  .optional()
  .or(z.literal("").transform(() => undefined));

/** Liste saisie une ligne par élément dans un <textarea>. */
export const linesToArray = trimmed
  .transform((value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().max(500)).max(50, "50 lignes au maximum."));

/** Résultat uniforme renvoyé par toutes les Server Actions de formulaire. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Erreurs par champ, telles que produites par Zod. */
  errors?: Record<string, string[]>;
};

export const idleState: ActionState = { status: "idle" };

/** Convertit une erreur Zod en ActionState exploitable par le formulaire. */
export function zodErrorToState(error: z.ZodError, message?: string): ActionState {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (errors[key] ??= []).push(issue.message);
  }

  return {
    status: "error",
    message: message ?? "Certains champs doivent être corrigés.",
    errors,
  };
}
