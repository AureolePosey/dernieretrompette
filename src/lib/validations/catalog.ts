import { z } from "zod";
import {
  checkbox,
  linesToArray,
  optionalPositiveInt,
  optionalPrice,
  optionalText,
  requiredText,
  trimmed,
} from "./shared";

/**
 * Validation des contenus saisis dans l'administration.
 *
 * Ces schémas sont appliqués côté serveur avant TOUTE écriture en base. Même
 * si les formulaires de l'administration sont derrière authentification, un
 * champ mal saisi ne doit pas pouvoir corrompre les données publiques.
 */

// ---------------------------------------------------------------------------
// CATÉGORIES
// ---------------------------------------------------------------------------

export const categorySchema = z.object({
  name: requiredText("Le nom de la catégorie", 100),
  description: optionalText(600),
  imageUrl: optionalText(600),
  position: optionalPositiveInt,
});

// ---------------------------------------------------------------------------
// PRODUITS
// ---------------------------------------------------------------------------

/** Une variante saisie dans le formulaire produit. */
export const variantSchema = z.object({
  id: optionalText(40),
  label: requiredText("Le format", 80),
  price: optionalPrice,
  sku: optionalText(60),
  inStock: checkbox,
});

export const productSchema = z.object({
  name: requiredText("Le nom du produit", 150),
  categoryId: optionalText(40),
  shortDesc: optionalText(300),
  description: optionalText(6000),
  extraInfo: optionalText(3000),
  price: optionalPrice,
  unit: optionalText(60),
  weightGrams: optionalPositiveInt,
  inStock: checkbox,
  featured: checkbox,
  published: checkbox,
  position: optionalPositiveInt,
  metaTitle: optionalText(70),
  metaDescription: optionalText(170),
});

export type ProductInput = z.infer<typeof productSchema>;

/**
 * Image de produit.
 * Le texte alternatif est OBLIGATOIRE : c'est la seule garantie que le
 * catalogue restera accessible aux lecteurs d'écran et correctement indexé,
 * et l'imposer à la saisie est le seul moment où on peut encore l'obtenir.
 */
export const productImageSchema = z.object({
  productId: requiredText("Le produit", 40),
  url: requiredText("L'adresse de l'image", 600),
  alt: requiredText("Le texte alternatif", 200),
});

// ---------------------------------------------------------------------------
// ACTUALITÉS
// ---------------------------------------------------------------------------

export const newsSchema = z.object({
  title: requiredText("Le titre", 180),
  excerpt: optionalText(400),
  content: trimmed
    .min(20, "Le contenu doit contenir au moins 20 caractères.")
    .max(30000, "Le contenu est trop long (30 000 caractères maximum)."),
  coverUrl: optionalText(600),
  coverAlt: optionalText(200),
  category: optionalText(60),
  author: optionalText(120),
  published: checkbox,
});

export type NewsInput = z.infer<typeof newsSchema>;

// ---------------------------------------------------------------------------
// FORMATIONS
// ---------------------------------------------------------------------------

/** Date saisie au format AAAA-MM-JJ ; vide = non planifiée. */
const optionalDate = trimmed
  .optional()
  .transform((value) => (value && value !== "" ? new Date(value) : null))
  .refine((value) => value === null || !Number.isNaN(value.getTime()), {
    message: "Date invalide.",
  });

export const trainingSchema = z
  .object({
    title: requiredText("Le titre", 180),
    summary: optionalText(400),
    description: optionalText(8000),
    objectives: linesToArray,
    program: linesToArray,
    coverUrl: optionalText(600),
    coverAlt: optionalText(200),
    durationLabel: optionalText(80),
    startDate: optionalDate,
    endDate: optionalDate,
    location: optionalText(200),
    price: optionalPrice,
    seats: optionalPositiveInt,
    conditions: optionalText(2000),
    published: checkbox,
    position: optionalPositiveInt,
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    { message: "La date de fin doit suivre la date de début.", path: ["endDate"] },
  );

export type TrainingInput = z.infer<typeof trainingSchema>;
